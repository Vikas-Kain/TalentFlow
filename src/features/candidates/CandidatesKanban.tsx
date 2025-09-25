import { useState, useMemo, type ReactNode, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    type DragEndEvent,
    type DragStartEvent,
    type DragOverEvent,
    DragOverlay,
    useDroppable,
} from '@dnd-kit/core';
import {
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Link } from 'react-router-dom';
import { EyeIcon, PencilIcon } from '@heroicons/react/24/outline';
import { api, type Candidate } from '../../lib/api';
import toast from 'react-hot-toast';

interface CandidatesKanbanProps {
    candidates: Candidate[];
}

const stages = [
    { id: 'applied', name: 'Applied' },
    { id: 'screen', name: 'Screen' },
    { id: 'tech', name: 'Tech' },
    { id: 'final', name: 'Final' },
    { id: 'hired', name: 'Hired' },
    { id: 'rejected', name: 'Rejected' },
];

function CandidateCard({ candidate, isOverlay = false }: { candidate: Candidate, isOverlay?: boolean }) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: candidate.id, data: { type: 'Candidate', candidate } });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    const cardClasses = `bg-white p-3 rounded-lg shadow-sm border border-gray-200 transition-shadow ${isOverlay ? 'shadow-xl cursor-grabbing' : 'hover:shadow-md cursor-grab active:cursor-grabbing'}`;

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes}
            {...listeners}
            className={cardClasses}
        >
            <div className="flex items-start justify-between">
                <div className="min-w-0 flex-1">
                    <h4 className="text-sm font-medium text-gray-900 truncate">
                        {candidate.name}
                    </h4>
                    <p className="text-xs text-gray-500 truncate mt-1">
                        {candidate.email}
                    </p>
                    {candidate.phone && (
                        <p className="text-xs text-gray-500 truncate">
                            {candidate.phone}
                        </p>
                    )}
                    <p className="text-xs text-gray-400 mt-2">
                        Applied {new Date(candidate.appliedAt).toLocaleDateString()}
                    </p>
                </div>
                <div className="flex items-center space-x-1 ml-2">
                    <Link
                        to={`/candidates/${candidate.id}`}
                        className="p-1 text-gray-400 hover:text-gray-600 rounded hover:bg-gray-100"
                        title="View details"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <EyeIcon className="h-3 w-3" />
                    </Link>
                    <button
                        className="p-1 text-gray-400 hover:text-gray-600 rounded hover:bg-gray-100"
                        title="Edit candidate"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <PencilIcon className="h-3 w-3" />
                    </button>
                </div>
            </div>
        </div>
    );
}

function DroppableColumn({ id, children, isOver }: { id: string; children: ReactNode, isOver: boolean }) {
    const { setNodeRef } = useDroppable({ id });
    return (
        <div
            ref={setNodeRef}
            className={`bg-gray-50 rounded-lg p-4 transition-colors ${isOver ? 'ring-2 ring-indigo-400 bg-indigo-50/50' : ''}`}
        >
            {children}
        </div>
    );
}

export default function CandidatesKanban({ candidates }: CandidatesKanbanProps) {
    const queryClient = useQueryClient();
    const [internalCandidates, setInternalCandidates] = useState<Candidate[]>([]);
    const [activeCandidate, setActiveCandidate] = useState<Candidate | null>(null);

    useEffect(() => {
        setInternalCandidates(candidates);
    }, [candidates]);

    const candidatesByStage = useMemo(() => {
        return stages.reduce((acc, stage) => {
            acc[stage.id] = internalCandidates.filter(c => c.currentStage === stage.id);
            return acc;
        }, {} as Record<string, Candidate[]>);
    }, [internalCandidates]);

    const sensors = useSensors(
        useSensor(PointerSensor, {
            activationConstraint: { distance: 8 },
        }),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const updateCandidateMutation = useMutation<
        Candidate,
        Error,
        { id: string; candidate: Partial<Candidate> },
        { previousCandidates?: Candidate[] }
    >({
        mutationFn: ({ id, candidate }) => api.updateCandidate(id, { ...candidate, stage: candidate.currentStage as any }),
        onMutate: async ({ id, candidate }) => {
            await queryClient.cancelQueries({ queryKey: ['candidates'] });
            const previousCandidates = queryClient.getQueryData<Candidate[]>(['candidates']);

            // Optimistically update the cache
            queryClient.setQueryData<any>(['candidates'], (old: any) => {
                if (!old) return old;
                const list = Array.isArray(old) ? old : old.data;
                const updated = list.map((c: Candidate) => c.id === id ? { ...c, ...candidate } : c);
                return Array.isArray(old) ? updated : { ...old, data: updated };
            });
            return { previousCandidates };
        },
        onError: (_err, _vars, context) => {
            if (context?.previousCandidates) {
                queryClient.setQueryData(['candidates'], context.previousCandidates);
            }
            toast.error('Failed to update candidate stage.');
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ['candidates'] });
        },
    });

    const handleDragStart = (event: DragStartEvent) => {
        const { active } = event;
        const candidate = internalCandidates.find(c => c.id === active.id);
        if (candidate) {
            setActiveCandidate(candidate);
        }
    };

    const handleDragOver = (event: DragOverEvent) => {
        const { active, over } = event;
        if (!over || active.id === over.id) return;

        const activeId = active.id.toString();
        const overId = over.id.toString();

        const activeContainer = active.data.current?.sortable.containerId;
        const overContainer = over.data.current?.sortable?.containerId ?? overId;

        if (activeContainer && overContainer && activeContainer !== overContainer) {
            setInternalCandidates(prev => {
                const activeIndex = prev.findIndex(c => c.id === activeId);
                if (activeIndex === -1) return prev;
                const newItems = [...prev];
                newItems[activeIndex] = { ...newItems[activeIndex], currentStage: overContainer as Candidate['currentStage'] };
                return newItems;
            });
        }
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        setActiveCandidate(null);

        if (!over) return;

        const originalStage = active.data.current?.candidate.currentStage;
        const newStage = over.data.current?.sortable?.containerId ?? over.id;

        if (originalStage !== newStage) {
            const candidateId = active.id.toString();
            // Trigger the mutation only when the stage has changed
            updateCandidateMutation.mutate({
                id: candidateId,
                candidate: { currentStage: newStage as Candidate['currentStage'] },
            });
        }
    };

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDragEnd={handleDragEnd}
            onDragCancel={() => setActiveCandidate(null)}
        >
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
                {stages.map((stage) => (
                    <DroppableColumn key={stage.id} id={stage.id} isOver={false /* Placeholder */}>
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="text-sm font-medium text-gray-900">{stage.name}</h3>
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-white text-gray-600">
                                {candidatesByStage[stage.id]?.length || 0}
                            </span>
                        </div>
                        <SortableContext
                            id={stage.id}
                            items={candidatesByStage[stage.id]?.map(c => c.id) || []}
                            strategy={verticalListSortingStrategy}
                        >
                            <div className="space-y-2 min-h-[200px]">
                                {candidatesByStage[stage.id]?.map((candidate) => (
                                    <CandidateCard key={candidate.id} candidate={candidate} />
                                ))}
                                {(!candidatesByStage[stage.id] || candidatesByStage[stage.id].length === 0) && (
                                    <div className="border-2 border-dashed border-gray-200 rounded-lg text-center py-8 text-gray-400 text-sm">
                                        Drop here
                                    </div>
                                )}
                            </div>
                        </SortableContext>
                    </DroppableColumn>
                ))}
            </div>
            <DragOverlay>
                {activeCandidate ? <CandidateCard candidate={activeCandidate} isOverlay /> : null}
            </DragOverlay>
        </DndContext>
    );
}
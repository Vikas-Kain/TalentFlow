import { useState, useMemo, type ReactNode } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import {
    DndContext,
    closestCenter,
    PointerSensor,
    useSensor,
    useSensors,
    type DragStartEvent,
    type DragEndEvent,
    DragOverlay,
    useDroppable,
} from '@dnd-kit/core';
import {
    SortableContext,
    useSortable,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { EyeIcon } from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';
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

// Define the shape of the API response object for type safety in React Query cache
interface CandidatesResponse {
    data: Candidate[];
}

function CandidateCard({ candidate, isOverlay = false }: { candidate: Candidate, isOverlay?: boolean }) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({
        id: candidate.id,
        // Add explicit data for better event handling
        data: { type: 'item', candidate },
    });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging && !isOverlay ? 0.5 : 1,
    };

    const cardClasses = `bg-white p-3 rounded-lg shadow-sm border border-gray-200 transition-shadow ${isOverlay ? 'shadow-xl cursor-grabbing' : 'hover:shadow-md cursor-grab active:cursor-grabbing'}`;

    return (
        <div ref={setNodeRef} style={style} {...attributes} {...listeners} className={cardClasses}>
            <div className="flex items-start justify-between">
                <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-800 truncate">{candidate.name}</p>
                    <p className="text-xs text-gray-500 truncate">{candidate.email}</p>
                </div>
                <div className="flex-shrink-0 ml-2">
                    <Link
                        to={`/candidates/${candidate.id}`}
                        className="p-1 text-gray-400 hover:text-gray-600 rounded hover:bg-gray-100"
                        title="View candidate details"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <EyeIcon className="h-3 w-3" />
                    </Link>
                </div>
            </div>
        </div>
    );
}

function Column({ id, title, children, count, itemIds }: { id: string, title: string, children: ReactNode, count: number, itemIds: string[] }) {
    const { setNodeRef } = useDroppable({
        id,
        // Add explicit data to identify this as a container
        data: { type: 'container' },
    });

    return (
        <div className="bg-gray-50 rounded-lg p-4 flex flex-col">
            <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-medium text-gray-900">{title}</h3>
                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-white text-gray-600">
                    {count}
                </span>
            </div>
            <SortableContext id={id} items={itemIds} strategy={verticalListSortingStrategy}>
                <div ref={setNodeRef} className="space-y-2 min-h-[200px] flex-grow">
                    {children}
                    {count === 0 && (
                        <div className="border-2 border-dashed border-gray-200 rounded-lg h-full flex items-center justify-center text-gray-400 text-sm">
                            Drop here
                        </div>
                    )}
                </div>
            </SortableContext>
        </div>
    );
}

export default function CandidatesKanban({ candidates }: CandidatesKanbanProps) {
    const queryClient = useQueryClient();
    const [activeCandidate, setActiveCandidate] = useState<Candidate | null>(null);

    const candidatesByStage = useMemo(() => {
        return stages.reduce((acc, stage) => {
            acc[stage.id] = candidates.filter(c => c.currentStage === stage.id);
            return acc;
        }, {} as Record<string, Candidate[]>);
    }, [candidates]);

    const sensors = useSensors(useSensor(PointerSensor, {
        activationConstraint: { distance: 8 },
    }));

    const updateCandidateMutation = useMutation<
        Candidate,
        Error,
        { id: string; candidate: Partial<Candidate> },
        { previousCandidatesResponse?: CandidatesResponse }
    >({
        mutationFn: ({ id, candidate }) => api.updateCandidate(id, candidate),
        onMutate: async ({ id, candidate }) => {
            await queryClient.cancelQueries({ queryKey: ['candidates'] });
            const previousCandidatesResponse = queryClient.getQueryData<CandidatesResponse>(['candidates']);

            queryClient.setQueryData<CandidatesResponse>(['candidates'], (old) => {
                if (!old || !Array.isArray(old.data)) return old;
                const updatedData = old.data.map(c =>
                    c.id === id ? { ...c, ...candidate } : c
                );
                return { ...old, data: updatedData };
            });

            return { previousCandidatesResponse };
        },
        onError: (err, _vars, context) => {
            if (context?.previousCandidatesResponse) {
                queryClient.setQueryData(['candidates'], context.previousCandidatesResponse);
            }
            toast.error(`Failed to move candidate: ${err.message}`);
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ['candidates'] });
        },
    });

    const handleDragStart = (event: DragStartEvent) => {
        const candidate = event.active.data.current?.candidate as Candidate;
        setActiveCandidate(candidate);
    };

    const handleDragEnd = (event: DragEndEvent) => {
        setActiveCandidate(null);
        const { active, over } = event;

        if (!over) return;

        const activeContainerId = active.data.current?.sortable?.containerId;

        // Rectified logic to reliably find the destination container
        let overContainerId;
        if (over.data.current?.type === 'container') {
            // Dropped directly on a column
            overContainerId = over.id.toString();
        } else {
            // Dropped on a card, so get its parent column
            overContainerId = over.data.current?.sortable?.containerId;
        }

        if (!activeContainerId || !overContainerId || activeContainerId === overContainerId) {
            return;
        }

        const candidateId = active.id.toString();
        const newStage = overContainerId as Candidate['currentStage'];

        updateCandidateMutation.mutate({
            id: candidateId,
            candidate: { currentStage: newStage },
        });
    };

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onDragCancel={() => setActiveCandidate(null)}
        >
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
                {stages.map((stage) => {
                    const stageCandidates = candidatesByStage[stage.id] || [];
                    return (
                        <Column
                            key={stage.id}
                            id={stage.id}
                            title={stage.name}
                            count={stageCandidates.length}
                            itemIds={stageCandidates.map(c => c.id)}
                        >
                            {stageCandidates.map((candidate) => (
                                <CandidateCard key={candidate.id} candidate={candidate} />
                            ))}
                        </Column>
                    );
                })}
            </div>
            <DragOverlay>
                {activeCandidate ? <CandidateCard candidate={activeCandidate} isOverlay /> : null}
            </DragOverlay>
        </DndContext>
    );
}
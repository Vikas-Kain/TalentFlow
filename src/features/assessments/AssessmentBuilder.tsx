import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    PlusIcon,
    TrashIcon,
    Bars3Icon,
    EyeIcon,
    DocumentTextIcon
} from '@heroicons/react/24/outline';
import {
    DndContext,
    closestCenter,
    KeyboardSensor,
    PointerSensor,
    useSensor,
    useSensors,
    type DragEndEvent,
} from '@dnd-kit/core';
import {
    arrayMove,
    SortableContext,
    sortableKeyboardCoordinates,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { api, type Assessment, type AssessmentSection, type AssessmentQuestion } from '../../lib/api';
import QuestionBuilder from './QuestionBuilder.tsx';
import AssessmentPreview from './AssessmentPreview.tsx';
import toast from 'react-hot-toast';

const questionTypes = [
    { id: 'single-choice', name: 'Single Choice', icon: '○' },
    { id: 'multi-choice', name: 'Multiple Choice', icon: '☐' },
    { id: 'text', name: 'Short Text', icon: 'T' },
    { id: 'long-text', name: 'Long Text', icon: '¶' },
    { id: 'numeric', name: 'Numeric', icon: '#' },
    { id: 'file', name: 'File Upload', icon: '📎' },
];

function SectionCard({
    section,
    onUpdate,
    onDelete,
    onAddQuestion
}: {
    section: AssessmentSection;
    onUpdate: (section: AssessmentSection) => void;
    onDelete: (sectionId: string) => void;
    onAddQuestion: (sectionId: string, questionType: string) => void;
}) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: section.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    const [isExpanded, setIsExpanded] = useState(true);

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={`bg-white border border-gray-200 rounded-lg shadow-sm ${isDragging ? 'shadow-lg' : ''
                }`}
        >
            <div className="p-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3 flex-1">
                        <div
                            {...attributes}
                            {...listeners}
                            className="cursor-grab active:cursor-grabbing"
                        >
                            <Bars3Icon className="h-5 w-5 text-gray-400" />
                        </div>
                        <button
                            onClick={() => setIsExpanded(!isExpanded)}
                            className="flex items-center space-x-2 flex-1 text-left"
                        >
                            <DocumentTextIcon className="h-5 w-5 text-gray-400" />
                            <div>
                                <h3 className="text-lg font-medium text-gray-900">
                                    {section.title || 'Untitled Section'}
                                </h3>
                                {section.description && (
                                    <p className="text-sm text-gray-500">{section.description}</p>
                                )}
                            </div>
                        </button>
                    </div>
                    <div className="flex items-center space-x-2">
                        <button
                            onClick={() => onDelete(section.id)}
                            className="p-2 text-red-400 hover:text-red-600 rounded-md hover:bg-red-50"
                        >
                            <TrashIcon className="h-4 w-4" />
                        </button>
                    </div>
                </div>

                {isExpanded && (
                    <div className="mt-4 space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Section Title
                            </label>
                            <input
                                type="text"
                                value={section.title}
                                onChange={(e) => onUpdate({ ...section, title: e.target.value })}
                                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                                placeholder="Enter section title"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Section Description
                            </label>
                            <textarea
                                value={section.description || ''}
                                onChange={(e) => onUpdate({ ...section, description: e.target.value })}
                                rows={2}
                                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                                placeholder="Enter section description (optional)"
                            />
                        </div>

                        {/* Questions */}
                        <div>
                            <div className="flex items-center justify-between mb-3">
                                <h4 className="text-sm font-medium text-gray-700">Questions</h4>
                                <div className="flex space-x-1">
                                    {questionTypes.map((type) => (
                                        <button
                                            key={type.id}
                                            onClick={() => onAddQuestion(section.id, type.id)}
                                            className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                                            title={type.name}
                                        >
                                            {type.icon} {type.name}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-3">
                                {section.questions.map((question) => (
                                    <QuestionBuilder
                                        key={question.id}
                                        question={question}
                                        onUpdate={(updatedQuestion) => {
                                            const updatedQuestions = section.questions.map(q =>
                                                q.id === question.id ? updatedQuestion : q
                                            );
                                            onUpdate({ ...section, questions: updatedQuestions });
                                        }}
                                        onDelete={() => {
                                            const updatedQuestions = section.questions.filter(q => q.id !== question.id);
                                            onUpdate({ ...section, questions: updatedQuestions });
                                        }}
                                    />
                                ))}
                                {section.questions.length === 0 && (
                                    <div className="text-center py-4 text-gray-500 text-sm">
                                        No questions yet. Add a question to get started.
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default function AssessmentBuilder() {
    const { jobId } = useParams<{ jobId: string }>();
    const queryClient = useQueryClient();
    const [showPreview, setShowPreview] = useState(false);

    const { data: assessment, isLoading } = useQuery({
        queryKey: ['assessment', jobId],
        queryFn: () => api.getAssessment(jobId!),
        enabled: !!jobId,
    });

    const saveMutation = useMutation({
        mutationFn: (assessmentData: Partial<Assessment>) =>
            api.saveAssessment(jobId!, assessmentData),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['assessment', jobId] });
            toast.success('Assessment saved successfully');
        },
        onError: (error: any) => {
            toast.error('Failed to save assessment');
            console.error('Save error:', error);
        },
    });

    const [localAssessment, setLocalAssessment] = useState<Assessment | null>(null);

    useEffect(() => {
        if (assessment) {
            setLocalAssessment(assessment);
        } else {
            // Create a new assessment if none exists
            setLocalAssessment({
                id: `assessment-${Date.now()}`,
                jobId: jobId!,
                title: 'New Assessment',
                description: '',
                sections: [],
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            });
        }
    }, [assessment, jobId]);

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleSave = () => {
        if (localAssessment) {
            saveMutation.mutate(localAssessment);
        }
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;

        if (over && active.id !== over.id && localAssessment) {
            const oldIndex = localAssessment.sections.findIndex(s => s.id === active.id);
            const newIndex = localAssessment.sections.findIndex(s => s.id === over.id);

            const reorderedSections = arrayMove(localAssessment.sections, oldIndex, newIndex);
            setLocalAssessment({
                ...localAssessment,
                sections: reorderedSections.map((section, index) => ({
                    ...section,
                    order: index
                }))
            });
        }
    };

    const addSection = () => {
        if (localAssessment) {
            const newSection: AssessmentSection = {
                id: `section-${Date.now()}`,
                title: 'New Section',
                description: '',
                order: localAssessment.sections.length,
                questions: []
            };
            setLocalAssessment({
                ...localAssessment,
                sections: [...localAssessment.sections, newSection]
            });
        }
    };

    const updateSection = (updatedSection: AssessmentSection) => {
        if (localAssessment) {
            setLocalAssessment({
                ...localAssessment,
                sections: localAssessment.sections.map(s =>
                    s.id === updatedSection.id ? updatedSection : s
                )
            });
        }
    };

    const deleteSection = (sectionId: string) => {
        if (localAssessment) {
            setLocalAssessment({
                ...localAssessment,
                sections: localAssessment.sections.filter(s => s.id !== sectionId)
            });
        }
    };

    const addQuestion = (sectionId: string, questionType: string) => {
        if (localAssessment) {
            const section = localAssessment.sections.find(s => s.id === sectionId);
            if (section) {
                const newQuestion: AssessmentQuestion = {
                    id: `question-${Date.now()}`,
                    type: questionType as AssessmentQuestion['type'],
                    title: 'New Question',
                    description: '',
                    required: false,
                    order: section.questions.length,
                    options: questionType === 'single-choice' || questionType === 'multi-choice' ? ['Option 1', 'Option 2'] : undefined,
                    min: questionType === 'numeric' ? 0 : undefined,
                    max: questionType === 'numeric' ? 100 : undefined,
                    maxLength: questionType === 'text' || questionType === 'long-text' ? 500 : undefined,
                };

                const updatedSections = localAssessment.sections.map(s =>
                    s.id === sectionId
                        ? { ...s, questions: [...s.questions, newQuestion] }
                        : s
                );

                setLocalAssessment({
                    ...localAssessment,
                    sections: updatedSections
                });
            }
        }
    };

    if (isLoading) {
        return (
            <div className="text-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
                <p className="mt-2 text-gray-500">Loading assessment...</p>
            </div>
        );
    }

    if (!localAssessment) {
        return (
            <div className="text-center py-12">
                <p className="text-red-600">Failed to load assessment</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="md:flex md:items-center md:justify-between">
                <div className="flex-1 min-w-0">
                    <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
                        Assessment Builder
                    </h2>
                    <p className="mt-1 text-sm text-gray-500">Job ID: {jobId}</p>
                </div>
                <div className="mt-4 flex space-x-3 md:mt-0 md:ml-4">
                    <button
                        onClick={() => setShowPreview(!showPreview)}
                        className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                    >
                        <EyeIcon className="-ml-1 mr-2 h-5 w-5" />
                        {showPreview ? 'Hide Preview' : 'Show Preview'}
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={saveMutation.isPending}
                        className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {saveMutation.isPending ? 'Saving...' : 'Save Assessment'}
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                {/* Builder */}
                <div className="space-y-6">
                    {/* Assessment Info */}
                    <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                        <div className="px-4 py-5 sm:px-6">
                            <h3 className="text-lg leading-6 font-medium text-gray-900">
                                Assessment Information
                            </h3>
                        </div>
                        <div className="border-t border-gray-200 px-4 py-5 sm:px-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Assessment Title
                                </label>
                                <input
                                    type="text"
                                    value={localAssessment.title}
                                    onChange={(e) => setLocalAssessment({
                                        ...localAssessment,
                                        title: e.target.value
                                    })}
                                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                                    placeholder="Enter assessment title"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Description
                                </label>
                                <textarea
                                    value={localAssessment.description}
                                    onChange={(e) => setLocalAssessment({
                                        ...localAssessment,
                                        description: e.target.value
                                    })}
                                    rows={3}
                                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                                    placeholder="Enter assessment description"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Sections */}
                    <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                        <div className="px-4 py-5 sm:px-6">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg leading-6 font-medium text-gray-900">
                                    Sections
                                </h3>
                                <button
                                    onClick={addSection}
                                    className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                                >
                                    <PlusIcon className="-ml-0.5 mr-1.5 h-4 w-4" />
                                    Add Section
                                </button>
                            </div>
                        </div>
                        <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
                            <DndContext
                                sensors={sensors}
                                collisionDetection={closestCenter}
                                onDragEnd={handleDragEnd}
                            >
                                <SortableContext
                                    items={localAssessment.sections.map(s => s.id)}
                                    strategy={verticalListSortingStrategy}
                                >
                                    <div className="space-y-4">
                                        {localAssessment.sections.map((section) => (
                                            <SectionCard
                                                key={section.id}
                                                section={section}
                                                onUpdate={updateSection}
                                                onDelete={deleteSection}
                                                onAddQuestion={addQuestion}
                                            />
                                        ))}
                                        {localAssessment.sections.length === 0 && (
                                            <div className="text-center py-8 text-gray-500">
                                                <DocumentTextIcon className="mx-auto h-12 w-12 text-gray-400" />
                                                <h3 className="mt-2 text-sm font-medium text-gray-900">No sections</h3>
                                                <p className="mt-1 text-sm text-gray-500">Get started by creating a new section.</p>
                                                <div className="mt-6">
                                                    <button
                                                        onClick={addSection}
                                                        className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                                                    >
                                                        <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
                                                        Add Section
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </SortableContext>
                            </DndContext>
                        </div>
                    </div>
                </div>

                {/* Preview */}
                {showPreview && (
                    <div>
                        <AssessmentPreview assessment={localAssessment} />
                    </div>
                )}
            </div>
        </div>
    );
}

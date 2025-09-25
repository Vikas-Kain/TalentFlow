import { useState } from 'react';
import {
    TrashIcon,
    Bars3Icon,
    PlusIcon,
    XMarkIcon
} from '@heroicons/react/24/outline';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { type AssessmentQuestion } from '../../lib/api';

interface QuestionBuilderProps {
    question: AssessmentQuestion;
    onUpdate: (question: AssessmentQuestion) => void;
    onDelete: () => void;
}

export default function QuestionBuilder({ question, onUpdate, onDelete }: QuestionBuilderProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: question.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    const [isExpanded, setIsExpanded] = useState(true);

    const addOption = () => {
        const newOptions = [...(question.options || []), 'New Option'];
        onUpdate({ ...question, options: newOptions });
    };

    const updateOption = (index: number, value: string) => {
        const newOptions = [...(question.options || [])];
        newOptions[index] = value;
        onUpdate({ ...question, options: newOptions });
    };

    const removeOption = (index: number) => {
        const newOptions = (question.options || []).filter((_, i) => i !== index);
        onUpdate({ ...question, options: newOptions });
    };

    const getQuestionIcon = (type: string) => {
        switch (type) {
            case 'single-choice': return '○';
            case 'multi-choice': return '☐';
            case 'text': return 'T';
            case 'long-text': return '¶';
            case 'numeric': return '#';
            case 'file': return '📎';
            default: return '?';
        }
    };

    const getQuestionTypeName = (type: string) => {
        switch (type) {
            case 'single-choice': return 'Single Choice';
            case 'multi-choice': return 'Multiple Choice';
            case 'text': return 'Short Text';
            case 'long-text': return 'Long Text';
            case 'numeric': return 'Numeric';
            case 'file': return 'File Upload';
            default: return 'Unknown';
        }
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={`bg-gray-50 border border-gray-200 rounded-lg p-4 ${isDragging ? 'shadow-lg' : ''
                }`}
        >
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3 flex-1">
                    <div
                        {...attributes}
                        {...listeners}
                        className="cursor-grab active:cursor-grabbing"
                    >
                        <Bars3Icon className="h-4 w-4 text-gray-400" />
                    </div>
                    <button
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="flex items-center space-x-2 flex-1 text-left"
                    >
                        <span className="text-lg">{getQuestionIcon(question.type)}</span>
                        <div>
                            <h4 className="text-sm font-medium text-gray-900">
                                {question.title || 'Untitled Question'}
                            </h4>
                            <p className="text-xs text-gray-500">{getQuestionTypeName(question.type)}</p>
                        </div>
                    </button>
                </div>
                <div className="flex items-center space-x-2">
                    <button
                        onClick={onDelete}
                        className="p-1 text-red-400 hover:text-red-600 rounded hover:bg-red-50"
                    >
                        <TrashIcon className="h-4 w-4" />
                    </button>
                </div>
            </div>

            {isExpanded && (
                <div className="mt-4 space-y-4">
                    {/* Question Title */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Question Title
                        </label>
                        <input
                            type="text"
                            value={question.title}
                            onChange={(e) => onUpdate({ ...question, title: e.target.value })}
                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                            placeholder="Enter question title"
                        />
                    </div>

                    {/* Question Description */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Description (Optional)
                        </label>
                        <textarea
                            value={question.description || ''}
                            onChange={(e) => onUpdate({ ...question, description: e.target.value })}
                            rows={2}
                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                            placeholder="Enter question description"
                        />
                    </div>

                    {/* Required Toggle */}
                    <div className="flex items-center">
                        <input
                            type="checkbox"
                            id={`required-${question.id}`}
                            checked={question.required}
                            onChange={(e) => onUpdate({ ...question, required: e.target.checked })}
                            className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                        />
                        <label htmlFor={`required-${question.id}`} className="ml-2 block text-sm text-gray-900">
                            Required question
                        </label>
                    </div>

                    {/* Options for choice questions */}
                    {(question.type === 'single-choice' || question.type === 'multi-choice') && (
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <label className="block text-sm font-medium text-gray-700">
                                    Options
                                </label>
                                <button
                                    onClick={addOption}
                                    className="inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded text-primary-700 bg-primary-100 hover:bg-primary-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                                >
                                    <PlusIcon className="h-3 w-3 mr-1" />
                                    Add Option
                                </button>
                            </div>
                            <div className="space-y-2">
                                {question.options?.map((option, index) => (
                                    <div key={index} className="flex items-center space-x-2">
                                        <input
                                            type="text"
                                            value={option}
                                            onChange={(e) => updateOption(index, e.target.value)}
                                            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                                            placeholder={`Option ${index + 1}`}
                                        />
                                        <button
                                            onClick={() => removeOption(index)}
                                            className="p-1 text-red-400 hover:text-red-600 rounded hover:bg-red-50"
                                        >
                                            <XMarkIcon className="h-4 w-4" />
                                        </button>
                                    </div>
                                ))}
                                {(!question.options || question.options.length === 0) && (
                                    <p className="text-sm text-gray-500">No options yet. Add options to get started.</p>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Numeric constraints */}
                    {question.type === 'numeric' && (
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Minimum Value
                                </label>
                                <input
                                    type="number"
                                    value={question.min || ''}
                                    onChange={(e) => onUpdate({
                                        ...question,
                                        min: e.target.value ? Number(e.target.value) : undefined
                                    })}
                                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                                    placeholder="Min"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Maximum Value
                                </label>
                                <input
                                    type="number"
                                    value={question.max || ''}
                                    onChange={(e) => onUpdate({
                                        ...question,
                                        max: e.target.value ? Number(e.target.value) : undefined
                                    })}
                                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                                    placeholder="Max"
                                />
                            </div>
                        </div>
                    )}

                    {/* Text length constraints */}
                    {(question.type === 'text' || question.type === 'long-text') && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Maximum Length
                            </label>
                            <input
                                type="number"
                                value={question.maxLength || ''}
                                onChange={(e) => onUpdate({
                                    ...question,
                                    maxLength: e.target.value ? Number(e.target.value) : undefined
                                })}
                                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                                placeholder="Maximum characters"
                            />
                        </div>
                    )}

                    {/* Conditional Logic */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Conditional Logic (Advanced)
                        </label>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                            <div>
                                <label className="block text-xs text-gray-600 mb-1">Depends On (Question ID)</label>
                                <input
                                    type="text"
                                    value={question.conditionalLogic?.dependsOn || ''}
                                    onChange={(e) => onUpdate({
                                        ...question,
                                        conditionalLogic: {
                                            dependsOn: e.target.value,
                                            condition: question.conditionalLogic?.condition || 'equals',
                                            value: question.conditionalLogic?.value || ''
                                        }
                                    })}
                                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                                    placeholder="e.g., q1"
                                />
                            </div>
                            <div>
                                <label className="block text-xs text-gray-600 mb-1">Condition</label>
                                <select
                                    value={question.conditionalLogic?.condition || 'equals'}
                                    onChange={(e) => onUpdate({
                                        ...question,
                                        conditionalLogic: {
                                            dependsOn: question.conditionalLogic?.dependsOn || '',
                                            condition: e.target.value as any,
                                            value: question.conditionalLogic?.value || ''
                                        }
                                    })}
                                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                                >
                                    <option value="equals">Equals</option>
                                    <option value="not-equals">Not Equals</option>
                                    <option value="contains">Contains</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs text-gray-600 mb-1">Value</label>
                                <input
                                    type="text"
                                    value={question.conditionalLogic?.value || ''}
                                    onChange={(e) => onUpdate({
                                        ...question,
                                        conditionalLogic: {
                                            dependsOn: question.conditionalLogic?.dependsOn || '',
                                            condition: question.conditionalLogic?.condition || 'equals',
                                            value: e.target.value
                                        }
                                    })}
                                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                                    placeholder="Target value"
                                />
                            </div>
                        </div>
                        <p className="mt-2 text-xs text-gray-500">Questions without conditional settings are always shown.</p>
                    </div>
                </div>
            )}
        </div>
    );
}

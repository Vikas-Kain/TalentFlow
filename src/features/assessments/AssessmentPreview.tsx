import { useState } from 'react';
import { type Assessment, type AssessmentQuestion } from '../../lib/api';

interface AssessmentPreviewProps {
    assessment: Assessment;
}

function QuestionPreview({ question }: { question: AssessmentQuestion }) {
    const [value, setValue] = useState<any>('');

    const renderQuestion = () => {
        switch (question.type) {
            case 'single-choice':
                return (
                    <div className="space-y-2">
                        {question.options?.map((option, index) => (
                            <label key={index} className="flex items-center">
                                <input
                                    type="radio"
                                    name={`question-${question.id}`}
                                    value={option}
                                    checked={value === option}
                                    onChange={(e) => setValue(e.target.value)}
                                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                                />
                                <span className="ml-2 text-sm text-gray-700">{option}</span>
                            </label>
                        ))}
                    </div>
                );

            case 'multi-choice':
                return (
                    <div className="space-y-2">
                        {question.options?.map((option, index) => (
                            <label key={index} className="flex items-center">
                                <input
                                    type="checkbox"
                                    checked={Array.isArray(value) && value.includes(option)}
                                    onChange={(e) => {
                                        const currentValues = Array.isArray(value) ? value : [];
                                        if (e.target.checked) {
                                            setValue([...currentValues, option]);
                                        } else {
                                            setValue(currentValues.filter((v: string) => v !== option));
                                        }
                                    }}
                                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                                />
                                <span className="ml-2 text-sm text-gray-700">{option}</span>
                            </label>
                        ))}
                    </div>
                );

            case 'text':
                return (
                    <input
                        type="text"
                        value={value}
                        onChange={(e) => setValue(e.target.value)}
                        maxLength={question.maxLength}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                        placeholder="Enter your answer"
                    />
                );

            case 'long-text':
                return (
                    <textarea
                        value={value}
                        onChange={(e) => setValue(e.target.value)}
                        rows={4}
                        maxLength={question.maxLength}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                        placeholder="Enter your answer"
                    />
                );

            case 'numeric':
                return (
                    <input
                        type="number"
                        value={value}
                        onChange={(e) => setValue(e.target.value)}
                        min={question.min}
                        max={question.max}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm"
                        placeholder="Enter a number"
                    />
                );

            case 'file':
                return (
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                        <div className="space-y-1">
                            <svg
                                className="mx-auto h-12 w-12 text-gray-400"
                                stroke="currentColor"
                                fill="none"
                                viewBox="0 0 48 48"
                                aria-hidden="true"
                            >
                                <path
                                    d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                                    strokeWidth={2}
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                />
                            </svg>
                            <div className="flex text-sm text-gray-600">
                                <label
                                    htmlFor={`file-${question.id}`}
                                    className="relative cursor-pointer bg-white rounded-md font-medium text-primary-600 hover:text-primary-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary-500"
                                >
                                    <span>Upload a file</span>
                                    <input
                                        id={`file-${question.id}`}
                                        type="file"
                                        className="sr-only"
                                        onChange={(e) => setValue(e.target.files?.[0]?.name || '')}
                                    />
                                </label>
                                <p className="pl-1">or drag and drop</p>
                            </div>
                            <p className="text-xs text-gray-500">PNG, JPG, PDF up to 10MB</p>
                        </div>
                    </div>
                );

            default:
                return <div className="text-gray-500 text-sm">Unknown question type</div>;
        }
    };

    return (
        <div className="space-y-2">
            <div className="flex items-start space-x-2">
                <span className="text-sm font-medium text-gray-900">
                    {question.title}
                    {question.required && <span className="text-red-500 ml-1">*</span>}
                </span>
            </div>
            {question.description && (
                <p className="text-sm text-gray-600">{question.description}</p>
            )}
            <div className="mt-2">
                {renderQuestion()}
            </div>
            {question.maxLength && (question.type === 'text' || question.type === 'long-text') && (
                <p className="text-xs text-gray-500 mt-1">
                    {typeof value === 'string' ? value.length : 0} / {question.maxLength} characters
                </p>
            )}
        </div>
    );
}

export default function AssessmentPreview({ assessment }: AssessmentPreviewProps) {
    return (
        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900">
                    Live Preview
                </h3>
                <p className="mt-1 max-w-2xl text-sm text-gray-500">
                    This is how the assessment will appear to candidates.
                </p>
            </div>
            <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
                <div className="space-y-8">
                    {/* Assessment Header */}
                    <div className="text-center">
                        <h1 className="text-2xl font-bold text-gray-900">{assessment.title}</h1>
                        {assessment.description && (
                            <p className="mt-2 text-gray-600">{assessment.description}</p>
                        )}
                    </div>

                    {/* Sections */}
                    {assessment.sections.map((section, sectionIndex) => (
                        <div key={section.id} className="space-y-6">
                            <div className="border-b border-gray-200 pb-4">
                                <h2 className="text-lg font-medium text-gray-900">
                                    {sectionIndex + 1}. {section.title}
                                </h2>
                                {section.description && (
                                    <p className="mt-1 text-sm text-gray-600">{section.description}</p>
                                )}
                            </div>

                            {/* Questions */}
                            <div className="space-y-6">
                                {section.questions.map((question, questionIndex) => (
                                    <div key={question.id} className="bg-gray-50 p-4 rounded-lg">
                                        <div className="flex items-start space-x-2 mb-3">
                                            <span className="text-sm font-medium text-gray-500">
                                                {sectionIndex + 1}.{questionIndex + 1}
                                            </span>
                                        </div>
                                        <QuestionPreview question={question} />
                                    </div>
                                ))}
                                {section.questions.length === 0 && (
                                    <div className="text-center py-8 text-gray-500">
                                        <p className="text-sm">No questions in this section yet.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}

                    {assessment.sections.length === 0 && (
                        <div className="text-center py-12 text-gray-500">
                            <p className="text-sm">No sections added yet. Add sections and questions to see the preview.</p>
                        </div>
                    )}

                    {/* Submit Button */}
                    {assessment.sections.length > 0 && assessment.sections.some(s => s.questions.length > 0) && (
                        <div className="pt-6 border-t border-gray-200">
                            <button
                                disabled
                                className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-gray-400 cursor-not-allowed"
                            >
                                Submit Assessment (Preview Mode)
                            </button>
                            <p className="mt-2 text-xs text-gray-500 text-center">
                                This is a preview. The submit button is disabled.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeftIcon, CalendarIcon, PhoneIcon, EnvelopeIcon } from '@heroicons/react/24/outline';
import { api } from '../lib/api';
import toast from 'react-hot-toast';

const stages = [
    { id: 'applied', name: 'Applied', color: 'bg-blue-100 text-blue-800' },
    { id: 'screen', name: 'Screen', color: 'bg-yellow-100 text-yellow-800' },
    { id: 'tech', name: 'Tech', color: 'bg-purple-100 text-purple-800' },
    { id: 'final', name: 'Final', color: 'bg-orange-100 text-orange-800' },
    { id: 'hired', name: 'Hired', color: 'bg-green-100 text-green-800' },
    { id: 'rejected', name: 'Rejected', color: 'bg-red-100 text-red-800' },
];

function MentionText({ text }: { text: string }) {
    const parts = text.split(/(@\w+)/g);

    return (
        <span>
            {parts.map((part, index) => {
                if (part.startsWith('@')) {
                    return (
                        <span key={index} className="font-semibold text-blue-600 bg-blue-50 px-1 rounded">
                            {part}
                        </span>
                    );
                }
                return part;
            })}
        </span>
    );
}

export default function CandidateProfilePage() {
    const { candidateId } = useParams<{ candidateId: string }>();
    const queryClient = useQueryClient();
    const [noteContent, setNoteContent] = useState('');

    const { data: candidate, isLoading: candidateLoading, error: candidateError } = useQuery({
        queryKey: ['candidate', candidateId],
        queryFn: () => api.getCandidate(candidateId!),
        enabled: !!candidateId,
    });

    const { data: timeline, isLoading: timelineLoading } = useQuery({
        queryKey: ['candidateTimeline', candidateId],
        queryFn: () => api.getCandidateTimeline(candidateId!),
        enabled: !!candidateId,
    });

    const addNoteMutation = useMutation({
        mutationFn: (note: { content: string }) => api.addCandidateNote(candidateId!, note),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['candidateTimeline', candidateId] });
            setNoteContent('');
            toast.success('Note added successfully');
        },
        onError: (error: any) => {
            toast.error('Failed to add note');
            console.error('Add note error:', error);
        },
    });

    const handleAddNote = () => {
        if (noteContent.trim()) {
            addNoteMutation.mutate({ content: noteContent.trim() });
        }
    };

    if (candidateLoading) {
        return (
            <div className="p-8">
                <div className="animate-pulse">
                    <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/4 mb-8"></div>
                    <div className="space-y-3">
                        <div className="h-4 bg-gray-200 rounded"></div>
                        <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                        <div className="h-4 bg-gray-200 rounded w-4/6"></div>
                    </div>
                </div>
            </div>
        );
    }

    if (candidateError || !candidate) {
        return (
            <div className="p-8 text-center text-red-600">
                <p>Error loading candidate: {candidateError?.message || 'Candidate not found'}</p>
                <Link to="/jobs" className="text-primary-600 hover:underline mt-4 inline-block">
                    Back to Jobs
                </Link>
            </div>
        );
    }

    const stageInfo = stages.find(s => s.id === candidate.stage) || stages[0];

    return (
        <div className="p-4 sm:p-6 lg:p-8">
            <div className="max-w-4xl mx-auto">
                <Link
                    to="/jobs"
                    className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-primary-700 mb-6"
                >
                    <ArrowLeftIcon className="h-4 w-4" />
                    Back to Jobs
                </Link>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    {/* Main content */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Candidate Info */}
                        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                            <div className="px-4 py-5 sm:px-6">
                                <h3 className="text-lg leading-6 font-medium text-gray-900">
                                    Candidate Information
                                </h3>
                            </div>
                            <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
                                <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                                    <div>
                                        <dt className="text-sm font-medium text-gray-500">Name</dt>
                                        <dd className="mt-1 text-sm text-gray-900">{candidate.name}</dd>
                                    </div>
                                    <div>
                                        <dt className="text-sm font-medium text-gray-500">Email</dt>
                                        <dd className="mt-1 text-sm text-gray-900 flex items-center">
                                            <EnvelopeIcon className="h-4 w-4 mr-2 text-gray-400" />
                                            {candidate.email}
                                        </dd>
                                    </div>
                                    {candidate.phone && (
                                        <div>
                                            <dt className="text-sm font-medium text-gray-500">Phone</dt>
                                            <dd className="mt-1 text-sm text-gray-900 flex items-center">
                                                <PhoneIcon className="h-4 w-4 mr-2 text-gray-400" />
                                                {candidate.phone}
                                            </dd>
                                        </div>
                                    )}
                                    <div>
                                        <dt className="text-sm font-medium text-gray-500">Current Stage</dt>
                                        <dd className="mt-1">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${stageInfo.color}`}>
                                                {stageInfo.name}
                                            </span>
                                        </dd>
                                    </div>
                                    <div>
                                        <dt className="text-sm font-medium text-gray-500">Applied</dt>
                                        <dd className="mt-1 text-sm text-gray-900 flex items-center">
                                            <CalendarIcon className="h-4 w-4 mr-2 text-gray-400" />
                                            {new Date(candidate.appliedAt).toLocaleDateString()}
                                        </dd>
                                    </div>
                                    <div>
                                        <dt className="text-sm font-medium text-gray-500">Last Updated</dt>
                                        <dd className="mt-1 text-sm text-gray-900">
                                            {new Date(candidate.updatedAt).toLocaleDateString()}
                                        </dd>
                                    </div>
                                </dl>
                            </div>
                        </div>

                        {/* Timeline */}
                        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                            <div className="px-4 py-5 sm:px-6">
                                <h3 className="text-lg leading-6 font-medium text-gray-900">
                                    Timeline
                                </h3>
                            </div>
                            <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
                                {timelineLoading ? (
                                    <div className="animate-pulse space-y-4">
                                        {[1, 2, 3].map(i => (
                                            <div key={i} className="flex space-x-3">
                                                <div className="h-2 bg-gray-200 rounded w-2 mt-2"></div>
                                                <div className="flex-1 space-y-2">
                                                    <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                                                    <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : timeline && timeline.length > 0 ? (
                                    <div className="flow-root">
                                        <ul className="-mb-8">
                                            {timeline.map((event, eventIdx) => (
                                                <li key={event.id}>
                                                    <div className="relative pb-8">
                                                        {eventIdx !== timeline.length - 1 ? (
                                                            <span
                                                                className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200"
                                                                aria-hidden="true"
                                                            />
                                                        ) : null}
                                                        <div className="relative flex space-x-3">
                                                            <div>
                                                                <span className="h-8 w-8 rounded-full bg-gray-400 flex items-center justify-center ring-8 ring-white">
                                                                    <div className="h-2 w-2 bg-white rounded-full"></div>
                                                                </span>
                                                            </div>
                                                            <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                                                                <div>
                                                                    <p className="text-sm text-gray-500">
                                                                        {event.type === 'stage_change' ? 'Stage Changed' :
                                                                            event.type === 'note_added' ? 'Note Added' :
                                                                                event.type === 'assessment_submitted' ? 'Assessment Submitted' :
                                                                                    'Activity'}
                                                                    </p>
                                                                    <p className="text-sm text-gray-900">
                                                                        <MentionText text={event.description} />
                                                                    </p>
                                                                </div>
                                                                <div className="text-right text-sm whitespace-nowrap text-gray-500">
                                                                    <time dateTime={event.timestamp}>
                                                                        {new Date(event.timestamp).toLocaleDateString()}
                                                                    </time>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                ) : (
                                    <p className="text-gray-500 text-sm">No timeline events yet.</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        {/* Add Note */}
                        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                            <div className="px-4 py-5 sm:px-6">
                                <h3 className="text-lg leading-6 font-medium text-gray-900">
                                    Add Note
                                </h3>
                            </div>
                            <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
                                <div className="space-y-4">
                                    <div>
                                        <label htmlFor="note" className="block text-sm font-medium text-gray-700">
                                            Note
                                        </label>
                                        <textarea
                                            id="note"
                                            rows={4}
                                            value={noteContent}
                                            onChange={(e) => setNoteContent(e.target.value)}
                                            className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                                            placeholder="Add a note about this candidate. Use @mentions to highlight people..."
                                        />
                                        <p className="mt-1 text-xs text-gray-500">
                                            Use @mentions to highlight people (e.g., @JohnDoe)
                                        </p>
                                    </div>
                                    <button
                                        onClick={handleAddNote}
                                        disabled={!noteContent.trim() || addNoteMutation.isPending}
                                        className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {addNoteMutation.isPending ? 'Adding...' : 'Add Note'}
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Quick Actions */}
                        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                            <div className="px-4 py-5 sm:px-6">
                                <h3 className="text-lg leading-6 font-medium text-gray-900">
                                    Quick Actions
                                </h3>
                            </div>
                            <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
                                <div className="space-y-3">
                                    <button className="w-full inline-flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
                                        Send Email
                                    </button>
                                    <button className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500">
                                        Schedule Interview
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

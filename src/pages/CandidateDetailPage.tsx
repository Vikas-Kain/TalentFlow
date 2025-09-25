import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeftIcon, PaperClipIcon, PhoneIcon } from '@heroicons/react/24/outline';
import { api, type Candidate, type TimelineEvent } from '../lib/api';
import toast from 'react-hot-toast';

// A simple component to render text with @mentions highlighted
function NoteContent({ text }: { text: string }) {
    const parts = text.split(/(@\w+)/g);
    return (
        <p className="text-gray-600 whitespace-pre-wrap">
            {parts.map((part, i) =>
                part.startsWith('@') ? (
                    <span key={i} className="font-semibold text-primary-600 bg-primary-50 rounded-sm px-1">
                        {part}
                    </span>
                ) : (
                    part
                )
            )}
        </p>
    );
}

function AddNoteForm({ candidateId }: { candidateId: string }) {
    const [note, setNote] = useState('');
    const queryClient = useQueryClient();

    const addNoteMutation = useMutation({
        mutationFn: (newNote: { content: string }) => api.addCandidateNote(candidateId, newNote),
        onSuccess: () => {
            toast.success('Note added');
            queryClient.invalidateQueries({ queryKey: ['candidate-timeline', candidateId] });
            setNote('');
        },
        onError: () => {
            toast.error('Failed to add note');
        },
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (note.trim()) {
            addNoteMutation.mutate({ content: note.trim() });
        }
    };

    return (
        <form onSubmit={handleSubmit} className="mt-4">
            <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Add a note... use @ to mention a colleague."
                className="w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
                rows={3}
                disabled={addNoteMutation.isPending}
            />
            <div className="mt-2 flex justify-end">
                <button
                    type="submit"
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
                    disabled={addNoteMutation.isPending || !note.trim()}
                >
                    {addNoteMutation.isPending ? 'Adding...' : 'Add Note'}
                </button>
            </div>
        </form>
    );
}

function TimelineItem({ event }: { event: TimelineEvent }) {
    // Icons are derived inline below; keep minimal

    return (
        <li>
            <div className="relative pb-8">
                <div className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200" aria-hidden="true" />
                <div className="relative flex space-x-3">
                    <div>
                        <span
                            className={`h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white ${event.type === 'stage_change'
                                ? 'bg-blue-500'
                                : event.type === 'note_added'
                                    ? 'bg-green-500'
                                    : 'bg-purple-500'
                                }`}
                        >
                            <span className="text-white text-xs font-medium">
                                {event.type === 'stage_change' ? 'S' : event.type === 'note_added' ? 'N' : 'A'}
                            </span>
                        </span>
                    </div>
                    <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                        <div>
                            <p className="text-sm text-gray-500">{event.description}</p>
                        </div>
                        <div className="text-right text-sm whitespace-nowrap text-gray-500">
                            {new Date(event.timestamp).toLocaleDateString()}
                        </div>
                    </div>
                </div>
            </div>
        </li>
    );
}

export default function CandidateProfilePage() {
    const { candidateId } = useParams<{ candidateId: string }>();


    const { data: candidatesResponse, isLoading: isLoadingCandidate } = useQuery({
        queryKey: ['candidates'],
        queryFn: () => api.getCandidates({ pageSize: 1000 }),
    });
    const candidate = ((candidatesResponse?.data || []) as Candidate[]).find(c => c.id === candidateId);

    const { data: timeline, isLoading: isLoadingTimeline } = useQuery({
        queryKey: ['candidate-timeline', candidateId],
        queryFn: () => api.getCandidateTimeline(candidateId!),
        enabled: !!candidateId,
    });

    const isLoading = isLoadingCandidate || isLoadingTimeline;

    if (isLoading) {
        return (
            <div className="text-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
                <p className="mt-2 text-gray-500">Loading candidate details...</p>
            </div>
        );
    }

    if (!candidate) {
        return (
            <div className="text-center py-12">
                <p className="text-red-600">Candidate not found</p>
                <Link
                    to="/candidates"
                    className="mt-4 inline-flex items-center text-primary-600 hover:text-primary-500"
                >
                    <ArrowLeftIcon className="h-4 w-4 mr-1" />
                    Back to Candidates
                </Link>
            </div>
        );
    }

    const stages = [
        { id: 'applied', name: 'Applied', color: 'bg-blue-100 text-blue-800' },
        { id: 'screen', name: 'Screen', color: 'bg-yellow-100 text-yellow-800' },
        { id: 'tech', name: 'Tech', color: 'bg-purple-100 text-purple-800' },
        { id: 'final', name: 'Final', color: 'bg-orange-100 text-orange-800' },
        { id: 'hired', name: 'Hired', color: 'bg-green-100 text-green-800' },
        { id: 'rejected', name: 'Rejected', color: 'bg-red-100 text-red-800' },
    ];

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="md:flex md:items-center md:justify-between">
                <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-4">
                        <Link
                            to="/candidates"
                            className="text-gray-400 hover:text-gray-600"
                        >
                            <ArrowLeftIcon className="h-6 w-6" />
                        </Link>
                        <div>
                            <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
                                {candidate.name}
                            </h2>
                            <div className="mt-1 flex flex-col sm:flex-row sm:flex-wrap sm:mt-0 sm:space-x-6">
                                <div className="mt-2 flex items-center text-sm text-gray-500">
                                    <PaperClipIcon className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" />
                                    Applied {new Date(candidate.appliedAt).toLocaleDateString()}
                                </div>
                                <div className="mt-2 flex items-center text-sm text-gray-500">
                                    <span
                                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${stages.find(s => s.id === candidate.currentStage)?.color || 'bg-gray-100 text-gray-800'
                                            }`}
                                    >
                                        {candidate.currentStage}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                {/* Main content */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Contact Information */}
                    <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                        <div className="px-4 py-5 sm:px-6">
                            <h3 className="text-lg leading-6 font-medium text-gray-900">
                                Contact Information
                            </h3>
                        </div>
                        <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
                            <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                                <div>
                                    <dt className="text-sm font-medium text-gray-500 flex items-center">
                                        <PaperClipIcon className="h-4 w-4 mr-2" />
                                        Email
                                    </dt>
                                    <dd className="mt-1 text-sm text-gray-900">{candidate.email}</dd>
                                </div>
                                {candidate.phone && (
                                    <div>
                                        <dt className="text-sm font-medium text-gray-500 flex items-center">
                                            <PhoneIcon className="h-4 w-4 mr-2" />
                                            Phone
                                        </dt>
                                        <dd className="mt-1 text-sm text-gray-900">{candidate.phone}</dd>
                                    </div>
                                )}
                            </dl>
                        </div>
                    </div>

                    {/* Notes & Activity */}
                    <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                        <div className="px-4 py-5 sm:px-6">
                            <h3 className="text-lg leading-6 font-medium text-gray-900">
                                Notes & Activity
                            </h3>
                        </div>
                        <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
                            <AddNoteForm candidateId={candidateId!} />
                            <ul className="mt-4 space-y-4">
                                {timeline && timeline.length > 0 ? (
                                    timeline.map(event => (
                                        <li key={event.id} className="space-y-1">
                                            <TimelineItem event={event} />
                                            {event.type === 'note_added' && event.description ? (
                                                <NoteContent text={event.description} />
                                            ) : null}
                                        </li>
                                    ))
                                ) : (
                                    <li className="text-center text-gray-500 py-4">No activity yet.</li>
                                )}
                            </ul>
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
                            {isLoadingTimeline ? (
                                <div className="text-center py-4">
                                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600 mx-auto"></div>
                                    <p className="mt-2 text-sm text-gray-500">Loading timeline...</p>
                                </div>
                            ) : timeline?.length === 0 ? (
                                <p className="text-gray-500 text-sm">No timeline events yet.</p>
                            ) : (
                                <div className="flow-root">
                                    <ul className="-mb-8">
                                        {timeline?.map((event: TimelineEvent, eventIdx: number) => (
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
                                                            <span
                                                                className={`h-8 w-8 rounded-full flex items-center justify-center ring-8 ring-white ${event.type === 'stage_change'
                                                                    ? 'bg-blue-500'
                                                                    : event.type === 'note_added'
                                                                        ? 'bg-green-500'
                                                                        : 'bg-purple-500'
                                                                    }`}
                                                            >
                                                                <span className="text-white text-xs font-medium">
                                                                    {event.type === 'stage_change' ? 'S' : event.type === 'note_added' ? 'N' : 'A'}
                                                                </span>
                                                            </span>
                                                        </div>
                                                        <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                                                            <div>
                                                                <p className="text-sm text-gray-500">{event.description}</p>
                                                            </div>
                                                            <div className="text-right text-sm whitespace-nowrap text-gray-500">
                                                                {new Date(event.timestamp).toLocaleDateString()}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Stage Management */}
                    <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                        <div className="px-4 py-5 sm:px-6">
                            <h3 className="text-lg leading-6 font-medium text-gray-900">
                                Current Stage
                            </h3>
                        </div>
                        <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
                            <div className="space-y-2">
                                {stages.map((stage) => (
                                    <div key={stage.id} className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium ${candidate.currentStage === stage.id ? 'bg-primary-50 text-primary-700 border border-primary-200' : 'text-gray-700 border border-transparent'}`}>
                                        {stage.name}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Candidate Info */}
                    <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                        <div className="px-4 py-5 sm:px-6">
                            <h3 className="text-lg leading-6 font-medium text-gray-900">
                                Candidate Information
                            </h3>
                        </div>
                        <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
                            <dl className="grid grid-cols-1 gap-x-4 gap-y-6">
                                <div>
                                    <dt className="text-sm font-medium text-gray-500">Applied Date</dt>
                                    <dd className="mt-1 text-sm text-gray-900">
                                        {new Date(candidate.appliedAt).toLocaleDateString()}
                                    </dd>
                                </div>
                                <div>
                                    <dt className="text-sm font-medium text-gray-500">Last Updated</dt>
                                    <dd className="mt-1 text-sm text-gray-900">
                                        {new Date(candidate.updatedAt).toLocaleDateString()}
                                    </dd>
                                </div>
                                <div>
                                    <dt className="text-sm font-medium text-gray-500">Candidate ID</dt>
                                    <dd className="mt-1 text-sm text-gray-900 font-mono">{candidate.id}</dd>
                                </div>
                            </dl>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { MagnifyingGlassIcon, FunnelIcon, Squares2X2Icon, ListBulletIcon } from '@heroicons/react/24/outline';
import { api, type Candidate } from '../lib/api';
import CandidatesKanban from '../features/candidates/CandidatesKanban';
import CandidatesList from '../features/candidates/CandidatesList.tsx';

export default function CandidatesPage() {
    const [view, setView] = useState<'list' | 'kanban'>('kanban');
    const [search, setSearch] = useState('');
    const [stageFilter, setStageFilter] = useState('');

    const { data: candidatesResp, isLoading, error } = useQuery({
        queryKey: ['candidates', { stage: stageFilter }],
        queryFn: () => api.getCandidates({ stage: stageFilter, page: 1, pageSize: 1000 }),
    });

    const candidates = candidatesResp?.data || [];

    // Client-side search filtering
    const filteredCandidates = useMemo(() => {
        if (!search.trim()) return candidates;

        const searchLower = search.toLowerCase();
        return candidates.filter((candidate: Candidate & { stage: Candidate['currentStage'] }) =>
            candidate.name.toLowerCase().includes(searchLower) ||
            candidate.email.toLowerCase().includes(searchLower)
        );
    }, [candidates, search]);

    if (error) {
        return (
            <div className="text-center py-12">
                <p className="text-red-600">Error loading candidates: {error.message}</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="md:flex md:items-center md:justify-between">
                <div className="flex-1 min-w-0">
                    <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
                        Candidates
                    </h2>
                </div>
                <div className="mt-4 flex items-center space-x-3 md:mt-0 md:ml-4">
                    {/* View Toggle */}
                    <div className="flex rounded-md shadow-sm" role="group">
                        <button
                            type="button"
                            onClick={() => setView('kanban')}
                            className={`inline-flex items-center px-3 py-2 text-sm font-medium border ${view === 'kanban'
                                    ? 'bg-primary-600 text-white border-primary-600'
                                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                                } rounded-l-md`}
                        >
                            <Squares2X2Icon className="h-4 w-4 mr-1" />
                            Kanban
                        </button>
                        <button
                            type="button"
                            onClick={() => setView('list')}
                            className={`inline-flex items-center px-3 py-2 text-sm font-medium border ${view === 'list'
                                    ? 'bg-primary-600 text-white border-primary-600'
                                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                                } rounded-r-md`}
                        >
                            <ListBulletIcon className="h-4 w-4 mr-1" />
                            List
                        </button>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-lg shadow">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                            type="text"
                            placeholder="Search candidates..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                        />
                    </div>

                    <select
                        value={stageFilter}
                        onChange={(e) => setStageFilter(e.target.value)}
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                    >
                        <option value="">All Stages</option>
                        <option value="applied">Applied</option>
                        <option value="screen">Screen</option>
                        <option value="tech">Tech</option>
                        <option value="final">Final</option>
                        <option value="hired">Hired</option>
                        <option value="rejected">Rejected</option>
                    </select>

                    <button
                        onClick={() => {
                            setSearch('');
                            setStageFilter('');
                        }}
                        className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                    >
                        <FunnelIcon className="-ml-1 mr-2 h-5 w-5" />
                        Clear Filters
                    </button>
                </div>
            </div>

            {/* Content */}
            {isLoading ? (
                <div className="bg-white shadow overflow-hidden sm:rounded-md">
                    <div className="p-6 text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
                        <p className="mt-2 text-gray-500">Loading candidates...</p>
                    </div>
                </div>
            ) : filteredCandidates.length === 0 ? (
                <div className="bg-white shadow overflow-hidden sm:rounded-md">
                    <div className="p-6 text-center">
                        <p className="text-gray-500">No candidates found</p>
                    </div>
                </div>
            ) : (
                <>
                    {view === 'kanban' ? (
                        <CandidatesKanban candidates={filteredCandidates} />
                    ) : (
                        <CandidatesList candidates={filteredCandidates} />
                    )}
                </>
            )}
        </div>
    );
}
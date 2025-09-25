import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { MagnifyingGlassIcon, FunnelIcon } from '@heroicons/react/24/outline';
import { api } from '../lib/api';
import CandidatesKanban from '../features/candidates/CandidatesKanban';
// If list view component exists, import it; else keep only Kanban
// import CandidatesListVirtual from '../features/candidates/CandidatesListVirtual';

export default function CandidatesPage() {
    const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');
    const [search, setSearch] = useState('');
    const [stageFilter, setStageFilter] = useState('');

    const { data: candidatesResponse, isLoading, error } = useQuery({
        // The query key should only depend on the server-side filter
        queryKey: ['candidates', { stage: stageFilter }],
        // The API call should not include the client-side search term
        queryFn: () => api.getCandidates({ stage: stageFilter }),
    });

    // useMemo will re-compute the filtered list only when data or search term changes
    const filteredCandidates = useMemo(() => {
        const candidatesData = candidatesResponse?.data || [];
        if (!search) return candidatesData;

        const lowercasedSearch = search.toLowerCase();
        return candidatesData.filter(candidate =>
            candidate.name.toLowerCase().includes(lowercasedSearch) ||
            candidate.email.toLowerCase().includes(lowercasedSearch)
        );
    }, [candidatesResponse, search]);

    if (error) {
        return <div className="text-center py-12 text-red-600">Error: {error.message}</div>;
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

            {/* View Mode Toggle */}
            <div className="flex space-x-2">
                <button
                    onClick={() => setViewMode('kanban')}
                    className={`flex-1 px-4 py-2 rounded-md font-medium text-sm focus:outline-none transition-all ${viewMode === 'kanban'
                        ? 'bg-primary-600 text-white shadow-md'
                        : 'bg-white text-gray-700 hover:bg-gray-50'
                        }`}
                >
                    Kanban View
                </button>
                <button
                    onClick={() => setViewMode('list')}
                    className={`flex-1 px-4 py-2 rounded-md font-medium text-sm focus:outline-none transition-all ${viewMode === 'list'
                        ? 'bg-primary-600 text-white shadow-md'
                        : 'bg-white text-gray-700 hover:bg-gray-50'
                        }`}
                >
                    List View
                </button>
            </div>

            {isLoading ? (
                <div className="text-center p-6"><p>Loading candidates...</p></div>
            ) : viewMode === 'kanban' ? (
                <CandidatesKanban candidates={filteredCandidates} />
            ) : (
                <div className="text-center text-gray-500 p-6">List view component not available.</div>
            )}
        </div>
    );
}

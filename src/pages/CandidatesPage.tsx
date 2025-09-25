import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { MagnifyingGlassIcon, FunnelIcon } from '@heroicons/react/24/outline';
import { api } from '../lib/api';
import CandidatesKanban from '../features/candidates/CandidatesKanban';

export default function CandidatesPage() {
    const [search, setSearch] = useState('');
    const [stageFilter, setStageFilter] = useState('');
    const [currentPage, setCurrentPage] = useState(1);

    const { data, isLoading, error } = useQuery({
        queryKey: ['candidates', { search, stage: stageFilter, page: currentPage }],
        queryFn: () => api.getCandidates({
            search,
            stage: stageFilter,
            page: currentPage,
            pageSize: 50
        }),
    });

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
                            setCurrentPage(1);
                        }}
                        className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                    >
                        <FunnelIcon className="-ml-1 mr-2 h-5 w-5" />
                        Clear Filters
                    </button>
                </div>
            </div>

            {/* Candidates List */}
            <CandidatesKanban
                candidates={data?.data || []}
                isLoading={isLoading}
            />

            {/* Pagination */}
            {data?.pagination && data.pagination.totalPages > 1 && (
                <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                    <div className="flex-1 flex justify-between sm:hidden">
                        <button
                            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                            disabled={currentPage === 1}
                            className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Previous
                        </button>
                        <button
                            onClick={() => setCurrentPage(prev => Math.min(data.pagination.totalPages, prev + 1))}
                            disabled={currentPage === data.pagination.totalPages}
                            className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Next
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

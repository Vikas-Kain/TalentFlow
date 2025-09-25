import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { PlusIcon, MagnifyingGlassIcon, FunnelIcon } from '@heroicons/react/24/outline';
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
    SortableContext,
    verticalListSortingStrategy,
    arrayMove,
} from '@dnd-kit/sortable';
import { api, type Job } from '../lib/api';
import JobCard from '../features/jobs/JobCard.tsx';
import JobModal from '../features/jobs/JobModal.tsx';
import { useUIStore } from '../store/ui';
import toast from 'react-hot-toast';

export default function JobsPage() {
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [sortBy, setSortBy] = useState('order');

    const { openJobModal } = useUIStore();
    const queryClient = useQueryClient();

    const { data, isLoading, error } = useQuery({
        queryKey: ['jobs', { search, status: statusFilter, page: currentPage, sort: sortBy }],
        queryFn: () => api.getJobs({
            search,
            status: statusFilter,
            page: currentPage,
            pageSize: 10,
            sort: sortBy
        }),
    });

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor)
    );

    const reorderMutation = useMutation({
        mutationFn: ({ id, newOrder }: { id: string; newOrder: number }) =>
            api.reorderJob(id, newOrder),
        onMutate: async (newOrderData) => {
            // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
            await queryClient.cancelQueries({ queryKey: ['jobs'] });

            // Snapshot the previous value
            const previousJobsData = queryClient.getQueryData<any>(['jobs', { search, status: statusFilter, page: currentPage, sort: sortBy }]);

            // Optimistically update to the new value
            queryClient.setQueryData(['jobs', { search, status: statusFilter, page: currentPage, sort: sortBy }], (oldData: any) => {
                if (!oldData) return oldData;
                const oldIndex = oldData.data.findIndex((job: Job) => job.id === newOrderData.id);
                const newIndex = newOrderData.newOrder;
                if (oldIndex === -1) return oldData;

                const reorderedJobs = arrayMove(oldData.data, oldIndex, newIndex);
                return { ...oldData, data: reorderedJobs };
            });

            // Return a context object with the snapshotted value
            return { previousJobsData };
        },
        onError: (_err, _vars, context) => {
            // Rollback to the previous value on error
            if (context?.previousJobsData) {
                queryClient.setQueryData(['jobs', { search, status: statusFilter, page: currentPage, sort: sortBy }], context.previousJobsData);
            }
            toast.error('Failed to reorder job (simulated error)');
        },
        onSettled: () => {
            // Always refetch after error or success to ensure server state is correct
            queryClient.invalidateQueries({ queryKey: ['jobs', { search, status: statusFilter, page: currentPage, sort: sortBy }] });
        },
    });

    const updateJobMutation = useMutation({
        mutationFn: ({ id, job }: { id: string; job: Partial<Job> }) =>
            api.updateJob(id, job),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['jobs'] });
            toast.success('Job updated successfully');
        },
        onError: (error: any) => {
            toast.error('Failed to update job');
            console.error('Update error:', error);
        },
    });

    const handleReorder = (event: DragEndEvent) => {
        const { active, over } = event;
        if (over && active.id !== over.id) {
            const oldIndex = data?.data.findIndex((job: Job) => job.id === active.id) ?? -1;
            const newIndex = data?.data.findIndex((job: Job) => job.id === over.id) ?? -1;

            if (oldIndex !== -1 && newIndex !== -1 && data?.data) {
                const jobToUpdate = data.data[oldIndex];
                reorderMutation.mutate({ id: jobToUpdate.id, newOrder: newIndex });
            }
        }
    };

    const handleStatusToggle = (job: Job) => {
        const newStatus = job.status === 'active' ? 'archived' : 'active';
        updateJobMutation.mutate({ id: job.id, job: { status: newStatus } });
    };

    if (error) {
        return (
            <div className="text-center py-12">
                <p className="text-red-600">Error loading jobs: {error.message}</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="md:flex md:items-center md:justify-between">
                <div className="flex-1 min-w-0">
                    <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
                        Jobs
                    </h2>
                </div>
                <div className="mt-4 flex md:mt-0 md:ml-4">
                    <button
                        type="button"
                        onClick={() => openJobModal()}
                        className="ml-3 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                    >
                        <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
                        New Job
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-lg shadow">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                            type="text"
                            placeholder="Search jobs..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                        />
                    </div>

                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                    >
                        <option value="">All Status</option>
                        <option value="active">Active</option>
                        <option value="archived">Archived</option>
                    </select>

                    <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                    >
                        <option value="order">Custom Order</option>
                        <option value="title">Title</option>
                        <option value="createdAt">Date Created</option>
                    </select>

                    <button
                        onClick={() => {
                            setSearch('');
                            setStatusFilter('');
                            setSortBy('order');
                            setCurrentPage(1);
                        }}
                        className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                    >
                        <FunnelIcon className="-ml-1 mr-2 h-5 w-5" />
                        Clear Filters
                    </button>
                </div>
            </div>

            {/* Jobs List */}
            <div className="bg-white shadow overflow-hidden sm:rounded-md">
                {isLoading ? (
                    <div className="p-6 text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
                        <p className="mt-2 text-gray-500">Loading jobs...</p>
                    </div>
                ) : data?.data?.length === 0 ? (
                    <div className="p-6 text-center">
                        <p className="text-gray-500">No jobs found</p>
                    </div>
                ) : (
                    <DndContext
                        sensors={sensors}
                        collisionDetection={closestCenter}
                        onDragEnd={handleReorder}
                    >
                        <SortableContext
                            items={data?.data.map((j: Job) => j.id) || []}
                            strategy={verticalListSortingStrategy}
                        >
                            <ul className="divide-y divide-gray-200">
                                {data?.data?.map((job: Job) => (
                                    <JobCard
                                        key={job.id}
                                        job={job}
                                        onReorder={() => { }} // Not used in individual cards
                                        onStatusToggle={handleStatusToggle}
                                        isReordering={reorderMutation.isPending}
                                    />
                                ))}
                            </ul>
                        </SortableContext>
                    </DndContext>
                )}
            </div>

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
                    <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                        <div>
                            <p className="text-sm text-gray-700">
                                Showing{' '}
                                <span className="font-medium">
                                    {(currentPage - 1) * data.pagination.pageSize + 1}
                                </span>{' '}
                                to{' '}
                                <span className="font-medium">
                                    {Math.min(currentPage * data.pagination.pageSize, data.pagination.total)}
                                </span>{' '}
                                of{' '}
                                <span className="font-medium">{data.pagination.total}</span>{' '}
                                results
                            </p>
                        </div>
                        <div>
                            <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                                <button
                                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                    disabled={currentPage === 1}
                                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Previous
                                </button>
                                {Array.from({ length: data.pagination.totalPages }, (_, i) => {
                                    const page = i + 1;
                                    // Basic pagination logic to show a few pages around the current one
                                    const pageCount = data.pagination.totalPages;
                                    const currentPageNum = currentPage;
                                    if (
                                        page === 1 ||
                                        page === pageCount ||
                                        (page >= currentPageNum - 2 && page <= currentPageNum + 2)
                                    ) {
                                        return (
                                            <button
                                                key={page}
                                                onClick={() => setCurrentPage(page)}
                                                className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${currentPage === page
                                                    ? 'z-10 bg-primary-50 border-primary-500 text-primary-600'
                                                    : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                                                    }`}
                                            >
                                                {page}
                                            </button>
                                        );
                                    }
                                    if (page === currentPageNum - 3 || page === currentPageNum + 3) {
                                        return <span key={page} className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">...</span>;
                                    }
                                    return null;
                                })}
                                <button
                                    onClick={() => setCurrentPage(prev => Math.min(data.pagination.totalPages, prev + 1))}
                                    disabled={currentPage === data.pagination.totalPages}
                                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Next
                                </button>
                            </nav>
                        </div>
                    </div>
                </div>
            )}

            <JobModal />
        </div>
    );
}

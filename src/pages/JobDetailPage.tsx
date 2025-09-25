import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeftIcon, CalendarIcon, TagIcon } from '@heroicons/react/24/outline';
import { api } from '../lib/api';

export default function JobDetailPage() {
    const { jobId } = useParams<{ jobId: string }>();

    const { data: job, isLoading, error } = useQuery({
        queryKey: ['job', jobId],
        queryFn: () => api.getJob(jobId!),
        enabled: !!jobId,
    });

    if (isLoading) {
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

    if (error) {
        return (
            <div className="p-8 text-center text-red-600">
                <p>Error loading job: {error.message}</p>
                <Link to="/jobs" className="text-primary-600 hover:underline mt-4 inline-block">
                    Back to Jobs
                </Link>
            </div>
        );
    }

    if (!job) {
        return (
            <div className="p-8 text-center">
                <p>Job not found.</p>
                <Link to="/jobs" className="text-primary-600 hover:underline mt-4 inline-block">
                    Back to Jobs
                </Link>
            </div>
        );
    }

    return (
        <div className="p-4 sm:p-6 lg:p-8">
            <div className="max-w-3xl mx-auto">
                <Link
                    to="/jobs"
                    className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-primary-700 mb-4"
                >
                    <ArrowLeftIcon className="h-4 w-4" />
                    Back to all jobs
                </Link>

                <div className="bg-white shadow-sm rounded-lg p-6">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">{job.title}</h1>
                            <p className="text-sm text-gray-500 mt-1">/{job.slug}</p>
                        </div>
                        <span
                            className={`mt-2 sm:mt-0 inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${job.status === 'active'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-yellow-100 text-yellow-800'
                                }`}
                        >
                            {job.status}
                        </span>
                    </div>

                    <div className="mt-4 flex items-center space-x-4 text-sm text-gray-500">
                        <div className="flex items-center gap-1.5">
                            <CalendarIcon className="h-4 w-4" />
                            <span>Created on {new Date(job.createdAt).toLocaleDateString()}</span>
                        </div>
                        {job.tags && job.tags.length > 0 && (
                            <div className="flex items-center gap-1.5">
                                <TagIcon className="h-4 w-4" />
                                <div className="flex flex-wrap gap-1">
                                    {job.tags.map(tag => (
                                        <span key={tag} className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded">
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="mt-6 border-t border-gray-200 pt-6">
                        <h2 className="text-lg font-medium text-gray-900">Description</h2>
                        <p className="mt-2 text-gray-600 whitespace-pre-wrap">{job.description || 'No description provided.'}</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
    ArrowLeftIcon,
    UsersIcon,
    ClipboardDocumentListIcon,
    CalendarIcon,
    TagIcon
} from '@heroicons/react/24/outline';
import { api, type Job } from '../lib/api';

export default function JobDetailPage() {
    const { jobId } = useParams<{ jobId: string }>();

    const { data: jobs, isLoading, error } = useQuery({
        queryKey: ['jobs'],
        queryFn: () => api.getJobs(),
    });

    const job = jobs?.data?.find((j: any) => j.id === jobId);

    if (isLoading) {
        return (
            <div className="text-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
                <p className="mt-2 text-gray-500">Loading job details...</p>
            </div>
        );
    }

    if (error || !job) {
        return (
            <div className="text-center py-12">
                <p className="text-red-600">Job not found</p>
                <Link
                    to="/jobs"
                    className="mt-4 inline-flex items-center text-primary-600 hover:text-primary-500"
                >
                    <ArrowLeftIcon className="h-4 w-4 mr-1" />
                    Back to Jobs
                </Link>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="md:flex md:items-center md:justify-between">
                <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-4">
                        <Link
                            to="/jobs"
                            className="text-gray-400 hover:text-gray-600"
                        >
                            <ArrowLeftIcon className="h-6 w-6" />
                        </Link>
                        <div>
                            <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
                                {job.title}
                            </h2>
                            <div className="mt-1 flex flex-col sm:flex-row sm:flex-wrap sm:mt-0 sm:space-x-6">
                                <div className="mt-2 flex items-center text-sm text-gray-500">
                                    <CalendarIcon className="flex-shrink-0 mr-1.5 h-5 w-5 text-gray-400" />
                                    Created {new Date(job.createdAt).toLocaleDateString()}
                                </div>
                                <div className="mt-2 flex items-center text-sm text-gray-500">
                                    <span
                                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${job.status === 'active'
                                            ? 'bg-green-100 text-green-800'
                                            : 'bg-gray-100 text-gray-800'
                                            }`}
                                    >
                                        {job.status}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="mt-4 flex space-x-3 md:mt-0 md:ml-4">
                    <Link
                        to={`/jobs/${job.id}/assessment`}
                        className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                    >
                        <ClipboardDocumentListIcon className="-ml-1 mr-2 h-5 w-5" />
                        Assessment
                    </Link>
                    <Link
                        to="/candidates"
                        className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                    >
                        <UsersIcon className="-ml-1 mr-2 h-5 w-5" />
                        View Candidates
                    </Link>
                </div>
            </div>

            {/* Content */}
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                {/* Main content */}
                <div className="lg:col-span-2">
                    <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                        <div className="px-4 py-5 sm:px-6">
                            <h3 className="text-lg leading-6 font-medium text-gray-900">
                                Job Description
                            </h3>
                        </div>
                        <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
                            <div className="prose max-w-none">
                                <p className="text-gray-700 whitespace-pre-wrap">{job.description}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Tags */}
                    {job.tags.length > 0 && (
                        <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                            <div className="px-4 py-5 sm:px-6">
                                <h3 className="text-lg leading-6 font-medium text-gray-900 flex items-center">
                                    <TagIcon className="h-5 w-5 mr-2" />
                                    Tags
                                </h3>
                            </div>
                            <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
                                <div className="flex flex-wrap gap-2">
                                    {job.tags.map((tag: string) => (
                                        <span
                                            key={tag}
                                            className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary-100 text-primary-800"
                                        >
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Quick Actions */}
                    <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                        <div className="px-4 py-5 sm:px-6">
                            <h3 className="text-lg leading-6 font-medium text-gray-900">
                                Quick Actions
                            </h3>
                        </div>
                        <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
                            <div className="space-y-3">
                                <Link
                                    to={`/jobs/${job.id}/assessment`}
                                    className="w-full inline-flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                                >
                                    <ClipboardDocumentListIcon className="h-4 w-4 mr-2" />
                                    Manage Assessment
                                </Link>
                                <Link
                                    to="/candidates"
                                    className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                                >
                                    <UsersIcon className="h-4 w-4 mr-2" />
                                    View Candidates
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* Job Info */}
                    <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                        <div className="px-4 py-5 sm:px-6">
                            <h3 className="text-lg leading-6 font-medium text-gray-900">
                                Job Information
                            </h3>
                        </div>
                        <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
                            <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                                <div>
                                    <dt className="text-sm font-medium text-gray-500">Status</dt>
                                    <dd className="mt-1 text-sm text-gray-900">
                                        <span
                                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${job.status === 'active'
                                                ? 'bg-green-100 text-green-800'
                                                : 'bg-gray-100 text-gray-800'
                                                }`}
                                        >
                                            {job.status}
                                        </span>
                                    </dd>
                                </div>
                                <div>
                                    <dt className="text-sm font-medium text-gray-500">Created</dt>
                                    <dd className="mt-1 text-sm text-gray-900">
                                        {new Date(job.createdAt).toLocaleDateString()}
                                    </dd>
                                </div>
                                <div>
                                    <dt className="text-sm font-medium text-gray-500">Last Updated</dt>
                                    <dd className="mt-1 text-sm text-gray-900">
                                        {new Date(job.updatedAt).toLocaleDateString()}
                                    </dd>
                                </div>
                                <div>
                                    <dt className="text-sm font-medium text-gray-500">Order</dt>
                                    <dd className="mt-1 text-sm text-gray-900">
                                        {job.order}
                                    </dd>
                                </div>
                            </dl>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

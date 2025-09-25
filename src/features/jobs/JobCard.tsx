import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Link } from 'react-router-dom';
import {
    Bars3Icon,
    ArchiveBoxIcon,
    ArchiveBoxXMarkIcon,
    PencilIcon,
    EyeIcon
} from '@heroicons/react/24/outline';
import { type Job } from '../../lib/api';

interface JobCardProps {
    job: Job;
    onReorder: (id: string, newOrder: number) => void;
    onStatusToggle: (job: Job) => void;
    isReordering: boolean;
}

export default function JobCard({ job, onReorder, onStatusToggle, isReordering }: JobCardProps) {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: job.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    const handleStatusToggle = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        onStatusToggle(job);
    };

    return (
        <li
            ref={setNodeRef}
            style={style}
            className={`bg-white hover:bg-gray-50 transition-colors ${isDragging ? 'shadow-lg' : ''
                }`}
        >
            <div className="px-4 py-4 sm:px-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center min-w-0 flex-1">
                        {/* Drag handle */}
                        <div
                            {...attributes}
                            {...listeners}
                            className="flex-shrink-0 mr-3 cursor-grab active:cursor-grabbing"
                        >
                            <Bars3Icon className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                        </div>

                        {/* Job content */}
                        <div className="min-w-0 flex-1">
                            <div className="flex items-center space-x-3">
                                <Link
                                    to={`/jobs/${job.id}`}
                                    className="text-lg font-medium text-gray-900 hover:text-primary-600 truncate"
                                >
                                    {job.title}
                                </Link>
                                <span
                                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${job.status === 'active'
                                            ? 'bg-green-100 text-green-800'
                                            : 'bg-gray-100 text-gray-800'
                                        }`}
                                >
                                    {job.status}
                                </span>
                            </div>

                            <div className="mt-1">
                                <p className="text-sm text-gray-500 line-clamp-2">
                                    {job.description}
                                </p>
                            </div>

                            {/* Tags */}
                            {job.tags.length > 0 && (
                                <div className="mt-2 flex flex-wrap gap-1">
                                    {job.tags.slice(0, 3).map((tag) => (
                                        <span
                                            key={tag}
                                            className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-primary-100 text-primary-800"
                                        >
                                            {tag}
                                        </span>
                                    ))}
                                    {job.tags.length > 3 && (
                                        <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-600">
                                            +{job.tags.length - 3} more
                                        </span>
                                    )}
                                </div>
                            )}

                            <div className="mt-2 text-xs text-gray-400">
                                Created {new Date(job.createdAt).toLocaleDateString()}
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center space-x-2 ml-4">
                        <Link
                            to={`/jobs/${job.id}`}
                            className="p-2 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-100"
                            title="View details"
                        >
                            <EyeIcon className="h-4 w-4" />
                        </Link>

                        <Link
                            to={`/jobs/${job.id}/assessment`}
                            className="p-2 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-100"
                            title="Assessment"
                        >
                            <PencilIcon className="h-4 w-4" />
                        </Link>

                        <button
                            onClick={handleStatusToggle}
                            disabled={isReordering}
                            className={`p-2 rounded-md hover:bg-gray-100 transition-colors ${job.status === 'active'
                                    ? 'text-yellow-600 hover:text-yellow-700'
                                    : 'text-green-600 hover:text-green-700'
                                } disabled:opacity-50 disabled:cursor-not-allowed`}
                            title={job.status === 'active' ? 'Archive job' : 'Activate job'}
                        >
                            {job.status === 'active' ? (
                                <ArchiveBoxIcon className="h-4 w-4" />
                            ) : (
                                <ArchiveBoxXMarkIcon className="h-4 w-4" />
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </li>
    );
}

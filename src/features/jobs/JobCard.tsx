import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Link } from 'react-router-dom';
import { type Job } from '../../lib/api';
import { Bars3Icon, EyeIcon, PencilIcon, ArchiveBoxIcon, ArchiveBoxXMarkIcon } from '@heroicons/react/24/outline';

interface JobCardProps {
    job: Job;
    onStatusToggle: (job: Job) => void;
    isReordering: boolean;
}

export default function JobCard({ job, onStatusToggle, isReordering }: JobCardProps) {
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
            className="flex items-center justify-between p-4 bg-white"
        >
            <div className="flex items-center space-x-4">
                <button
                    {...attributes}
                    {...listeners}
                    className="cursor-grab p-2 text-gray-400 hover:bg-gray-100 rounded-md"
                    disabled={isReordering}
                >
                    <Bars3Icon className="h-5 w-5" />
                </button>
                <div className="flex-grow">
                    <Link to={`/jobs/${job.id}`} className="font-medium text-primary-600 hover:underline">
                        {job.title}
                    </Link>
                    <div className="text-sm text-gray-500">/{job.slug}</div>
                </div>
            </div>
            <div className="flex items-center space-x-4">
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
        </li>
    );
}

import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { api } from '../lib/api';
import CandidatesKanban from '../features/candidates/CandidatesKanban';

export default function JobCandidatesPage() {
    const { jobId } = useParams<{ jobId: string }>();

    const { data: job, isLoading: jobLoading, error: jobError } = useQuery({
        queryKey: ['job', jobId],
        queryFn: () => api.getJob(jobId!),
        enabled: !!jobId,
    });

    const { data: candidatesResp, isLoading } = useQuery({
        queryKey: ['candidates', { jobId }],
        queryFn: () => api.getCandidates({ jobId, page: 1, pageSize: 200 }),
        enabled: !!jobId,
    });

    if (jobError) {
        return (
            <div className="p-6">
                <Link to={`/jobs/${jobId}`} className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-primary-700 mb-4">
                    <ArrowLeftIcon className="h-4 w-4" /> Back to Job
                </Link>
                <p className="text-red-600">Failed to load job.</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <Link to={`/jobs/${jobId}`} className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-primary-700">
                    <ArrowLeftIcon className="h-4 w-4" /> Back to Job
                </Link>
                {job && <h2 className="text-xl font-semibold text-gray-900">Candidates for {job.title}</h2>}
            </div>
            {isLoading || jobLoading ? (
                <div className="p-8 text-center text-gray-500">Loading...</div>
            ) : (
                <CandidatesKanban candidates={(candidatesResp?.data as any[] ?? []).map(c => ({ ...c, currentStage: c.stage }))} />
            )}
        </div>
    );
}



import { Link } from 'react-router-dom';
import { useVirtualizer } from '@tanstack/react-virtual';
import { useRef } from 'react';
import { EyeIcon } from '@heroicons/react/24/outline';
import { type Candidate } from '../../lib/api';

interface CandidatesListProps {
    candidates: (Candidate & { stage: Candidate['currentStage'] })[];
}

const stages = [
    { id: 'applied', name: 'Applied', color: 'bg-blue-100 text-blue-800' },
    { id: 'screen', name: 'Screen', color: 'bg-yellow-100 text-yellow-800' },
    { id: 'tech', name: 'Tech', color: 'bg-purple-100 text-purple-800' },
    { id: 'final', name: 'Final', color: 'bg-orange-100 text-orange-800' },
    { id: 'hired', name: 'Hired', color: 'bg-green-100 text-green-800' },
    { id: 'rejected', name: 'Rejected', color: 'bg-red-100 text-red-800' },
];

function CandidateRow({ candidate }: { candidate: Candidate & { stage: Candidate['currentStage'] } }) {
    const stageInfo = stages.find(s => s.id === candidate.stage) || stages[0];

    return (
        <div className="flex items-center justify-between py-4 px-6 border-b border-gray-200 hover:bg-gray-50">
            <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-4">
                    <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-medium text-gray-900 truncate">
                            {candidate.name}
                        </h3>
                        <p className="text-sm text-gray-500 truncate">
                            {candidate.email}
                        </p>
                        {candidate.phone && (
                            <p className="text-xs text-gray-400 truncate">
                                {candidate.phone}
                            </p>
                        )}
                    </div>
                    <div className="flex-shrink-0">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${stageInfo.color}`}>
                            {stageInfo.name}
                        </span>
                    </div>
                </div>
            </div>
            <div className="flex items-center space-x-2 ml-4">
                <Link
                    to={`/candidates/${candidate.id}`}
                    className="p-2 text-gray-400 hover:text-gray-600 rounded-md hover:bg-gray-100"
                    title="View details"
                >
                    <EyeIcon className="h-4 w-4" />
                </Link>
            </div>
        </div>
    );
}

export default function CandidatesList({ candidates }: CandidatesListProps) {
    const parentRef = useRef<HTMLDivElement>(null);

    const virtualizer = useVirtualizer({
        count: candidates.length,
        getScrollElement: () => parentRef.current,
        estimateSize: () => 80, // Estimated height of each row
        overscan: 5, // Number of items to render outside the visible area
    });

    const items = virtualizer.getVirtualItems();

    return (
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
            <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
                <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium text-gray-900">
                        {candidates.length} candidate{candidates.length !== 1 ? 's' : ''}
                    </h3>
                    <div className="text-xs text-gray-500">
                        Virtualized list for performance
                    </div>
                </div>
            </div>

            <div
                ref={parentRef}
                className="h-96 overflow-auto"
                style={{
                    contain: 'strict',
                }}
            >
                <div
                    style={{
                        height: `${virtualizer.getTotalSize()}px`,
                        width: '100%',
                        position: 'relative',
                    }}
                >
                    {items.map((virtualItem) => {
                        const candidate = candidates[virtualItem.index];
                        return (
                            <div
                                key={virtualItem.key}
                                style={{
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    width: '100%',
                                    height: `${virtualItem.size}px`,
                                    transform: `translateY(${virtualItem.start}px)`,
                                }}
                            >
                                <CandidateRow candidate={candidate} />
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}

interface LoadingSkeletonProps {
    className?: string;
}

export function Skeleton({ className = '' }: LoadingSkeletonProps) {
    return (
        <div className={`animate-pulse bg-gray-200 rounded ${className}`} />
    );
}

export function JobCardSkeleton() {
    return (
        <div className="bg-white p-4 border-b border-gray-200">
            <div className="flex items-center space-x-3">
                <Skeleton className="h-5 w-5" />
                <div className="flex-1 space-y-2">
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-4 w-full" />
                    <div className="flex space-x-2">
                        <Skeleton className="h-6 w-16" />
                        <Skeleton className="h-6 w-20" />
                    </div>
                </div>
                <div className="flex space-x-2">
                    <Skeleton className="h-8 w-8" />
                    <Skeleton className="h-8 w-8" />
                    <Skeleton className="h-8 w-8" />
                </div>
            </div>
        </div>
    );
}

export function CandidateCardSkeleton() {
    return (
        <div className="bg-white p-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3 flex-1">
                    <div className="space-y-2 flex-1">
                        <Skeleton className="h-5 w-1/3" />
                        <Skeleton className="h-4 w-1/2" />
                        <Skeleton className="h-3 w-1/4" />
                    </div>
                </div>
                <div className="flex space-x-2">
                    <Skeleton className="h-8 w-8" />
                    <Skeleton className="h-8 w-8" />
                </div>
            </div>
        </div>
    );
}

export function KanbanColumnSkeleton() {
    return (
        <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
                <Skeleton className="h-5 w-20" />
                <Skeleton className="h-6 w-6 rounded-full" />
            </div>
            <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="bg-white p-3 rounded-lg border border-gray-200">
                        <div className="space-y-2">
                            <Skeleton className="h-4 w-3/4" />
                            <Skeleton className="h-3 w-1/2" />
                            <Skeleton className="h-3 w-1/3" />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

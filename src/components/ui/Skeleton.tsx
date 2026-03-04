interface SkeletonProps {
    className?: string;
}

/**
 * Shimmer loading placeholder.
 * Callers control dimensions via className (e.g. "h-4 w-32").
 */
export function Skeleton({ className = '' }: SkeletonProps) {
    return (
        <div
            aria-hidden="true"
            className={`animate-shimmer rounded-md ${className}`}
        />
    );
}

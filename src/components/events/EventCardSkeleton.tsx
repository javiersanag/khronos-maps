import { Card } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';

/**
 * Pixel-perfect loading placeholder for the EventCard.
 * Uses identical layout structures to prevent layout shift.
 */
export function EventCardSkeleton() {
    return (
        <Card className="flex flex-col gap-3">
            {/* Header: Name and Date */}
            <div className="flex justify-between items-start gap-4">
                <div className="flex-1">
                    <Skeleton className="h-5 w-3/4 mb-2" />
                    <Skeleton className="h-5 w-1/2" />
                </div>
                <Skeleton className="h-4 w-24 pt-1" />
            </div>

            {/* Middle: Location */}
            <Skeleton className="h-4 w-2/3" />

            {/* Footer: Metadata and Badges */}
            <div className="flex items-center justify-between mt-1">
                <div className="flex items-center gap-4">
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="h-4 w-12" />
                </div>
                <Skeleton className="h-6 w-16 rounded-full" />
            </div>
        </Card>
    );
}

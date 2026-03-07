import { Card } from '@/components/ui/Card';
import { Skeleton } from '@/components/ui/Skeleton';

/**
 * Pixel-perfect loading placeholder for the EventCard.
 * Uses identical layout structures to prevent layout shift.
 */
export function EventCardSkeleton() {
    return (
        <Card className="flex flex-col gap-2.5 border-l-4 border-l-slate-800">
            {/* Header: Name and Date */}
            <div className="flex justify-between items-start gap-3">
                <div className="flex-1">
                    <Skeleton className="h-4 w-3/4 mb-1.5" />
                    <Skeleton className="h-4 w-1/2" />
                </div>
                <Skeleton className="h-3 w-16 pt-1" />
            </div>

            {/* Middle: Location */}
            <Skeleton className="h-3 w-2/3" />

            {/* Footer: Metadata and Badges */}
            <div className="flex items-center justify-between mt-0.5">
                <div className="flex items-center gap-3">
                    <Skeleton className="h-3 w-12" />
                    <Skeleton className="h-3 w-10" />
                </div>
                <Skeleton className="h-5 w-14 rounded-full" />
            </div>
        </Card>
    );
}

import { eq, and, ne, between } from 'drizzle-orm';
import { db } from '@/lib/db';
import { events } from '@/lib/db/schema';
import { EventCard } from '@/components/events/EventCard';
import { NormalizedEvent } from '@/types/event';

interface NearbyEventsProps {
    currentEventId: string;
    province: string;
    date: Date | string;
}

export async function NearbyEvents({ currentEventId, province, date }: NearbyEventsProps) {
    const baseDate = new Date(date);

    // Calculate +/- 30 days
    const startDate = new Date(baseDate);
    startDate.setDate(startDate.getDate() - 30);

    const endDate = new Date(baseDate);
    endDate.setDate(endDate.getDate() + 30);

    const nearbyEvents = await db.query.events.findMany({
        where: and(
            eq(events.province, province),
            ne(events.id, currentEventId),
            between(events.date, startDate, endDate)
        ),
        limit: 5,
    });

    if (!nearbyEvents || nearbyEvents.length === 0) {
        return null; // Return null to render nothing if no nearby
    }

    return (
        <div className="flex flex-col gap-4">
            {nearbyEvents.map((evt) => {
                // Ensure correct type parsing for Client Component props
                const normalizedEvt: NormalizedEvent = {
                    ...evt,
                    date: evt.date,
                    coordinates: evt.coordinates as { lat: number; lng: number } | null,
                } as unknown as NormalizedEvent;

                return (
                    <div key={evt.id} className="w-full">
                        <EventCard event={normalizedEvt} />
                    </div>
                );
            })}
        </div>
    );
}

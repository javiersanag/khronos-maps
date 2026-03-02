import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { events } from '@/lib/db/schema';
import { eq, and, ne, gte, lte } from 'drizzle-orm';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ slug: string }> }
) {
    const resolvedParams = await params;
    const slug = resolvedParams.slug;

    console.log('--- API Hit for slug:', slug, '---');

    // 1. Find target event
    const event = await db.query.events.findFirst({
        where: eq(events.slug, slug)
    });

    console.log('Query result event:', event ? event.name : 'null');

    if (!event) {
        return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    // 2. Find nearby events (same province, +/- 30 days)
    const thirtyDaysMs = 30 * 24 * 60 * 60 * 1000;
    const minDate = new Date(event.date.getTime() - thirtyDaysMs);
    const maxDate = new Date(event.date.getTime() + thirtyDaysMs);

    const nearbyEvents = await db.query.events.findMany({
        where: and(
            eq(events.province, event.province),
            ne(events.id, event.id),
            // The schema maps INTEGER to Javascript Date objects when using mode: 'timestamp'
            gte(events.date, minDate),
            lte(events.date, maxDate)
        ),
        limit: 5,
    });

    // 3. Return combined payload with cache headers
    return NextResponse.json({
        event,
        nearby: nearbyEvents
    }, {
        headers: {
            'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
        }
    });
}

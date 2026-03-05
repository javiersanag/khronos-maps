import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { events } from '@/lib/db/schema';
import { sql, and, eq, gte, lte, asc, desc } from 'drizzle-orm';
import { eventsQuerySchema } from '@/lib/validations/events';

export async function GET(req: NextRequest) {
    try {
        const searchParams = Object.fromEntries(req.nextUrl.searchParams.entries());
        const result = eventsQuerySchema.safeParse(searchParams);

        if (!result.success) {
            return NextResponse.json(
                { error: 'Invalid query parameters', details: result.error.format() },
                { status: 400 }
            );
        }

        const { limit, offset, bounds, format, minDistance, maxDistance, startDate, endDate, sort } = result.data;

        // 2. Build where conditions
        const conditions = [];

        // Geolocation Bounds Filter
        if (bounds) {
            const { latSW, lngSW, latNE, lngNE } = bounds;
            // SQLite JSON extraction for map bounds
            conditions.push(sql`json_extract(coordinates, '$.lat') BETWEEN ${latSW} AND ${latNE}`);
            conditions.push(sql`json_extract(coordinates, '$.lng') BETWEEN ${lngSW} AND ${lngNE}`);
        }

        // Format Filter
        if (format) {
            conditions.push(eq(events.format, format));
        }

        // Distance Filters
        if (minDistance !== undefined) {
            conditions.push(gte(events.distance, minDistance));
        }

        if (maxDistance !== undefined) {
            conditions.push(lte(events.distance, maxDistance));
        }

        // Date Filters
        if (startDate) {
            conditions.push(gte(events.date, startDate));
        }

        if (endDate) {
            conditions.push(lte(events.date, endDate));
        }

        // Combine all filters
        const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

        // 3. Sorting
        let orderByClause;
        switch (sort) {
            case 'date_desc':
                orderByClause = desc(events.date);
                break;
            case 'distance_asc':
                orderByClause = asc(events.distance);
                break;
            case 'distance_desc':
                orderByClause = desc(events.distance);
                break;
            case 'date_asc':
            default:
                orderByClause = asc(events.date);
                break;
        }

        // 4. Execute Queries concurrently
        const [data, totalCountResult] = await Promise.all([
            db.query.events.findMany({
                where: whereClause,
                orderBy: orderByClause,
                limit,
                offset,
            }),
            db.select({ count: sql<number>`cast(count(${events.id}) as integer)` })
                .from(events)
                .where(whereClause)
        ]);

        const total = totalCountResult[0]?.count || 0;

        // 5. Return Response
        return NextResponse.json({
            data,
            pagination: {
                total,
                limit,
                offset,
            }
        });

    } catch (error) {
        console.error('[API/Events] Error fetching events:', error);
        return NextResponse.json(
            { error: 'Failed to fetch events' },
            { status: 500 }
        );
    }
}

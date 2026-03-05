import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { events } from '@/lib/db/schema';
import { sql, and, eq, gte, lte, asc, desc } from 'drizzle-orm';

export async function GET(req: NextRequest) {
    try {
        const searchParams = req.nextUrl.searchParams;

        // 1. Pagination
        const limitStr = searchParams.get('limit');
        const offsetStr = searchParams.get('offset');
        const limit = limitStr ? parseInt(limitStr, 10) : 50;
        const offset = offsetStr ? parseInt(offsetStr, 10) : 0;

        // Ensure safe pagination limits
        const safeLimit = Math.min(Math.max(1, limit), 100);
        const safeOffset = Math.max(0, offset);

        // 2. Build where conditions
        const conditions = [];

        // Geolocation Bounds Filter
        // Format: bounds=latSW,lngSW,latNE,lngNE (e.g. 36.0,-5.0,43.0,3.0)
        const boundsStr = searchParams.get('bounds');
        if (boundsStr) {
            const parts = boundsStr.split(',').map(parseFloat);
            if (parts.length === 4 && parts.every(p => !isNaN(p))) {
                const [latSW, lngSW, latNE, lngNE] = parts;

                // SQLite JSON extraction for map bounds
                conditions.push(sql`json_extract(coordinates, '$.lat') BETWEEN ${latSW} AND ${latNE}`);
                conditions.push(sql`json_extract(coordinates, '$.lng') BETWEEN ${lngSW} AND ${lngNE}`);
            }
        }

        // Format Filter
        const formatStr = searchParams.get('format');
        if (formatStr) {
            conditions.push(eq(events.format, formatStr));
        }

        // Distance Filters
        const minDistanceStr = searchParams.get('minDistance');
        if (minDistanceStr && !isNaN(parseFloat(minDistanceStr))) {
            conditions.push(gte(events.distance, parseFloat(minDistanceStr)));
        }

        const maxDistanceStr = searchParams.get('maxDistance');
        if (maxDistanceStr && !isNaN(parseFloat(maxDistanceStr))) {
            conditions.push(lte(events.distance, parseFloat(maxDistanceStr)));
        }

        // Date Filters (timestamps)
        const startDateStr = searchParams.get('startDate');
        if (startDateStr) {
            const date = new Date(startDateStr);
            if (!isNaN(date.getTime())) {
                conditions.push(gte(events.date, date));
            }
        }

        const endDateStr = searchParams.get('endDate');
        if (endDateStr) {
            const date = new Date(endDateStr);
            if (!isNaN(date.getTime())) {
                conditions.push(lte(events.date, date));
            }
        }

        // Combine all filters
        const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

        // 3. Sorting
        const sortParam = searchParams.get('sort') || 'date_asc';
        let orderByClause;

        switch (sortParam) {
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
                limit: safeLimit,
                offset: safeOffset,
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
                limit: safeLimit,
                offset: safeOffset,
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

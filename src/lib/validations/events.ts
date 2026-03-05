import { z } from 'zod';

export const eventsQuerySchema = z.object({
    limit: z.coerce.number().min(1).max(100).default(50),
    offset: z.coerce.number().min(0).default(0),
    bounds: z.string().optional().transform((val) => {
        if (!val) return undefined;
        const parts = val.split(',').map(parseFloat);
        if (parts.length === 4 && parts.every(p => !isNaN(p))) {
            return {
                latSW: parts[0],
                lngSW: parts[1],
                latNE: parts[2],
                lngNE: parts[3],
            };
        }
        return undefined;
    }),
    format: z.string().optional(),
    minDistance: z.coerce.number().optional(),
    maxDistance: z.coerce.number().optional(),
    startDate: z.string().optional().transform((val) => {
        if (!val) return undefined;
        const date = new Date(val);
        return isNaN(date.getTime()) ? undefined : date;
    }),
    endDate: z.string().optional().transform((val) => {
        if (!val) return undefined;
        const date = new Date(val);
        return isNaN(date.getTime()) ? undefined : date;
    }),
    sort: z.enum(['date_asc', 'date_desc', 'distance_asc', 'distance_desc']).default('date_asc'),
});

export type EventsQuery = z.infer<typeof eventsQuerySchema>;

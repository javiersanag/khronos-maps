import { InferInsertModel } from 'drizzle-orm';
import { events } from '@/lib/db/schema';

/** Unstructured data from an arbitrary source */
export type RawEvent = Record<string, unknown>;

/** 
 * Event formatted to match the Turso `events` schema for insertion.
 * InferInsertModel infers the type directly from the drizzle schema definition.
 */
export type NormalizedEvent = InferInsertModel<typeof events>;

/** Outcome payload logged after every scrape job */
export interface ScrapeResult {
    itemsDiscovered: number;
    itemsAdded: number;
    itemsUpdated: number; // For future tracking
    errors: string[];
}

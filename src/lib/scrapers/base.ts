import { db } from '@/lib/db';
import { events, scrape_log } from '@/lib/db/schema';
import { NormalizedEvent, RawEvent, ScrapeResult } from '@/types/event';
import { eq } from 'drizzle-orm';

/**
 * Basic sleep helper for rate limiting and backoff mechanisms.
 */
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export abstract class BaseScraper {
    protected readonly sourceName: string;

    // Abstract methods to be implemented by child classes (specific to each target site)
    abstract scrape(): Promise<ScrapeResult>;
    abstract normalize(raw: RawEvent): NormalizedEvent;

    constructor(sourceName: string) {
        this.sourceName = sourceName;
    }

    /**
     * Robust fetch wrapper with exponential backoff, timeout, and basic rate limiting (1 req/seq).
     * @param url The URL to fetch
     * @param options Native fetch RequestInit options
     * @param maxRetries How many times to retry transient failures
     */
    protected async fetchPage(url: string, options: RequestInit = {}, maxRetries = 3): Promise<Response> {
        let attempt = 0;

        while (attempt < maxRetries) {
            // Apply 1s base rate limit between arbitrary consecutive requests
            await sleep(1000);

            // 30 second abort controller per request
            const controller = new AbortController();
            const id = setTimeout(() => controller.abort(), 30000);

            try {
                const response = await fetch(url, {
                    ...options,
                    signal: controller.signal,
                });

                clearTimeout(id);

                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }

                return response;
            } catch (error: any) {
                clearTimeout(id);
                attempt++;
                console.warn(`[${this.sourceName}] Fetch failed for ${url} (Attempt ${attempt}/${maxRetries}): ${error.message}`);

                if (attempt >= maxRetries) {
                    throw new Error(`Failed to fetch ${url} after ${maxRetries} attempts`);
                }

                // Exponential backoff: 1s, 2s, 4s...
                const backoff = Math.pow(2, attempt) * 1000;
                await sleep(backoff);
            }
        }

        throw new Error('Unreachable fetchPage exit');
    }

    /**
     * Shared database upsert logic.
     * Takes fully normalized events and safely attempts to insert/update them into Turso.
     */
    protected async save(normalizedEvents: NormalizedEvent[]): Promise<{ added: number, updated: number, errors: string[] }> {
        let added = 0;
        let updated = 0;
        const errors: string[] = [];

        // Processing one-by-one (or in small chunks) ensures one bad event doesn't crash the whole batch
        for (const event of normalizedEvents) {
            try {
                // Using runnea_id as the primary logical uniqueness constraint per the schema
                const existing = await db.query.events.findFirst({
                    where: (events, { eq }) => eq(events.runnea_id, event.runnea_id)
                });

                if (existing) {
                    await db.update(events)
                        .set({
                            ...event,
                            updated_at: new Date() // Ensure timestamp ticks
                        })
                        .where(eq(events.runnea_id, event.runnea_id)); // Drizzle where clause syntax natively

                    updated++;
                } else {
                    await db.insert(events).values(event);
                    added++;
                }

            } catch (err: any) {
                console.error(`[${this.sourceName}] Error saving event ${event.slug || event.name}:`, err);
                errors.push(`Failed to save ${event.slug}: ${err.message}`);
            }
        }

        return { added, updated, errors };
    }

    /**
     * Shared hook to write execution analytics to the DB scrape_log table.
     */
    protected async logResult(result: ScrapeResult): Promise<void> {
        try {
            await db.insert(scrape_log).values({
                items_discovered: result.itemsDiscovered,
                items_added: result.itemsAdded,
                items_updated: result.itemsUpdated,
                errors: result.errors,
                completed_at: new Date(),
            });
            console.log(`[${this.sourceName}] Scrape finished. Logged to DB.`);
        } catch (err) {
            console.error(`[${this.sourceName}] Critical Failure: Could not write to scrape log:`, err);
        }
    }
}

import { db } from '@/lib/db';
import { events, scrape_log } from '@/lib/db/schema';
import { NormalizedEvent, RawEvent, ScrapeResult } from '@/types/event';
import { eq } from 'drizzle-orm';

/** Sleep helper for rate limiting and exponential backoff. */
const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

export abstract class BaseScraper {
    protected readonly sourceName: string;

    constructor(sourceName: string) {
        this.sourceName = sourceName;
    }

    /** Entry point — implemented by each source-specific scraper. */
    abstract scrape(): Promise<ScrapeResult>;

    /** Each scraper must transform its raw source data into the canonical NormalizedEvent shape. */
    abstract normalize(raw: RawEvent): NormalizedEvent;

    /**
     * Fetch a page with a 30-second timeout, up to {@link maxRetries} attempts,
     * and exponential backoff (1 s → 2 s → 4 s…).
     * A mandatory 1-second pause before every attempt enforces a 1 req/sec rate limit.
     */
    protected async fetchPage(url: string, options: RequestInit = {}, maxRetries = 3): Promise<Response> {
        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            // 1 req/sec baseline rate limit
            await sleep(1000);

            const controller = new AbortController();
            const timer = setTimeout(() => controller.abort(), 30_000);

            try {
                const response = await fetch(url, { ...options, signal: controller.signal });
                clearTimeout(timer);

                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }
                return response;
            } catch (err: unknown) {
                clearTimeout(timer);
                const msg = err instanceof Error ? err.message : String(err);
                console.warn(`[${this.sourceName}] fetch failed (${attempt}/${maxRetries}): ${msg}`);

                if (attempt === maxRetries) {
                    throw new Error(`Failed to fetch "${url}" after ${maxRetries} attempts: ${msg}`);
                }

                // Exponential backoff: 2^attempt × 1000 ms (2s, 4s, 8s…)
                await sleep(Math.pow(2, attempt) * 1000);
            }
        }

        // Safe unreachable guard — the for-loop always throws or returns before here
        throw new Error('fetchPage: unreachable');
    }

    /**
     * Upsert normalized events into the DB one-by-one so that a single bad
     * record cannot abort the entire batch.
     */
    protected async save(normalizedEvents: NormalizedEvent[]): Promise<{ added: number; updated: number; errors: string[] }> {
        let added = 0;
        let updated = 0;
        const errors: string[] = [];

        for (const event of normalizedEvents) {
            try {
                const existing = await db.query.events.findFirst({
                    where: (tbl, { eq: eqFn }) => eqFn(tbl.runnea_id, event.runnea_id),
                });

                if (existing) {
                    await db.update(events)
                        .set({ ...event, updated_at: new Date() })
                        .where(eq(events.runnea_id, event.runnea_id));
                    updated++;
                } else {
                    await db.insert(events).values(event);
                    added++;
                }
            } catch (err: unknown) {
                const msg = err instanceof Error ? err.message : String(err);
                const key = event.slug ?? event.name ?? String(event.runnea_id);
                console.error(`[${this.sourceName}] Error saving "${key}":`, err);
                errors.push(`Failed to save "${key}": ${msg}`);
            }
        }

        return { added, updated, errors };
    }

    /** Write scrape execution stats to the `scrape_log` table. */
    protected async logResult(result: ScrapeResult): Promise<void> {
        try {
            await db.insert(scrape_log).values({
                source: this.sourceName,
                items_discovered: result.itemsDiscovered,
                items_added: result.itemsAdded,
                items_updated: result.itemsUpdated,
                errors: result.errors,
                completed_at: new Date(),
            });
            console.log(`[${this.sourceName}] Result logged.`);
        } catch (err) {
            console.error(`[${this.sourceName}] Failed to write scrape log:`, err);
        }
    }
}

import { BaseScraper } from './base';
import { RawEvent, NormalizedEvent, ScrapeResult } from '../../types/event';

const ROCK_THE_SPORT_BASE_URL = 'https://www.rockthesport.com/es';
const ROCK_THE_SPORT_API_URL = 'https://publicservice.rockthesport.com/api/event/es/category/running';
const ROCK_THE_SPORT_API_KEY = 'rts_public_web_2024_a8f3d9e1c4b7';

// Mapping from RockTheSport province IDs to province names
// These mapped values should align well with the database/geocoding expectations
const PROVINCE_MAP: Record<number, string> = {
    109: 'Valencia',
    49: 'León',
    38: 'Gipuzkoa',
    92: 'Cantabria',
    160: 'Granada',
    75: 'Navarra',
    52: 'Lleida',
    // We will expand this map as we discover more IDs during scraping,
    // or we can just fall back to preserving the ID or null if unknown.
};

export class RockTheSportScraper extends BaseScraper {
    constructor() {
        super('rockthesport');
    }

    async scrape(): Promise<ScrapeResult> {
        const result: ScrapeResult = { itemsDiscovered: 0, itemsAdded: 0, itemsUpdated: 0, errors: [] };
        try {
            let pageNumber = 1;
            let hasMore = true;

            // limit to 2 pages for testing runs
            while (hasMore && pageNumber <= 2) {
                console.log(`Fetching RTS page ${pageNumber}...`);
                const rawEvents = await this.fetchListPage(pageNumber);
                if (!rawEvents || rawEvents.length === 0) {
                    hasMore = false;
                    break;
                }

                result.itemsDiscovered += rawEvents.length;

                const normalizedEvents: NormalizedEvent[] = [];
                for (const raw of rawEvents) {
                    try {
                        normalizedEvents.push(this.normalize(raw));
                    } catch (err: unknown) {
                        const msg = err instanceof Error ? err.message : String(err);
                        result.errors.push(`Normalization error: ${msg}`);
                    }
                }

                const saveResult = await this.save(normalizedEvents);
                result.itemsAdded += saveResult.added;
                result.itemsUpdated += saveResult.updated;
                result.errors.push(...saveResult.errors);

                pageNumber++;
            }
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : String(err);
            result.errors.push(`Fatal scrape error: ${msg}`);
        }

        await this.logResult(result);
        return result;
    }

    async fetchListPage(page: number): Promise<RawEvent[]> {
        const payload = {
            "(a) orderBy": "data.dates.startedDateTimestamp",
            "(ge) data.dates.startedDateTimestamp": Date.now(),
            "kind": "country:65" // Spain
        };

        const result = await this.fetchPage(ROCK_THE_SPORT_API_URL + `?pageNumber=${page}&pageSize=50`, {
            method: 'POST',
            headers: {
                'x-api-key': ROCK_THE_SPORT_API_KEY,
                'content-type': 'application/json',
                'accept': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        const data = await result.json();
        return data?.data?.items || [];
    }

    async fetchDetail(event: RawEvent): Promise<any> {
        // As per the plan, we are skipping individual detail fetching to avoid SPA brittleness.
        // The list API provides ~90% of what we need.
        return null;
    }

    normalize(event: RawEvent): NormalizedEvent {
        // event is an item from the data.items array
        const runnea_id = Number(event.eventId); // Use their eventId (integer)
        const name = String(event.title || 'Unknown Event');
        const slug = String(event.slug || '');
        const rawDate = event.startedDateIso ? String(event.startedDateIso) : new Date().toISOString();
        const date = new Date(rawDate);

        const provId = event.provinceId as number | undefined;
        const provinceName = provId ? PROVINCE_MAP[provId] || `Provincia ${provId}` : 'Spain';
        const location = provinceName; // Just using province as general location for now

        let format = event.sport === 'trail' ? 'Trail' : 'Asfalto';
        const subsports = event.subsports as string[] | undefined;
        if (subsports && Array.isArray(subsports)) {
            if (subsports.includes('ultra marathon')) format = 'Ultra';
        }

        const website = `https://www.rockthesport.com/es/evento/${slug}`;
        const registration_link = `${website}/inscripcion`;

        // Approximate distances based on subsports array (e.g. '5km', '10km', 'half marathon', 'marathon')
        let distance: number | null = null;
        if (subsports && Array.isArray(subsports)) {
            if (subsports.includes('5km')) distance = 5;
            else if (subsports.includes('10km')) distance = 10;
            else if (subsports.includes('half marathon')) distance = 21.097;
            else if (subsports.includes('marathon')) distance = 42.195;
            else if (subsports.includes('15KM')) distance = 15;
            else if (subsports.includes('20KM')) distance = 20;
        }

        return {
            runnea_id,
            name,
            slug,
            date,
            location,
            province: provinceName,
            format,
            distance,
            elevation: null, // Hard to get from list API
            website,
            registration_link,
            price: null, // Detail required for accurate price
            status: 'UPCOMING'
        };
    }
}

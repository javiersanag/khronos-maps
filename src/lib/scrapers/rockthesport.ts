import { BaseScraper } from './base';
import { RawEvent, NormalizedEvent, ScrapeResult } from '../../types/event';

const API_BASE = 'https://publicservice.rockthesport.com/api/event/es/category';
const API_KEY = 'rts_public_web_2024_a8f3d9e1c4b7';
const PAGE_SIZE = 50;
const MAX_PAGES = 50; // safety cap — RTS has ~10-20 pages typically for running

/**
 * Maps RockTheSport internal province IDs to their canonical Spanish province names.
 * Sourced from the RTS API responses across running + trail categories.
 */
const PROVINCE_MAP: Record<number, string> = {
    1: 'Álava',
    2: 'Albacete',
    3: 'Alicante',
    4: 'Almería',
    5: 'Ávila',
    6: 'Badajoz',
    7: 'Baleares',
    8: 'Barcelona',
    9: 'Burgos',
    10: 'Cáceres',
    11: 'Cádiz',
    12: 'Castellón',
    13: 'Ciudad Real',
    14: 'Córdoba',
    15: 'La Coruña',
    16: 'Cuenca',
    17: 'Girona',
    18: 'Granada',
    19: 'Guadalajara',
    20: 'Guipúzcoa',
    21: 'Huelva',
    22: 'Huesca',
    23: 'Jaén',
    24: 'León',
    25: 'Lérida',
    26: 'La Rioja',
    27: 'Lugo',
    28: 'Madrid',
    29: 'Málaga',
    30: 'Murcia',
    31: 'Navarra',
    32: 'Ourense',
    33: 'Asturias',
    34: 'Palencia',
    35: 'Las Palmas',
    36: 'Pontevedra',
    37: 'Salamanca',
    38: 'Gipuzkoa',
    39: 'Santa Cruz de Tenerife',
    40: 'Cantabria',
    41: 'Segovia',
    42: 'Sevilla',
    43: 'Soria',
    44: 'Tarragona',
    45: 'Teruel',
    46: 'Toledo',
    47: 'Valencia',
    48: 'Valladolid',
    49: 'León',
    50: 'Zamora',
    51: 'Zaragoza',
    52: 'Lleida',
    53: 'Ceuta',
    54: 'Melilla',
    75: 'Navarra',
    92: 'Cantabria',
    109: 'Valencia',
    160: 'Granada',
};

/** Subsport string → distance in km mapping */
const SUBSPORT_DISTANCE_MAP: Record<string, number> = {
    '5km': 5,
    '10km': 10,
    '15KM': 15,
    '20KM': 20,
    'half marathon': 21.097,
    'marathon': 42.195,
};

export class RockTheSportScraper extends BaseScraper {
    constructor() {
        super('rockthesport');
    }

    async scrape(): Promise<ScrapeResult> {
        const result: ScrapeResult = {
            itemsDiscovered: 0,
            itemsAdded: 0,
            itemsUpdated: 0,
            errors: [],
        };

        for (const sport of ['running', 'trail'] as const) {
            try {
                await this.scrapeCategory(sport, result);
            } catch (err: unknown) {
                const msg = err instanceof Error ? err.message : String(err);
                result.errors.push(`Fatal error in category "${sport}": ${msg}`);
            }
        }

        await this.logResult(result);
        return result;
    }

    private async scrapeCategory(
        sport: 'running' | 'trail',
        result: ScrapeResult,
    ): Promise<void> {
        let pageNumber = 1;
        let hasMore = true;

        while (hasMore && pageNumber <= MAX_PAGES) {
            console.log(`[rockthesport] Fetching ${sport} page ${pageNumber}…`);
            const rawEvents = await this.fetchListPage(sport, pageNumber);

            if (!rawEvents.length) {
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
                    result.errors.push(`Normalization error (${sport} p${pageNumber}): ${msg}`);
                }
            }

            const saveResult = await this.save(normalizedEvents);
            result.itemsAdded += saveResult.added;
            result.itemsUpdated += saveResult.updated;
            result.errors.push(...saveResult.errors);

            // If the page returned fewer than PAGE_SIZE results, it's the last page.
            hasMore = rawEvents.length >= PAGE_SIZE;
            pageNumber++;
        }
    }

    private async fetchListPage(
        sport: 'running' | 'trail',
        page: number,
    ): Promise<RawEvent[]> {
        const url = `${API_BASE}/${sport}?pageNumber=${page}&pageSize=${PAGE_SIZE}`;
        const payload = {
            '(a) orderBy': 'data.dates.startedDateTimestamp',
            '(ge) data.dates.startedDateTimestamp': Date.now(),
            kind: 'country:65', // Spain
        };

        const response = await this.fetchPage(url, {
            method: 'POST',
            headers: {
                'x-api-key': API_KEY,
                'content-type': 'application/json',
                accept: 'application/json',
            },
            body: JSON.stringify(payload),
        });

        const data = await response.json();
        return (data?.data?.items as RawEvent[]) ?? [];
    }

    normalize(event: RawEvent): NormalizedEvent {
        const runnea_id = Number(event.eventId);
        const name = String(event.title || 'Unknown Event');
        const slug = String(event.slug || '');
        const rawDate = event.startedDateIso
            ? String(event.startedDateIso)
            : new Date().toISOString();
        const date = new Date(rawDate);

        const provId = event.provinceId as number | undefined;
        const province = provId
            ? (PROVINCE_MAP[provId] ?? `Provincia ${provId}`)
            : null;
        const location = province; // province is the finest location available from the list API

        const sport = String(event.sport ?? '');
        const subsports = (event.subsports as string[] | undefined) ?? [];

        // Terrain format: prefer subsport hints, fall back to top-level sport field
        let format = sport === 'trail' ? 'Trail' : 'Asfalto';
        if (subsports.includes('ultra marathon')) format = 'Ultra';

        // Distances: pick the first recognised subsport, prefer longer distances
        let distance: number | null = null;
        for (const sub of subsports) {
            if (sub in SUBSPORT_DISTANCE_MAP) {
                const d = SUBSPORT_DISTANCE_MAP[sub];
                if (distance === null || d > distance) distance = d;
            }
        }

        const website = `https://www.rockthesport.com/es/evento/${slug}`;
        const registration_link = `${website}/inscripcion`;

        return {
            runnea_id,
            name,
            slug: slug || '',
            date: date || '',
            location: location || '',
            province: province || '',
            format,
            distance,
            elevation: null,     // Not available from list API
            website,
            registration_link,
            price: null,          // Not available from list API
            status: 'UPCOMING',
        };
    }
}

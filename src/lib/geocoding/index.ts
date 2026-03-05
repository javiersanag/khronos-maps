import { db } from '../db';
import { geocode_cache } from '../db/schema';
import { eq } from 'drizzle-orm';

/** Sleep helper to enforce rate limiting and backoff */
const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

/**
 * Takes a location and province and returns coordinates.
 * Looks up the cache first; if not found, queries the Nominatim OSM API.
 * Nominatim has a strict rate limit of 1 request/second.
 */
export async function geocode(
    location: string | null,
    province: string | null
): Promise<{ lat: number; lng: number } | null> {
    // 1. Compose search string
    const locStr = [location, province].filter(Boolean).join(', ');
    if (!locStr) return null;

    const searchQuery = `${locStr}, España`;

    try {
        // 2. Check Cache
        const cached = await db.query.geocode_cache.findFirst({
            where: (tbl, { eq }) => eq(tbl.location_string, searchQuery),
        });

        if (cached) {
            return { lat: cached.lat, lng: cached.lng };
        }

        // 3. Query Nominatim (with 1 req/sec rate limit enforcement and 1 retry)
        let response: Response | null = null;
        const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
            searchQuery
        )}&format=json&limit=1&countrycodes=es`;

        for (let attempt = 1; attempt <= 2; attempt++) {
            await sleep(1500); // 1.5s delay to be safe with Nominatim's 1 req/sec policy

            try {
                response = await fetch(url, {
                    headers: {
                        'User-Agent': 'KhronosMaps/1.0 (https://github.com/javiersanag/khronos-maps)',
                    },
                });

                if (response.ok) break;

                console.warn(`[Geocode] Nominatim API error on attempt ${attempt}: ${response.status}`);
            } catch (error) {
                console.warn(`[Geocode] Network error on attempt ${attempt}:`, error);
            }

            // Backoff before retry
            if (attempt === 1) await sleep(2000);
        }

        if (!response || !response.ok) {
            return null; // Both attempts failed
        }

        const data = await response.json();

        if (!data || !Array.isArray(data) || data.length === 0) {
            return null; // No results found
        }

        const bestMatch = data[0];
        const lat = parseFloat(bestMatch.lat);
        const lng = parseFloat(bestMatch.lon);
        const formatted_address = bestMatch.display_name;

        if (isNaN(lat) || isNaN(lng)) return null;

        // 4. Save to Cache
        await db.insert(geocode_cache).values({
            location_string: searchQuery,
            lat,
            lng,
            formatted_address,
        });

        return { lat, lng };
    } catch (err) {
        console.error(`[Geocode] Fatal error for "${searchQuery}":`, err);
        return null;
    }
}

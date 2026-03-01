/**
 * Database seed script.
 * Run via: npm run db:seed
 * The --env-file=.env.local flag in package.json loads env vars before tsx runs.
 * Idempotent: clears all tables before inserting fresh data.
 */

// ─── Constants ───────────────────────────────────────────────────────────────

const CITIES = [
    { name: 'Madrid', province: 'Madrid', lat: 40.4168, lng: -3.7038 },
    { name: 'Barcelona', province: 'Barcelona', lat: 41.3851, lng: 2.1734 },
    { name: 'Valencia', province: 'Valencia', lat: 39.4699, lng: -0.3774 },
    { name: 'Sevilla', province: 'Sevilla', lat: 37.3891, lng: -5.9845 },
    { name: 'Bilbao', province: 'Bizkaia', lat: 43.2630, lng: -2.9350 },
    { name: 'Malaga', province: 'Malaga', lat: 36.7213, lng: -4.4214 },
] as const;

const FORMATS = [
    { type: 'Road', distances: [5, 10, 21.097, 42.195], elevationMin: 0, elevationMax: 200 },
    { type: 'Trail', distances: [10, 21, 35], elevationMin: 400, elevationMax: 1500 },
    { type: 'Cross', distances: [5, 8, 12], elevationMin: 50, elevationMax: 300 },
    { type: 'Ultra', distances: [50, 80, 100, 160], elevationMin: 2000, elevationMax: 6000 },
] as const;

const ADJECTIVES = ['Popular', 'Internacional', 'Nocturna', 'Solidaria', 'Media', 'Gran', 'Clasica'] as const;
const NOUNS = ['Maraton', 'Carrera', 'Trail', 'Cross', 'Milla', 'San Silvestre', 'Desafio'] as const;

// ─── Helpers ─────────────────────────────────────────────────────────────────

function randomFrom<T>(arr: readonly T[]): T {
    return arr[Math.floor(Math.random() * arr.length)];
}

/** Returns a Date randomly spread over the next {@link monthsAhead} months. */
function randomFutureDate(monthsAhead: number): Date {
    const start = Date.now();
    const end = new Date();
    end.setMonth(end.getMonth() + monthsAhead);
    return new Date(start + Math.random() * (end.getTime() - start));
}

function generateSlug(name: string): string {
    return name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
    // Dynamic imports so env vars are guaranteed to be available
    const { db } = await import('./index');
    const { events, geocode_cache, scrape_log } = await import('./schema');

    console.log('🌱 Starting database seed...');

    try {
        console.log('🧹 Clearing existing data...');
        await db.delete(scrape_log);
        await db.delete(events);
        await db.delete(geocode_cache);

        // Build 25 mock events
        const mockEvents = Array.from({ length: 25 }, (_, idx) => {
            const i = idx + 1;
            const city = randomFrom(CITIES);
            const format = randomFrom(FORMATS);
            const distance = randomFrom(format.distances);
            const elevation = Math.floor(Math.random() * (format.elevationMax - format.elevationMin)) + format.elevationMin;
            const evName = `${randomFrom(NOUNS)} ${randomFrom(ADJECTIVES)} Ciudad de ${city.name} 2026`;

            return {
                runnea_id: 100000 + i,
                name: evName,
                slug: `${generateSlug(evName)}-${i}`,
                date: randomFutureDate(6),
                location: city.name,
                province: city.province,
                format: format.type,
                distance: distance as number,
                elevation,
                website: `https://example.com/race/${i}`,
                registration_link: `https://example.com/register/${i}`,
                price: Math.floor(Math.random() * 70) + 10, // EUR 10–80
                status: Math.random() > 0.8 ? 'Canceled' : 'Confirmed',
                coordinates: {
                    lat: city.lat + (Math.random() - 0.5) * 0.05,
                    lng: city.lng + (Math.random() - 0.5) * 0.05,
                },
            };
        });

        console.log(`🚀 Inserting ${mockEvents.length} events...`);
        await db.insert(events).values(mockEvents);

        // Pre-warm geocode cache for all seeded cities
        await db.insert(geocode_cache).values(
            CITIES.map(c => ({
                location_string: c.name,
                lat: c.lat,
                lng: c.lng,
                formatted_address: `${c.name}, ${c.province}, España`,
            }))
        );

        // Record this seed run in the scrape log
        await db.insert(scrape_log).values({
            items_discovered: mockEvents.length,
            items_added: mockEvents.length,
            items_updated: 0,
            completed_at: new Date(),
        });

        console.log('✅ Seed completed successfully!');
    } catch (error) {
        console.error('❌ Seeding failed:', error);
        process.exit(1);
    }
}

main();

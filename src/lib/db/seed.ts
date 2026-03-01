// Load environment variables *before* importing anything that relies on them
import { config } from 'dotenv';
config({ path: '.env.local' });

async function main() {
    // Dynamic import ensures this is evaluated after dotenv.config()
    const { db } = await import('./index');
    const { events, geocode_cache, scrape_log } = await import('./schema');

    console.log('🌱 Starting database seed...');

    try {
        // Idempotency: Clear existing tables
        console.log('🧹 Clearing existing data...');
        await db.delete(events);
        await db.delete(geocode_cache);
        await db.delete(scrape_log);

        const mockEvents = [];

        // Helper to generate dates between now and X months in the future
        function getRandomFutureDate(monthsAhead: number) {
            const start = new Date();
            const end = new Date();
            end.setMonth(start.getMonth() + monthsAhead);
            return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
        }

        function generateSlug(name: string) {
            return name
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/(^-|-$)+/g, '');
        }

        const CITIES = [
            { name: 'Madrid', province: 'Madrid', lat: 40.4168, lng: -3.7038 },
            { name: 'Barcelona', province: 'Barcelona', lat: 41.3851, lng: 2.1734 },
            { name: 'Valencia', province: 'Valencia', lat: 39.4699, lng: -0.3774 },
            { name: 'Sevilla', province: 'Sevilla', lat: 37.3891, lng: -5.9845 },
            { name: 'Bilbao', province: 'Bizkaia', lat: 43.2630, lng: -2.9350 },
            { name: 'Malaga', province: 'Malaga', lat: 36.7213, lng: -4.4214 }
        ];

        const FORMATS = [
            { type: 'Road', distances: [5, 10, 21.097, 42.195], elevationMin: 0, elevationMax: 200 },
            { type: 'Trail', distances: [10, 21, 35], elevationMin: 400, elevationMax: 1500 },
            { type: 'Cross', distances: [5, 8, 12], elevationMin: 50, elevationMax: 300 },
            { type: 'Ultra', distances: [50, 80, 100, 160], elevationMin: 2000, elevationMax: 6000 }
        ];

        const ADJECTIVES = ['Popular', 'Internacional', 'Nocturna', 'Solidaria', 'Media', 'Gran', 'Clasica'];
        const NOUNS = ['Maraton', 'Carrera', 'Trail', 'Cross', 'Milla', 'San Silvestre', 'Desafio'];

        // Generate 25 events
        for (let i = 1; i <= 25; i++) {
            const city = CITIES[Math.floor(Math.random() * CITIES.length)];
            const formatInfo = FORMATS[Math.floor(Math.random() * FORMATS.length)];
            const distance = formatInfo.distances[Math.floor(Math.random() * formatInfo.distances.length)];
            const elevation = Math.floor(Math.random() * (formatInfo.elevationMax - formatInfo.elevationMin)) + formatInfo.elevationMin;

            const noun = NOUNS[Math.floor(Math.random() * NOUNS.length)];
            const adjective = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
            const evName = `${noun} ${adjective} Ciudad de ${city.name} 2026`;

            const latFuzz = (Math.random() - 0.5) * 0.05;
            const lngFuzz = (Math.random() - 0.5) * 0.05;

            mockEvents.push({
                runnea_id: 100000 + i,
                name: evName,
                slug: `${generateSlug(evName)}-${i}`,
                date: getRandomFutureDate(6),
                location: city.name,
                province: city.province,
                format: formatInfo.type,
                distance: distance,
                elevation: elevation,
                website: `https://example.com/race/${i}`,
                registration_link: `https://example.com/register/${i}`,
                price: Math.floor(Math.random() * 70) + 10,
                status: Math.random() > 0.8 ? 'Canceled' : 'Confirmed',
                coordinates: {
                    lat: city.lat + latFuzz,
                    lng: city.lng + lngFuzz
                }
            });
        }

        console.log(`🚀 Inserting ${mockEvents.length} mock events...`);
        await db.insert(events).values(mockEvents);

        // Pre-fill some geocode cache just to demonstrate usage
        for (const city of CITIES) {
            await db.insert(geocode_cache).values({
                location_string: city.name,
                lat: city.lat,
                lng: city.lng,
                formatted_address: `${city.name}, ${city.province}, España`
            });
        }

        // Add an initial empty scrape log 
        await db.insert(scrape_log).values({
            items_discovered: 0,
            items_added: mockEvents.length,
            items_updated: 0,
            completed_at: new Date()
        });

        console.log('✅ Seed completed successfully!');
    } catch (error) {
        console.error('❌ Seeding failed:', error);
        process.exit(1);
    }
}

main();

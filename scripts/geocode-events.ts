import { db } from '../src/lib/db';
import { events } from '../src/lib/db/schema';
import { geocode } from '../src/lib/geocoding';
import { eq, isNull } from 'drizzle-orm';

async function main() {
    console.log('🌍 Starting batch geocoding...');

    // Fetch all events that lack coordinates
    const eventsToGeocode = await db.query.events.findMany({
        where: (tbl, { isNull }) => isNull(tbl.coordinates),
    });

    if (eventsToGeocode.length === 0) {
        console.log('✅ All events already have coordinates. Nothing to do.');
        process.exit(0);
    }

    console.log(`Found ${eventsToGeocode.length} events needing coordinates.`);

    let successful = 0;
    let skipped = 0;
    let cachedCount = 0;

    for (let i = 0; i < eventsToGeocode.length; i++) {
        const event = eventsToGeocode[i];
        const progress = `${i + 1}/${eventsToGeocode.length}`;

        try {
            // Check cache manually for logging purposes
            const locStr = [event.location, event.province].filter(Boolean).join(', ');
            const searchQuery = `${locStr}, España`;
            const cached = await db.query.geocode_cache.findFirst({
                where: (tbl, { eq }) => eq(tbl.location_string, searchQuery),
            });

            const coords = await geocode(event.location, event.province);

            if (coords) {
                await db.update(events)
                    .set({ coordinates: coords, updated_at: new Date() })
                    .where(eq(events.id, event.id));

                const label = cached ? '[cache hit]' : '[api fetch]';
                if (cached) cachedCount++;

                console.log(`[geocoder] ${progress} ${label} — ${event.name} → ${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)}`);
                successful++;
            } else {
                console.log(`[geocoder] ${progress} [no result] — ${event.name}`);
                skipped++;
            }
        } catch (e) {
            const msg = e instanceof Error ? e.message : String(e);
            console.error(`[geocoder] ${progress} [error] — ${event.name}: ${msg}`);
            skipped++;
        }
    }

    console.log(`\n✅ Done! Successful: ${successful} (${cachedCount} from cache). Skipped: ${skipped}.`);
    process.exit(0);
}

main().catch(console.error);

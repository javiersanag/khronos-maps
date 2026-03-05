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

    let processed = 0;
    let successful = 0;
    let skipped = 0;

    for (const event of eventsToGeocode) {
        processed++;

        try {
            const coords = await geocode(event.location, event.province);

            if (coords) {
                // Update the event with the new coordinates
                await db.update(events)
                    .set({ coordinates: coords, updated_at: new Date() })
                    .where(eq(events.id, event.id));

                console.log(`[geocoder] ${processed}/${eventsToGeocode.length} — ${event.name} → ${coords.lat.toFixed(4)}, ${coords.lng.toFixed(4)}`);
                successful++;
            } else {
                console.log(`[geocoder] ${processed}/${eventsToGeocode.length} — ${event.name} → Skipper (no results)`);
                skipped++;
            }
        } catch (e) {
            const msg = e instanceof Error ? e.message : String(e);
            console.error(`[geocoder] Error on ${event.name}: ${msg}`);
            skipped++;
        }
    }

    console.log(`\n✅ Done! Geocoded: ${successful}. Skipped: ${skipped}.`);
    process.exit(0);
}

main().catch(console.error);

import { RockTheSportScraper } from '../src/lib/scrapers/rockthesport';

async function main() {
    console.log('🏁 Starting RockTheSport scraper...');
    const scraper = new RockTheSportScraper();

    try {
        const result = await scraper.scrape();
        console.log(`✅ RockTheSport scrape completed: ${result.itemsAdded} added, ${result.itemsUpdated} updated, ${result.errors.length} errors.`);
    } catch (error) {
        console.error('❌ Scrape failed:', error);
        process.exit(1);
    }
}

main();

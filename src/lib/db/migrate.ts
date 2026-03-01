import { config } from 'dotenv';
config({ path: '.env.local' });

import { migrate } from 'drizzle-orm/libsql/migrator';

async function main() {
    console.log('🔄 Running migrations...');
    const { db } = await import('./index');

    try {
        await migrate(db, { migrationsFolder: './drizzle' });
        console.log('✅ Migrations complete!');
    } catch (error) {
        console.error('❌ Migration failed:', error);
        process.exit(1);
    }
}

main();

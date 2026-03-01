/**
 * Migration runner for local development.
 * Run via: npm run db:migrate
 * The --env-file=.env.local flag in package.json loads env vars before tsx runs.
 */
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

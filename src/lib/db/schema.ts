import { sqliteTable, text, integer, text as numeric, real } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

// Events table
export const events = sqliteTable('events', {
    id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
    runnea_id: integer('runnea_id').notNull().unique(),
    name: text('name').notNull(),
    slug: text('slug').notNull().unique(),
    date: integer('date', { mode: 'timestamp' }).notNull(),
    location: text('location').notNull(),
    province: text('province').notNull(),
    format: text('format').notNull(),
    distance: real('distance'),
    elevation: integer('elevation'),
    website: text('website'),
    registration_link: text('registration_link'),
    price: real('price'),
    status: text('status'),
    coordinates: text('coordinates', { mode: 'json' }).$type<{ lat: number; lng: number }>(),
    created_at: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
    updated_at: integer('updated_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
});

// Geocode cache table to avoid repeatedly querying external APIs for identical locations
export const geocode_cache = sqliteTable('geocode_cache', {
    location_string: text('location_string').primaryKey(),
    lat: real('lat').notNull(),
    lng: real('lng').notNull(),
    formatted_address: text('formatted_address'),
    created_at: integer('created_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
});

// Scrape log to track scraper runs and results
export const scrape_log = sqliteTable('scrape_log', {
    id: integer('id').primaryKey({ autoIncrement: true }),
    run_at: integer('run_at', { mode: 'timestamp' }).notNull().default(sql`(unixepoch())`),
    items_discovered: integer('items_discovered').notNull().default(0),
    items_added: integer('items_added').notNull().default(0),
    items_updated: integer('items_updated').notNull().default(0),
    errors: text('errors', { mode: 'json' }).$type<string[]>(),
    completed_at: integer('completed_at', { mode: 'timestamp' }),
});

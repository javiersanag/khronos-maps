CREATE TABLE `events` (
	`id` text PRIMARY KEY NOT NULL,
	`runnea_id` integer NOT NULL,
	`name` text NOT NULL,
	`slug` text NOT NULL,
	`date` integer NOT NULL,
	`location` text NOT NULL,
	`province` text NOT NULL,
	`format` text NOT NULL,
	`distance` real,
	`elevation` integer,
	`website` text,
	`registration_link` text,
	`price` real,
	`status` text,
	`coordinates` text,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL,
	`updated_at` integer DEFAULT (unixepoch()) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `events_runnea_id_unique` ON `events` (`runnea_id`);--> statement-breakpoint
CREATE UNIQUE INDEX `events_slug_unique` ON `events` (`slug`);--> statement-breakpoint
CREATE TABLE `geocode_cache` (
	`location_string` text PRIMARY KEY NOT NULL,
	`lat` real NOT NULL,
	`lng` real NOT NULL,
	`formatted_address` text,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL
);
--> statement-breakpoint
CREATE TABLE `scrape_log` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`run_at` integer DEFAULT (unixepoch()) NOT NULL,
	`items_discovered` integer DEFAULT 0 NOT NULL,
	`items_added` integer DEFAULT 0 NOT NULL,
	`items_updated` integer DEFAULT 0 NOT NULL,
	`errors` text,
	`completed_at` integer
);

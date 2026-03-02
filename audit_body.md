# Codebase Coherence Audit

Post-implementation audit comparing the current codebase against the Design Proposal, Implementation Plan, and Issues 01-05.

---

## 1. Code Quality Findings

### 1.1 `BaseScraper.normalize()` abstract method removed during refactor
- **File**: `src/lib/scrapers/base.ts`
- **Issue**: ISSUE-05 acceptance criteria explicitly require a `normalize()` method. The original implementation included `abstract normalize(raw: RawEvent): NormalizedEvent` but it was removed during the PR #37 review refactor. The `RawEvent` type in `src/types/event.ts` is now exported but unused anywhere.
- **Fix**: Restore the abstract method declaration so child scrapers are forced to implement normalization.

### 1.2 Overly complex return type on `save()`
- **File**: `src/lib/scrapers/base.ts` line 62
- **Issue**: The return type uses an unnecessary conditional type. `ScrapeResult['errors']` is already statically `string[]`, making this equivalent to `{ added: number; updated: number; errors: string[] }`.
- **Fix**: Simplify the return type to a plain interface.

### 1.3 `dotenv` is a devDependency but no longer used
- **File**: `package.json` line 31
- **Issue**: After switching to `tsx --env-file=.env.local`, the `dotenv` package is no longer imported anywhere.
- **Fix**: Remove `dotenv` from `devDependencies`.

---

## 2. Schema and DB Tooling Gaps

### 2.1 Missing `db:generate` npm script
- **File**: `package.json`
- **Issue**: The project has `db:migrate` and `db:seed` scripts but no `db:generate` convenience script for running `drizzle-kit generate`.
- **Fix**: Add `"db:generate": "drizzle-kit generate --config=drizzle.config.ts"` to scripts.

### 2.2 `scrape_log` schema missing `source` column
- **File**: `src/lib/db/schema.ts`
- **Issue**: `BaseScraper` tracks `sourceName` internally but never persists it. When multiple scrapers run, there is no way to tell which scraper produced which log entry.
- **Fix**: Add a `source text('source')` column to the `scrape_log` table (and update `logResult()` to store `this.sourceName`).

---

## 3. GitHub Issue Tracking

### 3.1 Duplicate issues: #30 and #32
- Both issues have the identical title: **ISSUE-32 - Draw-on-map to define custom search area**. Issue #30 appears to be an accidental duplicate of #32.
- **Fix**: Close #30 as a duplicate of #32.

---

## 4. Project Hygiene

### 4.1 `.env.example` may become stale
- **File**: `.env.example`
- **Issue**: The file was created during ISSUE-03 but new env vars may be needed as more services are added.
- **Fix**: Review and update `.env.example` as part of each issue that introduces new env vars.

### 4.2 Default Next.js assets still present
- **Files**: `public/file.svg`, `public/globe.svg`, `public/next.svg`, `public/vercel.svg`, `public/window.svg`
- **Issue**: The default Next.js scaffold assets are still in the `public/` directory. They are unused and add noise.
- **Fix**: Remove them when the design system (ISSUE-15) is implemented, or now if desired.

---

## Summary Table

| # | Area | Severity | Fix Effort |
|---|------|----------|------------|
| 1.1 | base.ts missing normalize | Medium | Small |
| 1.2 | save() return type | Low | Trivial |
| 1.3 | Unused dotenv dep | Low | Trivial |
| 2.1 | Missing db:generate script | Low | Trivial |
| 2.2 | scrape_log missing source | Medium | Small |
| 3.1 | Duplicate issue #30/#32 | Low | Trivial |
| 4.1 | .env.example staleness | Low | Ongoing |
| 4.2 | Default Next.js assets | Low | Trivial |

/**
 * Formats an ISO date string or Date object into a readable local string.
 * @param dateStr - The date to format.
 * @returns A formatted string like "12 Oct 2026" or "TBD" if invalid.
 * @example formatDate('2026-10-12') -> "12 Oct 2026"
 */
export function formatDate(dateStr: Date | string | null | undefined): string {
    if (!dateStr) return 'TBD';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return 'TBD';

    return new Intl.DateTimeFormat('en-GB', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
    }).format(d);
}

/**
 * Formats a distance number into a 'k' string rounded to one decimal place.
 * @param distance - The distance value in kilometers.
 * @returns A string like "21.1k" or "N/A" if null/zero.
 * @example formatDistance(42.195) -> "42.2k"
 */
export function formatDistance(distance: number | null | undefined): string {
    if (distance == null || distance === 0) return 'N/A';

    // Round to 1 decimal place max (proper half-up rounding)
    const rounded = Math.round((distance + Number.EPSILON) * 10) / 10;
    return `${rounded}k`;
}

/**
 * Maps database format strings to valid UI Terrain badge types.
 * @param format - The raw format string from the database.
 * @returns The mapped Terrain type ('road', 'trail', 'ultra', 'cross').
 */
export function getTerrainFromFormat(format: string | null | undefined): 'road' | 'trail' | 'ultra' | 'cross' {
    if (!format) return 'road';

    const f = format.toLowerCase();
    if (f.includes('trail')) return 'trail';
    if (f.includes('ultra')) return 'ultra';
    if (f.includes('cross') || f.includes('xc')) return 'cross';

    return 'road';
}

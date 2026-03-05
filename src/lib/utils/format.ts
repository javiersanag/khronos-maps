/**
 * Format an ISO date string or Date object into a readable string.
 * Example: "12 Oct 2026"
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
 * Format distance to append 'k' and round to 1 decimal place.
 * Example: 21.097 -> "21.1k", 10 -> "10k"
 */
export function formatDistance(distance: number | null | undefined): string {
    if (distance == null || distance === 0) return 'N/A';

    // Round to 1 decimal place max
    const rounded = Math.round(distance * 10) / 10;
    return `${rounded}k`;
}

/**
 * Map the database `format` string (e.g. "Asfalto", "Trail")
 * to the exact UI `Terrain` type required by the Badge component.
 */
export function getTerrainFromFormat(format: string | null | undefined): 'road' | 'trail' | 'ultra' | 'cross' {
    if (!format) return 'road'; // default

    const f = format.toLowerCase();
    if (f.includes('trail')) return 'trail';
    if (f.includes('ultra')) return 'ultra';
    if (f.includes('cross') || f.includes('xc')) return 'cross';

    // Everything else falls back to road (Asfalto, Ruta, etc)
    return 'road';
}

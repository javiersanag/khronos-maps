import { ReactNode } from 'react';

type Terrain = 'road' | 'trail' | 'ultra' | 'cross';

interface BadgeProps {
    terrain: Terrain;
    children?: ReactNode;
    className?: string;
}

const terrainConfig: Record<Terrain, { label: string; classes: string }> = {
    road: { label: 'Road', classes: 'bg-road/15  text-road  border-road/30' },
    trail: { label: 'Trail', classes: 'bg-trail/15 text-trail border-trail/30' },
    ultra: { label: 'Ultra', classes: 'bg-ultra/15 text-ultra border-ultra/30' },
    cross: { label: 'Cross', classes: 'bg-cross/15 text-cross border-cross/30' },
};

/**
 * Color-coded terrain badge.
 * Falls back to terrain label when no children are provided.
 */
export function Badge({ terrain, children, className = '' }: BadgeProps) {
    const { label, classes } = terrainConfig[terrain];
    return (
        <span
            className={`inline-flex items-center border px-2 py-0.5 text-xs font-medium uppercase tracking-wide rounded-full ${classes} ${className}`}
        >
            {children ?? label}
        </span>
    );
}

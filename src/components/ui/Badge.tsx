import { ReactNode } from 'react';

type Terrain = 'road' | 'trail' | 'ultra' | 'cross';

interface BadgeProps {
    terrain: Terrain;
    children?: ReactNode;
    className?: string;
}

const terrainConfig: Record<Terrain, { label: string; classes: string }> = {
    road: { label: 'Road', classes: 'bg-road/20 text-road border-transparent' },
    trail: { label: 'Trail', classes: 'bg-trail/20 text-trail border-transparent' },
    ultra: { label: 'Ultra', classes: 'bg-ultra/20 text-ultra border-transparent' },
    cross: { label: 'Cross', classes: 'bg-cross/20 text-cross border-transparent' },
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

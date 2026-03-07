'use client';

import { motion, HTMLMotionProps } from 'framer-motion';
import { ReactNode } from 'react';

interface CardProps {
    children: ReactNode;
    className?: string;
    /** When set, applies interactive hover glow; use for clickable cards. */
    onClick?: () => void;
    /** Highlights the card with a road-blue ring (e.g. when map marker is selected). */
    active?: boolean;
}

/**
 * Glassmorphism surface card.
 * Interactive variant (onClick) gets a Framer Motion hover glow.
 */
export function Card({ children, className = '', onClick, active }: CardProps) {
    const interactive = Boolean(onClick);

    return (
        <motion.div
            onClick={onClick}
            tabIndex={interactive ? 0 : undefined}
            whileHover={
                interactive
                    ? { scale: 1.02, y: -2, boxShadow: '0 8px 30px rgba(59,130,246,0.18)' }
                    : undefined
            }
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className={[
                'rounded-xl border bg-[var(--color-surface-glass)] backdrop-blur-md p-4 transition-colors',
                active
                    ? 'border-road shadow-md shadow-road/20'
                    : 'border-[var(--color-border)]',
                interactive ? 'cursor-pointer focus-visible:ring-2 focus-visible:ring-road focus-visible:outline-none' : '',
                className,
            ].join(' ')}
        >
            {children}
        </motion.div>
    );
}

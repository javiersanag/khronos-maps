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
            whileHover={
                interactive
                    ? { scale: 1.01, boxShadow: '0 0 24px rgba(59,130,246,0.18)' }
                    : undefined
            }
            transition={{ duration: 0.18 }}
            className={[
                'rounded-xl border bg-[var(--color-surface-glass)] backdrop-blur-md p-4',
                active
                    ? 'border-road shadow-md shadow-road/20'
                    : 'border-[var(--color-border)]',
                interactive ? 'cursor-pointer' : '',
                className,
            ].join(' ')}
        >
            {children}
        </motion.div>
    );
}

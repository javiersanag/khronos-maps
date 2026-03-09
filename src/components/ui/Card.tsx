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
 * Premium dark surface card.
 * Interactive variant (onClick) gets a Framer Motion hover elevation.
 */
export function Card({ children, className = '', onClick, active }: CardProps) {
    const interactive = Boolean(onClick);

    return (
        <motion.div
            onClick={onClick}
            tabIndex={interactive ? 0 : undefined}
            whileHover={
                interactive
                    ? { scale: 1.01, y: -2, boxShadow: '0 8px 30px rgba(245, 158, 11, 0.1)' }
                    : undefined
            }
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className={[
                'rounded-[12px] border bg-[var(--color-surface-elevated)] p-4 transition-all duration-200',
                active
                    ? 'border-[var(--color-brand-accent)] shadow-md shadow-[var(--color-brand-accent)]/20'
                    : 'border-[var(--color-border)] hover:border-[var(--color-border)]',
                interactive ? 'cursor-pointer focus-visible:ring-2 focus-visible:ring-[var(--color-brand-accent)] focus-visible:outline-none hover:bg-[#2c2c30]' : '',
                className,
            ].join(' ')}
        >
            {children}
        </motion.div>
    );
}

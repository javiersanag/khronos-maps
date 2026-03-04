'use client';

import { motion } from 'framer-motion';
import { ButtonHTMLAttributes, forwardRef } from 'react';

type Variant = 'primary' | 'secondary' | 'ghost';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: Variant;
    size?: Size;
}

const variantClasses: Record<Variant, string> = {
    primary:
        'bg-road text-white shadow-md shadow-road/20 hover:bg-road/90',
    secondary:
        'border border-[var(--color-border)] bg-surface text-foreground hover:bg-surface-elevated',
    ghost:
        'text-foreground/70 hover:text-foreground hover:bg-foreground/10',
};

const sizeClasses: Record<Size, string> = {
    sm: 'px-3 py-1.5 text-xs rounded-md',
    md: 'px-4 py-2 text-sm rounded-lg',
    lg: 'px-6 py-3 text-base rounded-xl',
};

/**
 * Base button with primary / secondary / ghost variants.
 * Includes Framer Motion tap feedback and disabled state.
 */
const Button = forwardRef<HTMLButtonElement, ButtonProps>(
    ({ variant = 'primary', size = 'md', className = '', disabled, children, ...props }, ref) => {
        return (
            <motion.button
                ref={ref}
                whileTap={disabled ? undefined : { scale: 0.97 }}
                disabled={disabled}
                className={[
                    'inline-flex items-center justify-center font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-road/50',
                    variantClasses[variant],
                    sizeClasses[size],
                    disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer',
                    className,
                ].join(' ')}
                {...(props as any)}
            >
                {children}
            </motion.button>
        );
    }
);

Button.displayName = 'Button';
export { Button };

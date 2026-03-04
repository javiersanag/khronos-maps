import { InputHTMLAttributes, forwardRef } from 'react';

/**
 * Styled text input that forwards all native input attributes.
 * Dark-themed with a focus ring using the road-blue token.
 */
const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
    ({ className = '', ...props }, ref) => (
        <input
            ref={ref}
            className={[
                'w-full rounded-lg border border-[var(--color-border)] bg-surface px-3 py-2',
                'text-sm text-foreground placeholder:text-foreground/40',
                'transition-colors focus:border-road focus:outline-none focus:ring-1 focus:ring-road/50',
                'disabled:opacity-50 disabled:cursor-not-allowed',
                className,
            ].join(' ')}
            {...props}
        />
    )
);

Input.displayName = 'Input';
export { Input };

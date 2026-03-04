import { SelectHTMLAttributes, forwardRef } from 'react';

/**
 * Styled select that forwards all native select attributes.
 * Dark-themed with a focus ring using the road-blue token.
 */
const Select = forwardRef<HTMLSelectElement, SelectHTMLAttributes<HTMLSelectElement>>(
    ({ className = '', children, ...props }, ref) => (
        <select
            ref={ref}
            className={[
                'w-full rounded-lg border border-[var(--color-border)] bg-surface px-3 py-2',
                'text-sm text-foreground',
                'transition-colors focus:border-road focus:outline-none focus:ring-1 focus:ring-road/50',
                'disabled:opacity-50 disabled:cursor-not-allowed',
                'appearance-none cursor-pointer',
                className,
            ].join(' ')}
            {...props}
        >
            {children}
        </select>
    )
);

Select.displayName = 'Select';
export { Select };

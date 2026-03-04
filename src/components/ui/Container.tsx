import { ReactNode } from 'react';

interface ContainerProps {
    children: ReactNode;
    className?: string;
}

/**
 * Max-width responsive wrapper used for all page-level content.
 * Aligns with the existing Header layout.
 */
export function Container({ children, className = '' }: ContainerProps) {
    return (
        <div className={`mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 ${className}`}>
            {children}
        </div>
    );
}

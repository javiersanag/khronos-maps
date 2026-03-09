import { getTranslations } from 'next-intl/server';
import LocaleSwitcher from '@/components/ui/LocaleSwitcher';

/**
 * Sticky top navigation bar. Uses getTranslations (server-side) to avoid
 * requiring 'use client' at the header level, keeping it as an RSC.
 */
export default async function Header() {
    const t = await getTranslations('Navigation');

    return (
        <header className="sticky top-0 z-50 w-full border-b border-white/5 bg-surface/80 backdrop-blur-md">
            <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
                <div className="flex items-center gap-8">
                    <a href="/" className="text-xl font-bold tracking-tight">
                        🏃 <span className="hidden sm:inline">Khronos Maps</span>
                    </a>
                    <nav className="hidden md:flex gap-6 text-sm font-medium text-foreground/60">
                        <a href="/" className="hover:text-foreground transition-colors">{t('map')}</a>
                        <a href="/about" className="hover:text-foreground transition-colors">{t('about')}</a>
                    </nav>
                </div>
                <LocaleSwitcher />
            </div>
        </header>
    );
}

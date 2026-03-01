import { useTranslations } from 'next-intl';
import LocaleSwitcher from '@/components/ui/LocaleSwitcher';

export default function Header() {
    const t = useTranslations('Navigation');

    return (
        <header className="sticky top-0 z-50 w-full border-b border-foreground/10 bg-background/80 backdrop-blur-md">
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

'use client';

import { useLocale, useTranslations } from 'next-intl';
import { routing, useRouter, usePathname } from '@/i18n/routing';
import { useTransition } from 'react';

export default function LocaleSwitcher() {
    const t = useTranslations('Common');
    const locale = useLocale();
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const pathname = usePathname();

    function onSelectChange(nextLocale: string) {
        startTransition(() => {
            // @ts-ignore
            router.replace(pathname, { locale: nextLocale });
        });
    }

    return (
        <div className="flex gap-2 text-sm">
            {routing.locales.map((cur) => (
                <button
                    key={cur}
                    disabled={isPending}
                    className={`cursor-pointer px-2 py-1 rounded transition-colors ${locale === cur
                            ? 'bg-foreground text-background'
                            : 'hover:bg-foreground/10'
                        }`}
                    onClick={() => onSelectChange(cur)}
                >
                    {cur.toUpperCase()}
                </button>
            ))}
        </div>
    );
}

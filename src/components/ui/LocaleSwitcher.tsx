'use client';

import { useLocale, useTranslations } from 'next-intl';
import { routing, useRouter, usePathname } from '@/i18n/routing';
import { useTransition } from 'react';
import { motion } from 'framer-motion';

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
        <div className="flex p-1 bg-background/50 rounded-full border border-white/5 relative">
            {routing.locales.map((cur) => {
                const isActive = locale === cur;
                return (
                    <button
                        key={cur}
                        disabled={isPending}
                        className={`relative z-10 px-3 py-1 rounded-full text-xs font-bold transition-colors ${isActive
                                ? 'text-white'
                                : 'text-slate-400 hover:text-white'
                            }`}
                        onClick={() => onSelectChange(cur)}
                    >
                        {isActive && (
                            <motion.div
                                layoutId="locale-active-pill"
                                className="absolute inset-0 bg-[#3f3f46] rounded-full -z-10"
                                transition={{ type: "spring", stiffness: 400, damping: 30 }}
                            />
                        )}
                        {cur.toUpperCase()}
                    </button>
                );
            })}
        </div>
    );
}

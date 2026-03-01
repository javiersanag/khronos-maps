import { getTranslations, setRequestLocale } from 'next-intl/server';

export default async function Home({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;

    // Enable static rendering
    setRequestLocale(locale);

    const t = await getTranslations('HomePage');

    return (
        <div className="flex min-h-screen items-center justify-center">
            <main className="flex flex-col items-center gap-4 text-center">
                <h1 className="text-5xl font-bold tracking-tight">
                    🏃 {t('title').split(' — ')[0]}
                </h1>
                <p className="text-lg text-foreground/60">
                    {t('subtitle')}
                </p>
            </main>
        </div>
    );
}

import { setRequestLocale } from 'next-intl/server';
import { DesignShowcase } from '@/components/ui/DesignShowcase';
import { Container } from '@/components/ui/Container';

export default async function DesignPage({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    setRequestLocale(locale);

    return (
        <main className="min-h-screen py-12 flex flex-col gap-16">
            <Container>
                <div>
                    <h1 className="text-3xl font-bold text-white mb-2">Design System</h1>
                    <p className="text-slate-400 mb-8">Component library and primitives showcase.</p>
                </div>
            </Container>
            <DesignShowcase />
        </main>
    );
}

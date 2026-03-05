import { setRequestLocale } from 'next-intl/server';
import { DesignShowcase } from '@/components/ui/DesignShowcase';
import { Container } from '@/components/ui/Container';
import { EventCard } from '@/components/events/EventCard';
import { NormalizedEvent } from '@/types/event';

export default async function Home({ params }: { params: Promise<{ locale: string }> }) {
    const { locale } = await params;
    setRequestLocale(locale);

    const dummyEvents: NormalizedEvent[] = [
        {
            id: '1',
            runnea_id: 101,
            name: 'Maratón de Madrid',
            slug: 'maraton-madrid',
            date: new Date('2026-04-26'),
            location: 'Madrid',
            province: 'Madrid',
            format: 'Asfalto',
            distance: 42.195,
            elevation: 250,
            price: 60,
            website: null,
            registration_link: null,
            status: 'inscripciones-abiertas',
            coordinates: { lat: 40.4168, lng: -3.7038 },
            created_at: new Date(),
            updated_at: new Date(),
        },
        {
            id: '2',
            runnea_id: 102,
            name: 'Penyagolosa Trails',
            slug: 'penyagolosa',
            date: new Date('2026-05-15'),
            location: 'Castellón',
            province: 'Castellón',
            format: 'Trail',
            distance: 60,
            elevation: 3300,
            price: null,
            website: null,
            registration_link: null,
            status: null,
            coordinates: { lat: 40.2312, lng: -0.1923 },
            created_at: new Date(),
            updated_at: new Date(),
        }
    ];

    return (
        <main className="min-h-screen py-12 flex flex-col gap-16">
            <Container className="max-w-2xl flex flex-col gap-6">
                <div>
                    <h2 className="text-2xl font-bold text-white mb-2">Event Cards</h2>
                    <p className="text-slate-400 mb-6">Interactive component for map markers.</p>
                </div>
                {dummyEvents.map(e => <EventCard key={e.id} event={e} active={e.id === '2'} />)}
            </Container>

            <DesignShowcase />
        </main>
    );
}



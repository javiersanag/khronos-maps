import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import Link from 'next/link';
import { eq } from 'drizzle-orm';
import { db } from '@/lib/db';
import { events } from '@/lib/db/schema';
import { formatDate, formatDistance, getTerrainFromFormat } from '@/lib/utils/format';
import { ShareButtons } from '@/components/events/ShareButtons';
import { MiniMap } from '@/components/map/MiniMap';
import { NearbyEvents } from '@/components/events/NearbyEvents';
import { MapPin, Calendar, Ruler, Mountain, Euro, ExternalLink, ArrowLeft } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { getTranslations } from 'next-intl/server';

interface EventPageProps {
    params: Promise<{
        locale: string;
        slug: string;
    }>;
}

export async function generateMetadata({ params }: EventPageProps): Promise<Metadata> {
    const { slug } = await params;
    const event = await db.query.events.findFirst({
        where: eq(events.slug, slug),
    });

    if (!event) return {};

    return {
        title: `${event.name} | Khronos Maps`,
        description: `Participa en ${event.name} en ${event.location}, ${event.province}. Encuentra todos los detalles.`,
        openGraph: {
            title: event.name,
            description: `Descubre los detalles de ${event.name} en ${event.location}.`,
        },
    };
}

export default async function EventPage({ params }: EventPageProps) {
    const { slug, locale } = await params;
    const t = await getTranslations({ locale, namespace: 'EventDetail' });

    const event = await db.query.events.findFirst({
        where: eq(events.slug, slug),
    });

    if (!event) {
        notFound();
    }

    const terrain = getTerrainFromFormat(event.format);
    const coordinates = event.coordinates as { lat: number; lng: number } | null;
    const hasCoordinates = coordinates?.lat && coordinates?.lng;

    // For local env testing since we don't have absolute URL config yet
    const shareUrl = `https://khronos-maps.vercel.app/${locale}/event/${event.slug}`;

    return (
        <div className="min-h-screen bg-background flex flex-col">
            {/* Header / Nav */}
            <header className="absolute top-0 left-0 right-0 p-4 z-10">
                <Link href={`/${locale}`} className="inline-flex items-center gap-2 text-slate-300 hover:text-white transition-colors bg-black/40 backdrop-blur-md px-3 py-2 rounded-full text-sm font-medium">
                    <ArrowLeft size={16} />
                    {t('backToMap')}
                </Link>
            </header>

            {/* Hero Section (Gradient Fallback) */}
            <section className="relative pt-32 pb-16 px-6 md:px-12 flex flex-col justify-end min-h-[40vh] border-b border-white/5">
                {/* Fallback gradient */}
                <div className="absolute inset-0 bg-gradient-to-br from-road/30 via-background to-background z-0" />
                <div className="absolute inset-0 bg-background/60 backdrop-blur-[2px] z-0" />

                <div className="relative z-10 max-w-4xl mx-auto w-full">
                    <Badge terrain={terrain} className="mb-4">{event.format}</Badge>
                    <h1 className="text-3xl md:text-5xl font-bold text-white mb-4 leading-tight">
                        {event.name}
                    </h1>
                    <div className="flex flex-wrap items-center gap-4 text-slate-300 font-medium">
                        <span className="flex items-center gap-1.5 flex-wrap">
                            <MapPin size={18} className="text-slate-400" />
                            {event.location}, {event.province}
                        </span>
                        <span className="flex items-center gap-1.5 flex-wrap">
                            <Calendar size={18} className="text-slate-400" />
                            {formatDate(event.date, locale)}
                        </span>
                    </div>
                </div>
            </section>

            {/* Main Content */}
            <main className="flex-1 px-6 md:px-12 py-12">
                <div className="max-w-4xl mx-auto w-full grid grid-cols-1 lg:grid-cols-3 gap-12">

                    {/* Left Column: Details */}
                    <div className="lg:col-span-2 space-y-12">
                        {/* Key Facts Grid */}
                        <section>
                            <h2 className="text-xl font-bold text-white mb-6">{t('detailsTitle')}</h2>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                <div className="p-4 rounded-xl bg-surface-elevated border border-white/5 flex flex-col gap-1">
                                    <span className="text-slate-400 text-xs font-medium uppercase tracking-wider">{t('distance')}</span>
                                    <span className="text-white font-semibold flex items-center gap-2">
                                        <Ruler size={16} className="text-road" />
                                        {event.distance ? formatDistance(event.distance) : t('notAvailable')}
                                    </span>
                                </div>
                                <div className="p-4 rounded-xl bg-surface-elevated border border-white/5 flex flex-col gap-1">
                                    <span className="text-slate-400 text-xs font-medium uppercase tracking-wider">{t('elevation')}</span>
                                    <span className="text-white font-semibold flex items-center gap-2">
                                        <Mountain size={16} className="text-trail" />
                                        {event.elevation ? `+${event.elevation}m` : t('notAvailable')}
                                    </span>
                                </div>
                                <div className="p-4 rounded-xl bg-surface-elevated border border-white/5 flex flex-col gap-1">
                                    <span className="text-slate-400 text-xs font-medium uppercase tracking-wider">{t('terrain')}</span>
                                    <span className="text-white font-semibold">
                                        {event.format}
                                    </span>
                                </div>
                                <div className="p-4 rounded-xl bg-surface-elevated border border-white/5 flex flex-col gap-1">
                                    <span className="text-slate-400 text-xs font-medium uppercase tracking-wider">{t('price')}</span>
                                    <span className="text-white font-semibold flex items-center gap-2">
                                        <Euro size={16} className="text-green-500" />
                                        {event.price ? `${event.price}€` : t('notAvailable')}
                                    </span>
                                </div>
                            </div>
                        </section>

                        {/* Location / MiniMap */}
                        <section>
                            <h2 className="text-xl font-bold text-white mb-6">{t('locationTitle')}</h2>
                            {hasCoordinates ? (
                                <div className="h-[300px] w-full rounded-xl overflow-hidden border border-white/5 relative z-0">
                                    <MiniMap lat={coordinates.lat} lng={coordinates.lng} />
                                </div>
                            ) : (
                                <div className="p-8 rounded-xl bg-surface-elevated border border-white/5 text-center text-slate-400">
                                    {t('noCoordinates')}
                                </div>
                            )}
                        </section>
                    </div>

                    {/* Right Column: Actions & Nearby */}
                    <div className="space-y-8">
                        {/* Call to Action */}
                        <div className="p-6 rounded-xl bg-surface-elevated border border-white/5 flex flex-col gap-6">
                            <a
                                href={event.registration_link || event.website || '#'}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center justify-center font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-road/50 bg-road text-white shadow-md shadow-road/20 hover:bg-road/90 px-6 py-5 text-base rounded-xl w-full"
                            >
                                {t('register')} <ExternalLink size={18} className="ml-2" />
                            </a>

                            <div>
                                <h3 className="text-sm font-medium text-slate-400 mb-3">{t('shareTitle')}</h3>
                                <ShareButtons url={shareUrl} title={event.name} />
                            </div>
                        </div>

                        {/* Nearby Events */}
                        <div>
                            <h3 className="text-lg font-bold text-white mb-4">{t('nearbyTitle')}</h3>
                            <NearbyEvents currentEventId={event.id} province={event.province} date={event.date instanceof Date ? event.date : new Date(event.date!)} />
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}

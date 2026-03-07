'use client';

import { useState, useEffect, useRef } from 'react';
import { useDebounce } from 'use-debounce';
import type { LatLngBounds } from 'leaflet';
import { motion, AnimatePresence } from 'framer-motion';
import { NormalizedEvent } from '@/types/event';
import { MapEvent, EventMap } from '@/components/map';
import { EventCard } from '@/components/events/EventCard';
import { EventCardSkeleton } from '@/components/events/EventCardSkeleton';
import { MobileEventDrawer } from '@/components/layout/MobileEventDrawer';
import { getTerrainFromFormat } from '@/lib/utils/format';

export function SplitViewClient() {
    const [bounds, setBounds] = useState<LatLngBounds | null>(null);
    const [debouncedBounds] = useDebounce(bounds, 500);
    const [events, setEvents] = useState<NormalizedEvent[]>([]);
    const [totalEvents, setTotalEvents] = useState(0);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const hasInitialFetch = useRef(false);
    const cardRefs = useRef<Map<string, HTMLDivElement>>(new Map());

    const fetchEvents = async () => {
        setIsLoading(true);
        setError(null);
        try {
            let url = '/api/events?limit=100';

            if (debouncedBounds) {
                const sw = debouncedBounds.getSouthWest();
                const ne = debouncedBounds.getNorthEast();
                url += `&bounds=${sw.lat},${sw.lng},${ne.lat},${ne.lng}`;
            }

            const res = await fetch(url);
            if (!res.ok) throw new Error('Failed to fetch events');

            const json = await res.json();
            setEvents(json.data || []);
            setTotalEvents(json.total || 0);
        } catch (err) {
            console.error('API Error:', err);
            setError('Error cargando los eventos de la zona. Por favor, revisa tu conexión e inténtalo de nuevo.');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        if (debouncedBounds || !hasInitialFetch.current) {
            fetchEvents();
            hasInitialFetch.current = true;
        }
    }, [debouncedBounds]);

    // Auto-scroll selected card into view
    useEffect(() => {
        if (selectedId) {
            const card = cardRefs.current.get(selectedId);
            if (card) {
                card.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }
        }
    }, [selectedId]);

    const mapEvents: MapEvent[] = events
        .filter((e) => e.coordinates && e.coordinates.lat && e.coordinates.lng)
        .map((e) => ({
            id: String(e.id),
            lat: e.coordinates!.lat,
            lng: e.coordinates!.lng,
            terrain: getTerrainFromFormat(e.format),
            title: e.name,
        }));

    return (
        <div className="flex flex-col md:flex-row h-screen w-full overflow-hidden bg-background">

            {/* Desktop Sidebar */}
            <aside
                aria-label="Event List"
                className="hidden md:flex w-[450px] lg:w-[500px] h-full overflow-y-auto border-r border-[#1e293b] flex-col bg-surface z-10 shadow-xl scrollbar-thin"
            >
                <div className="p-4 border-b border-[#1e293b] sticky top-0 bg-surface/90 backdrop-blur-md z-20 flex-shrink-0">
                    <h1 className="text-xl font-bold tracking-tight text-white mb-1">Khronos Maps</h1>
                    <div role="status" aria-live="polite" className="text-sm text-slate-400">
                        {isLoading ? (
                            'Rastreando terreno...'
                        ) : error ? (
                            <span className="text-red-400">Error de conexión</span>
                        ) : (
                            <>{events.length} eventos en vista
                                {totalEvents > 100 && (
                                    <span className="block text-xs text-slate-500 mt-0.5">Mostrando los primeros 100. Acerca el mapa para ver más.</span>
                                )}
                            </>
                        )}
                    </div>
                </div>

                <div className="p-4 flex flex-col gap-4 relative min-h-full">
                    {/* Error State */}
                    {error && !isLoading && (
                        <div className="text-center py-12 flex flex-col items-center gap-3">
                            <span className="text-3xl" aria-hidden="true">⚠️</span>
                            <p className="text-slate-400 text-sm max-w-[250px]">{error}</p>
                            <button
                                onClick={fetchEvents}
                                className="px-4 py-2 mt-2 bg-road hover:bg-blue-400 text-white rounded-lg text-sm font-medium transition-colors"
                            >
                                Reintentar
                            </button>
                        </div>
                    )}

                    {/* Empty State */}
                    {events.length === 0 && !isLoading && !error && (
                        <div className="text-center py-12 text-slate-400 text-sm">
                            No se encontraron eventos en esta zona.<br />Prueba a alejar el mapa o moverte.
                        </div>
                    )}

                    {/* Skeletons Overlay */}
                    {isLoading && events.length === 0 && (
                        <div className="absolute inset-x-4 top-4 flex flex-col gap-4">
                            {Array.from({ length: 5 }).map((_, i) => (
                                <EventCardSkeleton key={`skeleton-${i}`} />
                            ))}
                        </div>
                    )}

                    {/* Event List with Staggered Framer Motion Entrance */}
                    <AnimatePresence mode="popLayout">
                        {events.map((event, i) => {
                            const stringId = String(event.id);
                            return (
                                <motion.div
                                    key={stringId}
                                    layout
                                    initial={{ opacity: 0, y: 16 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -16, transition: { duration: 0.1 } }}
                                    transition={{ duration: 0.3, delay: Math.min(i * 0.04, 0.4) }}
                                    ref={(el) => {
                                        if (el) cardRefs.current.set(stringId, el);
                                        else cardRefs.current.delete(stringId);
                                    }}
                                >
                                    <EventCard
                                        event={event}
                                        active={selectedId === stringId}
                                        onClick={() => setSelectedId(stringId)}
                                    />
                                </motion.div>
                            );
                        })}
                    </AnimatePresence>
                </div>
            </aside>

            {/* Mobile Bottom Drawer */}
            <MobileEventDrawer
                events={events}
                totalEvents={totalEvents}
                isLoading={isLoading}
                error={error}
                selectedId={selectedId}
                onSelectId={(id) => setSelectedId(id)}
                onRetry={fetchEvents}
            />

            {/* Map Area */}
            <main aria-label="Events Map" className="flex-1 relative h-full w-full z-0 bg-[#0a0a0f]">
                <div className="absolute inset-0">
                    <EventMap
                        events={mapEvents}
                        selectedId={selectedId}
                        flyToId={selectedId}
                        onMarkerClick={(id) => setSelectedId(id)}
                        onBoundsChange={(newBounds) => setBounds(newBounds)}
                    />
                </div>
            </main>
        </div>
    );
}

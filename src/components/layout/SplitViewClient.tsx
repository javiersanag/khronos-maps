'use client';

import { useState, useEffect, useRef } from 'react';
import { useDebounce } from 'use-debounce';
import type { LatLngBounds } from 'leaflet';
import { NormalizedEvent } from '@/types/event';
import { MapEvent, EventMap } from '@/components/map';
import { EventCard } from '@/components/events/EventCard';
import { getTerrainFromFormat } from '@/lib/utils/format';
import { Container } from '@/components/ui/Container';

export function SplitViewClient() {
    const [bounds, setBounds] = useState<LatLngBounds | null>(null);
    const [debouncedBounds] = useDebounce(bounds, 500); // 500ms delay to avoid API spam on map drag
    const [events, setEvents] = useState<NormalizedEvent[]>([]);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    // Initial fetch to populate map with initial cluster across Spain
    // (Happens before any bounds are set by the map resolving)
    const hasInitialFetch = useRef(false);

    useEffect(() => {
        async function fetchEvents() {
            setIsLoading(true);
            try {
                let url = '/api/events?limit=100'; // Higher limit for map view

                if (debouncedBounds) {
                    const sw = debouncedBounds.getSouthWest();
                    const ne = debouncedBounds.getNorthEast();
                    url += `&bounds=${sw.lat},${sw.lng},${ne.lat},${ne.lng}`;
                }

                const res = await fetch(url);
                if (!res.ok) throw new Error('Failed to fetch events');

                const json = await res.json();
                setEvents(json.data || []);
            } catch (err) {
                console.error('API Error:', err);
            } finally {
                setIsLoading(false);
            }
        }

        // Fetch on debounced bounds OR if it's the very first render
        if (debouncedBounds || !hasInitialFetch.current) {
            fetchEvents();
            hasInitialFetch.current = true;
        }
    }, [debouncedBounds]);

    // Derived: Map strictly expects the MapEvent format
    const mapEvents: MapEvent[] = events
        .filter((e) => e.coordinates && e.coordinates.lat && e.coordinates.lng)
        .map((e) => ({
            id: e.id,
            lat: e.coordinates!.lat,
            lng: e.coordinates!.lng,
            terrain: getTerrainFromFormat(e.format),
            title: e.name,
        }));

    return (
        <div className="flex flex-col md:flex-row h-screen w-full overflow-hidden bg-slate-950">
            {/* LEFT SIDEBAR: Event List */}
            <aside className="w-full md:w-[450px] lg:w-[500px] h-[40vh] md:h-full overflow-y-auto border-r border-[#1e293b] flex flex-col bg-slate-950 z-10 shadow-xl scrollbar-thin">
                <div className="p-4 border-b border-[#1e293b] sticky top-0 bg-slate-950/90 backdrop-blur-md z-20">
                    <h1 className="text-xl font-bold tracking-tight text-white">Khronos Maps</h1>
                    <p className="text-sm text-slate-400 mt-1">
                        {isLoading ? 'Rastreando terreno...' : `${events.length} eventos en vista`}
                    </p>
                </div>

                <div className="p-4 flex flex-col gap-4">
                    {events.length === 0 && !isLoading && (
                        <div className="text-center py-12 text-slate-500 text-sm">
                            No se encontraron eventos en esta zona.<br />Prueba a alejar el mapa o moverte.
                        </div>
                    )}

                    {events.map((event) => (
                        <EventCard
                            key={event.id}
                            event={event}
                            active={selectedId === event.id}
                            onClick={() => setSelectedId(event.id)}
                        />
                    ))}
                </div>
            </aside>

            {/* RIGHT PANE: Map Area */}
            <main className="flex-1 relative h-[60vh] md:h-full z-0 bg-[#0a0a0f]">
                <div className="absolute inset-0">
                    <EventMap
                        events={mapEvents}
                        selectedId={selectedId}
                        onMarkerClick={(id) => setSelectedId(id)}
                        onBoundsChange={(newBounds) => setBounds(newBounds)}
                    />
                </div>
            </main>
        </div>
    );
}

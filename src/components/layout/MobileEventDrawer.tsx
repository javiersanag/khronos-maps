'use client';

import { Drawer } from 'vaul';
import { useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { NormalizedEvent } from '@/types/event';
import { EventCard } from '@/components/events/EventCard';
import { EventCardSkeleton } from '@/components/events/EventCardSkeleton';

interface MobileEventDrawerProps {
    events: NormalizedEvent[];
    totalEvents: number;
    isLoading: boolean;
    error: string | null;
    selectedId: string | null;
    onSelectId: (id: string) => void;
    onRetry: () => void;
}

export function MobileEventDrawer({
    events,
    totalEvents,
    isLoading,
    error,
    selectedId,
    onSelectId,
    onRetry
}: MobileEventDrawerProps) {
    const cardRefs = useRef<Map<string, HTMLDivElement>>(new Map());

    // Auto-scroll selected card into view
    useEffect(() => {
        if (selectedId) {
            const card = cardRefs.current.get(selectedId);
            if (card) {
                card.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
            }
        }
    }, [selectedId]);

    return (
        <Drawer.Root snapPoints={['140px', 0.5, 0.95]} activeSnapPoint={0.5} defaultOpen>
            <Drawer.Portal>
                <Drawer.Overlay className="fixed inset-0 bg-black/40 md:hidden" />
                <Drawer.Content className="md:hidden bg-surface flex flex-col rounded-t-[10px] h-full h-[95vh] fixed bottom-0 left-0 right-0 z-[2000] border-t border-[var(--color-border)] outline-none shadow-2xl">

                    {/* Drawer Handle & Header */}
                    <div className="p-4 bg-surface rounded-t-[10px] flex-shrink-0">
                        <div className="mx-auto w-12 h-1.5 flex-shrink-0 rounded-full bg-slate-700 mb-4" />
                        <h2 className="text-lg font-bold text-white">Khronos Maps</h2>
                        <p className="text-sm text-slate-400">
                            {isLoading ? (
                                'Rastreando terreno...'
                            ) : error ? (
                                <span className="text-red-400">Error de conexión</span>
                            ) : (
                                <>{events.length} eventos en vista</>
                            )}
                        </p>
                    </div>

                    {/* Scrollable Content */}
                    <div className="p-4 overflow-y-auto flex-1 flex flex-col gap-4 pb-12 relative scrollbar-thin">

                        {/* Error State */}
                        {error && (
                            <div className="text-center py-8 flex flex-col items-center gap-3">
                                <span className="text-3xl" aria-hidden="true">⚠️</span>
                                <p className="text-slate-400 text-sm max-w-[250px]">{error}</p>
                                <button
                                    onClick={onRetry}
                                    className="px-4 py-2 mt-2 bg-road text-white rounded-lg text-sm font-medium"
                                >
                                    Reintentar
                                </button>
                            </div>
                        )}

                        {/* Empty State */}
                        {events.length === 0 && !isLoading && !error && (
                            <div className="text-center py-8 text-slate-400 text-sm">
                                No hay eventos aquí.<br />Mueve el mapa para explorar.
                            </div>
                        )}

                        {/* Loading Skeletons */}
                        {isLoading && events.length === 0 && (
                            <div className="flex flex-col gap-4">
                                {Array.from({ length: 4 }).map((_, i) => (
                                    <EventCardSkeleton key={`skeleton-${i}`} />
                                ))}
                            </div>
                        )}

                        {/* Event List */}
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
                                            onClick={() => onSelectId(stringId)}
                                        />
                                    </motion.div>
                                );
                            })}
                        </AnimatePresence>

                        {totalEvents > 100 && (
                            <div className="text-center text-xs text-slate-500 mt-2">
                                Mostrando 100 de {totalEvents}. Acerca el mapa para ver más.
                            </div>
                        )}

                    </div>
                </Drawer.Content>
            </Drawer.Portal>
        </Drawer.Root>
    );
}

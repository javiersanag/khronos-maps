import dynamic from 'next/dynamic';
import type { EventMapProps } from './EventMap';

/**
 * SSR-safe re-export of EventMap.
 * Leaflet accesses `window` on import, so the component must be loaded
 * client-side only (ssr: false).
 * The parent container is responsible for showing a skeleton while loading.
 */
export const EventMap = dynamic<EventMapProps>(
    () => import('./EventMap').then((m) => m.EventMap),
    { ssr: false }
);

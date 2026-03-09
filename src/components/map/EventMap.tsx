'use client';

import 'leaflet/dist/leaflet.css';
import 'react-leaflet-cluster/dist/assets/MarkerCluster.css';
import 'react-leaflet-cluster/dist/assets/MarkerCluster.Default.css';


import L, { type LatLngBounds } from 'leaflet';
import {
    MapContainer,
    TileLayer,
    Marker,
    Popup,
    useMapEvents,
    useMap,
} from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import { useEffect, useRef } from 'react';

// ── Leaflet icon Webpack fix ─────────────────────────────────────────────────
// Next.js/Webpack can't resolve Leaflet's default icon URLs; override manually.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// ── Terrain token colours (mirrors globals.css) ──────────────────────────────
const TERRAIN_COLORS: Record<Terrain, string> = {
    road: '#3B82F6',
    trail: '#22C55E',
    ultra: '#F97316',
    cross: '#A855F7',
};

/** Creates a 18x18 SVG circle DivIcon for a terrain type with premium glow. */
function makeTerrainIcon(terrain: Terrain): L.DivIcon {
    const color = TERRAIN_COLORS[terrain];
    return L.divIcon({
        className: 'custom-map-marker',
        html: `<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 22 22">
            <defs>
                <filter id="glow-${terrain}" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="2" result="blur" />
                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                </filter>
            </defs>
            <circle cx="11" cy="11" r="6" fill="${color}" filter="url(#glow-${terrain})" stroke="#ffffff" stroke-width="1.5"/>
        </svg>`,
        iconSize: [22, 22],
        iconAnchor: [11, 11],
        popupAnchor: [0, -11],
    });
}

// ── Types ────────────────────────────────────────────────────────────────────
type Terrain = 'road' | 'trail' | 'ultra' | 'cross';

export interface MapEvent {
    id: string;
    lat: number;
    lng: number;
    terrain: Terrain;
    title: string;
}

export interface EventMapProps {
    events: MapEvent[];
    /** ID of the currently selected event (highlights marker). */
    selectedId?: string | null;
    /** ID of an event to smoothly pan to. Triggered primarily from outside the map (e.g. sidebar click). */
    flyToId?: string | null;
    /** Called when a marker is clicked with the event's ID. */
    onMarkerClick: (id: string) => void;
    /** Called on every map moveend with the new visible bounds. */
    onBoundsChange: (bounds: LatLngBounds) => void;
}

// ── Child: fit map to all event markers on first render ──────────────────────
function InitialBounds({ events }: { events: MapEvent[] }) {
    const map = useMap();
    const fitted = useRef(false);

    useEffect(() => {
        if (fitted.current || events.length === 0) return;
        const bounds = L.latLngBounds(events.map(e => [e.lat, e.lng]));
        map.fitBounds(bounds, { padding: [40, 40] });
        fitted.current = true;
    }, [map, events]);

    return null;
}

// ── Child: fly to selected marker ────────────────────────────────────────────
function FlyToTracker({ events, flyToId }: { events: MapEvent[], flyToId: string | null | undefined }) {
    const map = useMap();

    useEffect(() => {
        if (!flyToId) return;
        const target = events.find(e => e.id === flyToId);
        if (target) {
            // Keep zoom level reasonably close to see surrounding context, minimum 11
            const zoom = Math.max(map.getZoom(), 11);
            map.flyTo([target.lat, target.lng], zoom, { animate: true, duration: 1.2 });
        }
    }, [map, events, flyToId]);

    return null;
}

// ── Child: emit bounds on moveend ────────────────────────────────────────────
function BoundsWatcher({ onBoundsChange }: { onBoundsChange: (b: LatLngBounds) => void }) {
    useMapEvents({
        moveend: (e) => {
            onBoundsChange(e.target.getBounds() as LatLngBounds);
        },
    });
    return null;
}

// ── Child: geolocate button ──────────────────────────────────────────────────
function GeolocateControl() {
    const map = useMap();

    function locate() {
        if (!navigator.geolocation) return;
        navigator.geolocation.getCurrentPosition(
            ({ coords }) => {
                map.setView([coords.latitude, coords.longitude], 13, { animate: true });
            },
            () => { /* silently fail */ }
        );
    }

    return (
        <button
            onClick={locate}
            title="Go to my location"
            aria-label="Go to my location"
            style={{
                position: 'absolute',
                bottom: '2.5rem',
                right: '0.75rem',
                zIndex: 1000,
                background: '#0f172a',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: '8px',
                width: '36px',
                height: '36px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: '#ededed',
            }}
            className="focus-visible:ring-2 focus-visible:ring-road focus-visible:outline-none transition-colors hover:bg-slate-800"
        >
            {/* crosshair SVG */}
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="3" />
                <line x1="12" y1="2" x2="12" y2="6" />
                <line x1="12" y1="18" x2="12" y2="22" />
                <line x1="2" y1="12" x2="6" y2="12" />
                <line x1="18" y1="12" x2="22" y2="12" />
            </svg>
        </button>
    );
}

// ── Main component ────────────────────────────────────────────────────────────
/**
 * Full-viewport interactive Leaflet map with:
 * - CartoDB Dark Matter tiles
 * - Terrain-colored custom markers
 * - Marker clustering via react-leaflet-cluster
 * - fitBounds on initial load
 * - Geolocate button
 * - Viewport bounds emitted on moveend
 *
 * Must be consumed via the dynamic-import wrapper in map/index.ts (ssr: false).
 */
export function EventMap({ events, selectedId, flyToId, onMarkerClick, onBoundsChange }: EventMapProps) {
    const iconCache = useRef<Partial<Record<Terrain, L.DivIcon>>>({});

    function getIcon(terrain: Terrain): L.DivIcon {
        if (!iconCache.current[terrain]) {
            iconCache.current[terrain] = makeTerrainIcon(terrain);
        }
        return iconCache.current[terrain]!;
    }

    return (
        <MapContainer
            center={[40.4168, -3.7038]} /* Madrid default */
            zoom={6}
            scrollWheelZoom
            style={{ height: '100%', width: '100%' }}
        >
            {/* CartoDB Dark Matter */}
            <TileLayer
                attribution='&copy; <a href="https://carto.com/attributions">CARTO</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                subdomains="abcd"
                maxZoom={19}
            />

            {/* Clustered markers */}
            <MarkerClusterGroup chunkedLoading>
                {events.map((event) => (
                    <Marker
                        key={event.id}
                        position={[event.lat, event.lng]}
                        icon={getIcon(event.terrain)}
                        eventHandlers={{
                            click: () => onMarkerClick(event.id),
                        }}
                        opacity={selectedId && selectedId !== event.id ? 0.45 : 1}
                        zIndexOffset={selectedId === event.id ? 1000 : 0}
                    >
                        <Popup>
                            <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>
                                {event.title}
                            </span>
                        </Popup>
                    </Marker>
                ))}
            </MarkerClusterGroup>

            <InitialBounds events={events} />
            <FlyToTracker events={events} flyToId={flyToId} />
            <BoundsWatcher onBoundsChange={onBoundsChange} />
            <GeolocateControl />
        </MapContainer>
    );
}

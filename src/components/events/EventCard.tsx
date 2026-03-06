import { NormalizedEvent } from '@/types/event';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Ruler, Euro } from 'lucide-react';
import { formatDate, formatDistance, getTerrainFromFormat } from '@/lib/utils/format';

/** Props for the EventCard component. */
interface EventCardProps {
    /** The canonical event object to display. */
    event: NormalizedEvent;
    /** Optional click handler for interactivity (e.g. map sync). */
    onClick?: () => void;
    /** Whether the card is currently highlighted/active. */
    active?: boolean;
}

/**
 * Renders a summary card for an event using glassmorphism styling.
 * Displays title, date, location, distance, price, and terrain badge.
 */
export function EventCard({ event, onClick, active }: EventCardProps) {
    const terrain = getTerrainFromFormat(event.format);

    return (
        <Card onClick={onClick} active={active} className={`flex flex-col gap-3 border-l-4 border-l-${terrain}`}>
            {/* Header: Name and Date */}
            <div className="flex justify-between items-start gap-4">
                <h3
                    className="font-semibold text-lg leading-tight tracking-tight text-blue-50 line-clamp-2"
                    title={event.name}
                >
                    {event.name}
                </h3>
                <span className="text-sm font-medium text-slate-400 whitespace-nowrap pt-1">
                    {formatDate(event.date)}
                </span>
            </div>

            {/* Middle: Location */}
            <div className="text-sm text-slate-300">
                {event.location}, {event.province}
            </div>

            {/* Footer: Metadata and Badges */}
            <div className="flex items-center justify-between mt-1">
                <div className="flex items-center gap-4 text-sm font-medium text-slate-300">
                    {event.distance ? (
                        <span className="flex items-center gap-1.5" aria-hidden="true">
                            <Ruler size={14} className="text-slate-400" />
                            {formatDistance(event.distance)}
                        </span>
                    ) : null}

                    {event.price ? (
                        <span className="flex items-center gap-1.5" aria-hidden="true">
                            <Euro size={14} className="text-slate-400" />
                            {event.price}€
                        </span>
                    ) : null}
                </div>

                <Badge terrain={terrain}>
                    {event.format}
                </Badge>
            </div>
        </Card>
    );
}

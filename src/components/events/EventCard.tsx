import { NormalizedEvent } from '@/types/event';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Link } from '@/i18n/routing';
import { Ruler, Euro, Calendar } from 'lucide-react';
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
 * Renders a summary card for an event using premium dark styling.
 * Displays title, date, location, distance, price, and terrain badge.
 */
export function EventCard({ event, onClick, active }: EventCardProps) {
    const terrain = getTerrainFromFormat(event.format);

    return (
        <Card onClick={onClick} active={active} className={`group flex flex-col gap-3 relative overflow-hidden`}>
            {/* Subtle left border accent on hover indicator */}
            <div className={`absolute left-0 top-0 bottom-0 w-1 bg-${terrain} opacity-50 group-hover:opacity-100 transition-opacity`} />

            {/* Header: Name and Date */}
            <div className="flex flex-col gap-1.5 pl-2">
                <Link href={`/event/${event.slug}`} className="relative z-10 w-fit" prefetch={false}>
                    <h3
                        className="font-bold text-base leading-tight tracking-tight text-white line-clamp-2 group-hover:text-[var(--color-brand-accent)] transition-colors"
                        title={event.name}
                    >
                        {/* Remove any manual uppercase rendering logic if it exists, styling naturally */}
                        {event.name}
                    </h3>
                </Link>

                <div className="flex items-center gap-1.5 text-[13px] font-medium text-slate-300">
                    <Calendar size={14} className="text-slate-400" />
                    <span>{formatDate(event.date)}</span>
                </div>
            </div>

            {/* Middle: Location */}
            <div className="text-[13px] text-slate-400 pl-2">
                {event.location}, {event.province}
            </div>

            {/* Footer: Metadata and Badges */}
            <div className="flex items-center justify-between mt-0.5">
                <div className="flex items-center gap-3 text-xs font-medium text-slate-300">
                    {event.distance ? (
                        <span className="flex items-center gap-1" aria-hidden="true">
                            <Ruler size={12} className="text-slate-400" />
                            {formatDistance(event.distance)}
                        </span>
                    ) : null}

                    {event.price ? (
                        <span className="flex items-center gap-1" aria-hidden="true">
                            <Euro size={12} className="text-slate-400" />
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

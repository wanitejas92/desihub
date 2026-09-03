import Link from 'next/link';
import { formatPriceRange, formatEventTime, formatEventDateCompact } from '@desihub/shared';
import type { EventWithRelations } from '@/lib/data';
import { EventImage } from './event-image';
import { CategoryPill } from './category-pill';
import { DateChip } from './date-chip';
import { FavouriteButton } from './favourite-button';
import { IconFlame, IconCalendar, IconMapPin, IconCheckCircle } from './ui/icons';
import { cn } from '@/lib/cn';

interface EventCardProps {
  event: EventWithRelations;
  priority?: boolean;
  className?: string;
  trending?: boolean;
}

/** Signature card: large image, floating date chip, category pill — light, spacious, premium. */
export function EventCard({ event, priority, className, trending }: EventCardProps) {
  const price = formatPriceRange(
    event.min_price_cents,
    event.max_price_cents,
    event.is_free,
    event.currency,
  );
  const soldOut = event.status === 'sold_out';
  const cancelled = event.status === 'cancelled';

  return (
    <Link
      href={`/e/${event.slug}`}
      className={cn(
        'group bg-surface border-border shadow-elevation hover:shadow-elevation-lg flex flex-col overflow-hidden rounded-lg border transition-all duration-200 ease-out hover:-translate-y-0.5',
        className,
      )}
    >
      <div className="bg-bg-subtle relative aspect-[4/3] overflow-hidden">
        <EventImage
          imageUrl={event.image_url}
          title={event.title}
          category={event.category}
          startsAt={event.starts_at}
          organiserName={event.organiser.name}
          priority={priority}
          fallbackWidth={800}
          fallbackHeight={600}
          className="transition-transform duration-300 ease-out group-hover:scale-[1.03]"
        />
        <div className="absolute top-3 left-3 flex flex-col items-start gap-1.5">
          <DateChip startsAt={event.starts_at} />
          {trending && (
            <span className="rounded-pill bg-accent text-accent-fg shadow-elevation inline-flex items-center gap-1 px-2 py-0.5 text-[11px] font-bold tracking-wide uppercase">
              <IconFlame width={12} height={12} />
              Trending
            </span>
          )}
        </div>
        <div className="absolute top-3 right-3 flex flex-col items-end gap-1.5">
          <FavouriteButton eventId={event.id} />
          <CategoryPill category={event.category} />
        </div>
        {(soldOut || cancelled) && (
          <div className="bg-fg/80 text-bg absolute inset-x-0 bottom-0 py-1.5 text-center text-xs font-bold tracking-wide uppercase">
            {soldOut ? 'Sold out' : 'Cancelled'}
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-1.5 p-4">
        <p className="text-fg-muted flex items-center gap-1.5 text-xs font-medium">
          <IconCalendar width={14} height={14} />
          {formatEventDateCompact(event.starts_at)} · {formatEventTime(event.starts_at)}
        </p>
        <h3 className="font-display text-fg group-hover:text-accent text-lg leading-tight font-semibold">
          {event.title}
        </h3>
        <div className="mt-auto flex items-end justify-between gap-2 pt-1">
          <p className="text-fg-muted flex items-center gap-1 text-sm">
            <IconMapPin width={14} height={14} />
            {event.venue?.city ?? 'Netherlands'}
          </p>
          <div className="text-right">
            <span className="text-fg text-sm font-semibold">{price}</span>
            {event.organiser.verified && (
              <span
                className="text-fg-subtle mt-0.5 flex items-center justify-end gap-1 text-xs"
                title="Verified organiser"
              >
                <IconCheckCircle width={12} height={12} />
                Verified
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}

import Link from 'next/link';
import { formatPriceRange, formatEventDateCompact, formatEventTime } from '@desihub/shared';
import type { EventWithRelations } from '@/lib/data';
import { EventImage } from './event-image';
import { FavouriteButton } from './favourite-button';
import { ShareButton } from './share-button';
import { IconCalendar, IconMapPin } from './ui/icons';
import { cn } from '@/lib/cn';

interface EventCardProps {
  event: EventWithRelations;
  priority?: boolean;
  className?: string;
  trending?: boolean;
}

/**
 * One bordered panel, not two separate pieces: the border/shadow used to sit
 * only on the image, so the date/title/location/price beneath it had no
 * visible edge of its own and read as loose text sitting on the page rather
 * than part of the card. Now the whole card — poster and info block both —
 * shares one border, radius and shadow.
 */
export function EventCard({ event, priority, className, trending }: EventCardProps) {
  const price = formatPriceRange(
    event.min_price_cents,
    event.max_price_cents,
    event.is_free,
    event.currency,
  );
  const soldOut = event.status === 'sold_out';
  const cancelled = event.status === 'cancelled';
  const unavailable = soldOut || cancelled;

  return (
    <Link
      href={`/e/${event.slug}`}
      className={cn(
        'group border-border bg-surface shadow-elevation hover:shadow-elevation-lg block overflow-hidden rounded-xl border transition-shadow duration-300 ease-out',
        className,
      )}
    >
      <div className="relative isolate aspect-[4/5]">
        <EventImage
          imageUrl={event.image_url}
          title={event.title}
          category={event.category}
          startsAt={event.starts_at}
          organiserName={event.organiser.name}
          priority={priority}
          fallbackWidth={800}
          fallbackHeight={1000}
          className={cn(
            'h-full w-full transition-transform duration-500 ease-out group-hover:scale-[1.04]',
            unavailable && 'grayscale-[35%]',
          )}
        />

        <div className="absolute top-3 right-3 z-10 flex flex-col gap-2">
          <FavouriteButton eventId={event.id} />
          <ShareButton title={event.title} path={`/e/${event.slug}`} variant="overlay" />
        </div>

        {trending && (
          <span className="bg-accent absolute top-3 left-3 z-10 rounded-full px-2.5 py-1 text-[10px] font-bold tracking-[0.14em] text-white uppercase">
            Trending
          </span>
        )}
      </div>

      <div className="p-3">
        <p className="text-fg-muted flex items-center gap-1.5 text-xs font-semibold">
          <IconCalendar width={13} height={13} className="shrink-0" />
          {formatEventDateCompact(event.starts_at)} · {formatEventTime(event.starts_at)}
        </p>
        <h3 className="font-display text-fg mt-1 line-clamp-2 text-[1.0625rem] leading-snug font-bold">
          {event.title}
        </h3>
        <div className="mt-1.5 flex items-center justify-between gap-3">
          <p className="text-fg-muted flex min-w-0 items-center gap-1 text-sm">
            <IconMapPin width={13} height={13} className="shrink-0" />
            <span className="truncate">{event.venue?.city ?? 'Netherlands'}</span>
          </p>
          <p
            className={cn('shrink-0 text-sm font-bold', unavailable ? 'text-fg-subtle' : 'text-fg')}
          >
            {unavailable ? (soldOut ? 'Sold out' : 'Cancelled') : price}
          </p>
        </div>
      </div>
    </Link>
  );
}

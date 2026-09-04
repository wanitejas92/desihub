import Link from 'next/link';
import { formatPriceRange, formatEventDateCompact, formatEventTime } from '@desihub/shared';
import type { EventWithRelations } from '@/lib/data';
import { EventImage } from './event-image';
import { FavouriteButton } from './favourite-button';
import { ShareButton } from './share-button';
import { cn } from '@/lib/cn';

interface EventCardProps {
  event: EventWithRelations;
  priority?: boolean;
  className?: string;
  trending?: boolean;
}

/**
 * Photography-first card: the image is the card, the type sits on it under a
 * scrim. Deliberately spare — date, title, venue, price, and a save control.
 * Every extra floating badge (category, trending, verified tick, a date chip
 * *and* a date line) competed with the artwork and made a grid of these read
 * as cluttered rather than premium, so they're gone; category and trending
 * are already the context the rail or filter above provides.
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
        'group relative isolate flex aspect-[4/5] flex-col justify-end overflow-hidden rounded-2xl',
        'shadow-elevation hover:shadow-elevation-lg transition-shadow duration-300 ease-out',
        className,
      )}
    >
      <div className="absolute inset-0 -z-10">
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
            'transition-transform duration-500 ease-out group-hover:scale-[1.04]',
            unavailable && 'grayscale-[35%]',
          )}
        />
        {/* Scrim: dark enough at the foot for white type, clear at the top so
            the artwork still reads. */}
        <div
          aria-hidden
          className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/35 to-black/5"
        />
      </div>

      <div className="absolute top-3 right-3 z-10 flex flex-col gap-2">
        <FavouriteButton eventId={event.id} />
        <ShareButton title={event.title} path={`/e/${event.slug}`} variant="overlay" />
      </div>

      {trending && (
        <span className="absolute top-3 left-3 z-10 rounded-full bg-white/15 px-2.5 py-1 text-[10px] font-bold tracking-[0.14em] text-white uppercase backdrop-blur-sm">
          Trending
        </span>
      )}

      <div className="relative p-4">
        <p className="text-[11px] font-semibold tracking-[0.12em] text-white/70 uppercase">
          {formatEventDateCompact(event.starts_at)} · {formatEventTime(event.starts_at)}
        </p>
        <h3 className="font-display mt-1.5 line-clamp-2 text-[1.0625rem] leading-snug font-bold text-white">
          {event.title}
        </h3>
        <div className="mt-2.5 flex items-baseline justify-between gap-3">
          <p className="truncate text-sm text-white/70">{event.venue?.city ?? 'Netherlands'}</p>
          <p className="shrink-0 text-sm font-semibold text-white">
            {unavailable ? (soldOut ? 'Sold out' : 'Cancelled') : price}
          </p>
        </div>
      </div>
    </Link>
  );
}

import Link from 'next/link';
import {
  formatPriceRange,
  formatEventDateCompact,
  formatEventTime,
  EVENT_CATEGORY_LABELS,
} from '@desihub/shared';
import type { EventWithRelations } from '@/lib/data';
import { EventImage } from './event-image';
import { FavouriteButton } from './favourite-button';
import { categoryColorVar } from '@/lib/category-tone';
import { cn } from '@/lib/cn';

interface EventCardProps {
  event: EventWithRelations;
  priority?: boolean;
  className?: string;
  trending?: boolean;
}

/**
 * The card, photography-first.
 *
 * It used to be a bordered, shadowed panel with the poster inset inside it —
 * so twenty-eight cards on /browse drew twenty-eight boxes, and the chrome
 * competed with the artwork it existed to frame. Border and shadow are gone;
 * the poster *is* the card, and the text sits directly beneath it on the
 * paper. That is the Dice/Airbnb move, and it is what lets a grid read as a
 * wall of posters rather than a table of tiles.
 *
 * Two other changes fall out of that:
 *
 * - The date moved onto the artwork as a frosted chip. It is the single
 *   most-scanned field on a listings page, and on the image it survives the
 *   hover scale (the media scales inside a fixed frame; the chip does not).
 * - The share button is gone. Two floating circles per card meant fifty-six
 *   of them on a full browse page — pure noise for an action nobody takes
 *   from a grid. Sharing lives on the event page, where someone has actually
 *   decided they care.
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
  // Computed from the event's own date, not the caller's query — a card is
  // "past" because it already happened, regardless of which filter or rail
  // fetched it, so price/CTA framing never misleadingly implies it's still
  // bookable.
  const past = new Date(event.ends_at ?? event.starts_at).getTime() < Date.now();
  const unavailable = soldOut || cancelled || past;
  const status = soldOut ? 'Sold out' : cancelled ? 'Cancelled' : past ? 'Ended' : null;

  return (
    <Link href={`/e/${event.slug}`} className={cn('group block', className)}>
      <div className="card-media bg-bg-sunken relative isolate aspect-[4/5] rounded-md">
        <EventImage
          imageUrl={event.image_url}
          title={event.title}
          category={event.category}
          startsAt={event.starts_at}
          organiserName={event.organiser.name}
          priority={priority}
          fallbackWidth={800}
          fallbackHeight={1000}
          className={cn('h-full w-full', unavailable && 'grayscale-[45%]')}
        />

        {/* Bottom scrim only — it darkens where the chips sit and nowhere
            else, so the artwork stays the brightest part of the card. */}
        <span
          aria-hidden
          className="card-scrim absolute inset-x-0 bottom-0 z-[1] h-1/3 bg-gradient-to-t from-black/55 to-transparent"
        />

        <span className="absolute top-3 left-3 z-10 rounded-sm bg-black/55 px-2 py-1 text-[11px] font-semibold text-white backdrop-blur-sm">
          {formatEventDateCompact(event.starts_at)} · {formatEventTime(event.starts_at)}
        </span>

        <div className="absolute top-3 right-3 z-10">
          <FavouriteButton eventId={event.id} />
        </div>

        {(trending || status) && (
          <span
            className={cn(
              'absolute bottom-3 left-3 z-10 rounded-sm px-2 py-1 text-[10px] font-bold tracking-[0.12em] uppercase',
              status ? 'bg-white/90 text-black' : 'bg-accent text-accent-fg',
            )}
          >
            {status ?? 'Trending'}
          </span>
        )}
      </div>

      <div className="mt-3">
        <h3 className="font-display text-fg group-hover:text-accent line-clamp-2 text-lg leading-tight font-bold transition-colors duration-150">
          {event.title}
        </h3>
        {/* One meta line, not three stacked rows. The category dot is the
            only place the identity palette appears on a card — small enough
            to identify, never large enough to compete with the accent. */}
        <p className="text-fg-muted mt-1.5 flex items-center gap-1.5 text-sm">
          <span
            aria-hidden
            className="h-1.5 w-1.5 shrink-0 rounded-full"
            style={{ backgroundColor: categoryColorVar(event.category) }}
          />
          <span className="truncate">{EVENT_CATEGORY_LABELS[event.category]}</span>
          <span className="text-fg-subtle" aria-hidden>
            ·
          </span>
          <span className="truncate">{event.venue?.city ?? 'Netherlands'}</span>
        </p>
        <p
          className={cn(
            'mt-1 text-sm font-semibold tabular-nums',
            unavailable ? 'text-fg-subtle' : 'text-fg',
          )}
        >
          {status ?? price}
        </p>
      </div>
    </Link>
  );
}

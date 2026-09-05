import Link from 'next/link';
import { formatPriceRange, formatEventDateCompact, formatEventTime } from '@desihub/shared';
import type { EventWithRelations } from '@/lib/data';
import { EventImage } from './event-image';
import { FavouriteButton } from './favourite-button';
import { ShareButton } from './share-button';
import { IconCalendar } from './ui/icons';
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
 * - The date sits with the rest of the text, under the image. It was
 *   overlaid on the artwork as a frosted chip for a while, which looked
 *   good at 390px and fell apart below it: at 320px a two-up grid leaves the
 *   chip about 70px once it has cleared the action buttons, so
 *   "Sat, 12 Sept" rendered as "Sat, 12 …". Nothing that gets truncated to
 *   uselessness belongs on the artwork; the image carries only the two
 *   controls now.
 * - Favourite and share sit on the artwork as a single stacked pair. They
 *   were removed at one point as clutter — fifty-six floating circles on a
 *   full browse page — but sharing an event from the grid is exactly how
 *   these get passed around a WhatsApp family group, which is most of how
 *   this audience finds things. They are back, tucked to one corner and
 *   sized down so they read as controls on the poster rather than as two
 *   more objects competing with it.
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

        {/* Side by side, not stacked: a vertical pair eats 5rem of the
            image's width allowance and leaves nothing beside it. */}
        <div className="absolute top-2.5 right-2.5 z-10 flex items-center gap-1.5">
          <FavouriteButton eventId={event.id} />
          <ShareButton title={event.title} path={`/e/${event.slug}`} variant="overlay" />
        </div>

        {(trending || status) && (
          <span
            className={cn(
              'absolute bottom-2.5 left-2.5 z-10 rounded-sm px-2 py-1 text-[10px] font-bold tracking-[0.12em] uppercase',
              status ? 'bg-white/90 text-black' : 'bg-accent text-accent-fg',
            )}
          >
            {status ?? 'Trending'}
          </span>
        )}
      </div>

      <div className="mt-3">
        {/* Date first, on its own line and in the accent — it is what people
            scan a listings grid for, and it now has the card's whole width
            rather than whatever was left beside the buttons. */}
        <p className="text-accent flex items-center gap-1.5 text-xs font-bold">
          <IconCalendar width={13} height={13} className="shrink-0" />
          <span className="truncate">
            {formatEventDateCompact(event.starts_at)}
            {/* The time is the first thing to go when the line is tight. At
                320px a two-up grid leaves each card ~136px, which fits the
                date but not the date and the time — and a date truncated to
                "Mon, 14 Sept · …" tells you less than the date alone. */}
            <span className="hidden min-[360px]:inline">
              {' · '}
              {formatEventTime(event.starts_at)}
            </span>
          </span>
        </p>

        <h3 className="font-display text-fg group-hover:text-accent mt-1.5 line-clamp-2 text-base leading-tight font-bold transition-colors duration-150 sm:text-lg">
          {event.title}
        </h3>

        {/* The category dot is the only place the identity palette appears on
            a card — small enough to identify, never large enough to compete
            with the accent. */}
        <p className="text-fg-muted mt-1.5 flex min-w-0 items-center gap-1.5 text-sm">
          <span
            aria-hidden
            className="h-1.5 w-1.5 shrink-0 rounded-full"
            style={{ backgroundColor: categoryColorVar(event.category) }}
          />
          <span className="truncate">{event.venue?.city ?? 'Netherlands'}</span>
        </p>

        <p
          className={cn(
            'mt-1 text-sm font-bold tabular-nums',
            unavailable ? 'text-fg-subtle' : event.is_free ? 'text-success' : 'text-fg',
          )}
        >
          {status ?? price}
        </p>
      </div>
    </Link>
  );
}

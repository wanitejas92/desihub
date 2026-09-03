import Link from 'next/link';
import { formatPriceRange, formatEventTime } from '@desihub/shared';
import type { EventWithRelations } from '@/lib/data';
import { EventImage } from './event-image';
import { CategoryPill } from './category-pill';
import { DateChip } from './date-chip';
import { cn } from '@/lib/cn';

interface EventCardProps {
  event: EventWithRelations;
  priority?: boolean;
  className?: string;
}

/** Signature card: full-bleed image, floating date chip, category pill. */
export function EventCard({ event, priority, className }: EventCardProps) {
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
        'group bg-surface flex flex-col overflow-hidden rounded-md transition-transform duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-0.5 focus-visible:-translate-y-0.5',
        className,
      )}
    >
      <div className="bg-bg-sunken relative aspect-[4/5] overflow-hidden">
        <EventImage
          imageUrl={event.image_url}
          title={event.title}
          category={event.category}
          startsAt={event.starts_at}
          organiserName={event.organiser.name}
          priority={priority}
          className="transition-transform duration-300 ease-out group-hover:scale-[1.03]"
        />
        <div className="absolute top-3 left-3">
          <DateChip startsAt={event.starts_at} />
        </div>
        <div className="absolute top-3 right-3">
          <CategoryPill category={event.category} />
        </div>
        {(soldOut || cancelled) && (
          <div className="bg-fg/80 text-bg absolute inset-x-0 bottom-0 py-1.5 text-center text-xs font-bold tracking-wide uppercase">
            {soldOut ? 'Sold out' : 'Cancelled'}
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-1 p-3">
        <h3 className="font-display text-fg group-hover:text-accent text-lg leading-tight font-semibold">
          {event.title}
        </h3>
        <p className="text-fg-muted text-sm">
          {event.venue?.city ?? 'Netherlands'} · {formatEventTime(event.starts_at)}
        </p>
        <div className="mt-1 flex items-center justify-between">
          <span className="text-fg text-sm font-semibold">{price}</span>
          {event.organiser.verified && (
            <span className="text-fg-subtle text-xs" title="Verified organiser">
              ✓ Verified
            </span>
          )}
        </div>
      </div>
    </Link>
  );
}

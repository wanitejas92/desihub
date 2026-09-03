import Link from 'next/link';
import type { EventWithRelations } from '@/lib/data';
import { EventCard } from './event-card';
import { EmptyState } from './empty-state';

interface EventRailProps {
  title: string;
  events: EventWithRelations[];
  seeAllHref?: string;
  emptyTitle?: string;
  emptyDescription?: string;
  priorityFirst?: boolean;
}

/** A horizontally scrollable rail with a snap layout — used for home sections. */
export function EventRail({
  title,
  events,
  seeAllHref,
  emptyTitle,
  emptyDescription,
  priorityFirst,
}: EventRailProps) {
  return (
    <section className="max-w-content mx-auto px-4 py-6 sm:px-6">
      <div className="mb-4 flex items-baseline justify-between gap-4">
        <h2 className="font-display text-xl font-semibold sm:text-2xl">{title}</h2>
        {seeAllHref && events.length > 0 && (
          <Link
            href={seeAllHref}
            className="text-accent shrink-0 text-sm font-semibold hover:underline"
          >
            See all →
          </Link>
        )}
      </div>

      {events.length === 0 ? (
        <EmptyState
          title={emptyTitle ?? 'Nothing here yet'}
          description={emptyDescription}
          action={{ href: '/submit', label: 'Submit an event' }}
        />
      ) : (
        <ul
          className="-mx-4 flex snap-x snap-mandatory [scrollbar-width:thin] gap-4 overflow-x-auto px-4 pb-2 sm:mx-0 sm:px-0"
          role="list"
        >
          {events.map((event, i) => (
            <li key={event.id} className="w-[68vw] shrink-0 snap-start sm:w-64">
              <EventCard event={event} priority={priorityFirst && i === 0} />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

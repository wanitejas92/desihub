import type { EventWithRelations } from '@/lib/data';
import { EventCard } from './event-card';

export function EventGrid({
  events,
  trending,
  sidebar,
}: {
  events: EventWithRelations[];
  trending?: boolean;
  /**
   * True when this grid sits next to a filter sidebar (currently just
   * `/browse`) rather than spanning the full content width. That column
   * stays capped around 900px no matter how wide the viewport gets — the
   * page container itself maxes out at 1200px — so unlike the full-width
   * grids there's no wider breakpoint where a 4th column ever has more room;
   * 3 stays the right count all the way up.
   */
  sidebar?: boolean;
}) {
  return (
    <ul
      role="list"
      className={
        sidebar
          ? 'grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-3'
          : 'grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4'
      }
      data-testid="event-grid"
    >
      {events.map((event, i) => (
        <li key={event.id}>
          <EventCard event={event} priority={i < 4} trending={trending} />
        </li>
      ))}
    </ul>
  );
}

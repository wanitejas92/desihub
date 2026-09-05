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
      // Gutters grow with the viewport rather than staying at a fixed 16px:
      // a 4-across desktop grid with phone-sized gaps is the classic
      // "content squeezed together" look, and generous gutters are most of
      // what makes a grid read as considered.
      //
      // Two columns on a phone. Single-column was tried and is worse: the
      // homepage ran to 16,700px, which is not a page anyone reaches the
      // bottom of. The cramping in the audit came from the bordered card and
      // 11px metadata, not from the column count — with the border gone and
      // the title at 18px, a 2-up poster wall reads the way Dice's does.
      className={
        sidebar
          ? 'grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-2 lg:grid-cols-3 lg:gap-x-6'
          : 'grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-4 lg:gap-x-6 lg:gap-y-12'
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

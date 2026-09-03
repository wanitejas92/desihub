import type { EventWithRelations } from '@/lib/data';
import { EventCard } from './event-card';

export function EventGrid({ events }: { events: EventWithRelations[] }) {
  return (
    <ul
      role="list"
      className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4"
      data-testid="event-grid"
    >
      {events.map((event, i) => (
        <li key={event.id}>
          <EventCard event={event} priority={i < 4} />
        </li>
      ))}
    </ul>
  );
}

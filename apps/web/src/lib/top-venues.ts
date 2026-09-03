import type { EventWithRelations } from './data';

export interface VenueCount {
  id: string;
  name: string;
  city: string;
  count: number;
}

/**
 * Ranks venues by real upcoming-event count, from an already-fetched event
 * pool — mirrors how Popular Cities counts cities, just no dedicated
 * repository method since this is homepage-only for now.
 */
export function topVenues(events: EventWithRelations[], limit = 5): VenueCount[] {
  const byId = new Map<string, VenueCount>();
  for (const event of events) {
    if (!event.venue) continue;
    const existing = byId.get(event.venue.id);
    if (existing) existing.count += 1;
    else
      byId.set(event.venue.id, {
        id: event.venue.id,
        name: event.venue.name,
        city: event.venue.city,
        count: 1,
      });
  }
  return [...byId.values()].sort((a, b) => b.count - a.count).slice(0, limit);
}

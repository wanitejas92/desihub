import type { Event, Organiser, Venue, TicketType, EventCategory, City } from '@desihub/shared';

/** An event joined with the relations the listings layer needs to render. */
export interface EventWithRelations extends Event {
  organiser: Pick<Organiser, 'id' | 'name' | 'slug' | 'verified' | 'city' | 'logo_url'>;
  venue: Pick<Venue, 'id' | 'name' | 'city' | 'address' | 'lat' | 'lng'> | null;
  ticketTypes: Pick<TicketType, 'id' | 'name' | 'price_cents' | 'quantity' | 'sold'>[];
}

export interface OrganiserWithEvents extends Organiser {
  events: EventWithRelations[];
}

/** URL-driven browse filters. Everything optional so the URL stays shareable. */
export interface EventFilters {
  city?: City;
  category?: EventCategory;
  /** ISO date (inclusive lower bound) in the venue timezone. */
  dateFrom?: string;
  /** ISO date (inclusive upper bound). */
  dateTo?: string;
  language?: string;
  /** 'free' | 'paid' */
  price?: 'free' | 'paid';
  familyFriendly?: boolean;
  search?: string;
  /** Include past events (default false — upcoming only). */
  includePast?: boolean;
  limit?: number;
  offset?: number;
}

export interface Paginated<T> {
  items: T[];
  total: number;
}

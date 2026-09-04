import type { Event, Organiser, Venue, TicketType } from '../schemas';
import type { EventCategory, City } from '../constants';

/** An event joined with the relations the listings layer needs to render. */
export interface EventWithRelations extends Event {
  organiser: Pick<Organiser, 'id' | 'name' | 'slug' | 'verified' | 'city' | 'logo_url'>;
  venue: Pick<Venue, 'id' | 'name' | 'city' | 'address' | 'lat' | 'lng'> | null;
  ticketTypes: Pick<TicketType, 'id' | 'name' | 'price_cents' | 'quantity' | 'sold'>[];
}

export interface OrganiserWithEvents extends Organiser {
  events: EventWithRelations[];
}

/** The organiser fields a card needs — the same shape events carry inline. */
export type OrganiserSummary = EventWithRelations['organiser'];

/** URL-driven browse filters. Everything optional so the URL stays shareable. */
export interface EventFilters {
  city?: City;
  category?: EventCategory;
  dateFrom?: string;
  dateTo?: string;
  language?: string;
  price?: 'free' | 'paid';
  familyFriendly?: boolean;
  search?: string;
  includePast?: boolean;
  limit?: number;
  offset?: number;
}

export interface Paginated<T> {
  items: T[];
  total: number;
}

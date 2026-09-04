import type { SubmitEventInput, SubscribeInput } from '../schemas';
import type { City } from '../constants';
import type {
  EventWithRelations,
  EventFilters,
  OrganiserSummary,
  OrganiserWithEvents,
  Paginated,
} from './types';

export interface SubmitResult {
  ok: true;
  slug: string;
}

export interface SubscribeResult {
  ok: true;
}

export interface CityCount {
  city: City;
  count: number;
}

/**
 * The data contract for the listings layer. One interface, two implementations:
 * a Supabase-backed adapter (production) and an in-memory mock (dev/offline/E2E).
 * The UI never knows which is behind it.
 */
export interface EventRepository {
  listEvents(filters: EventFilters): Promise<Paginated<EventWithRelations>>;
  getEventBySlug(slug: string): Promise<EventWithRelations | null>;
  featured(limit?: number): Promise<EventWithRelations[]>;
  thisWeek(limit?: number): Promise<EventWithRelations[]>;
  thisWeekend(limit?: number): Promise<EventWithRelations[]>;
  nearYou(city: string | undefined, limit?: number): Promise<EventWithRelations[]>;
  /** Cities ranked by their real upcoming-event count — never a fabricated number. */
  popularCities(limit?: number): Promise<CityCount[]>;
  similar(event: EventWithRelations, limit?: number): Promise<EventWithRelations[]>;
  /** Lookup by id, for account collections (saved events / followed organisers). */
  eventsByIds(ids: string[]): Promise<EventWithRelations[]>;
  organisersByIds(ids: string[]): Promise<OrganiserSummary[]>;
  getOrganiserBySlug(slug: string): Promise<OrganiserWithEvents | null>;
  listOrganiserSlugs(): Promise<string[]>;
  listEventSlugs(): Promise<string[]>;
  submitEvent(input: SubmitEventInput): Promise<SubmitResult>;
  subscribe(input: SubscribeInput): Promise<SubscribeResult>;
}

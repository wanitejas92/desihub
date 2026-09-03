import type { SubmitEventInput, SubscribeInput } from '../schemas';
import type { EventWithRelations, EventFilters, OrganiserWithEvents, Paginated } from './types';

export interface SubmitResult {
  ok: true;
  slug: string;
}

export interface SubscribeResult {
  ok: true;
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
  thisWeekend(limit?: number): Promise<EventWithRelations[]>;
  nearYou(city: string | undefined, limit?: number): Promise<EventWithRelations[]>;
  similar(event: EventWithRelations, limit?: number): Promise<EventWithRelations[]>;
  getOrganiserBySlug(slug: string): Promise<OrganiserWithEvents | null>;
  listOrganiserSlugs(): Promise<string[]>;
  listEventSlugs(): Promise<string[]>;
  submitEvent(input: SubmitEventInput): Promise<SubmitResult>;
  subscribe(input: SubscribeInput): Promise<SubscribeResult>;
}

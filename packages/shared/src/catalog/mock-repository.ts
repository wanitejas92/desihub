import { draftSlug, type SubmitEventInput, type SubscribeInput } from '../schemas';
import { isThisWeek, isThisWeekend } from '../datetime';
import type { EventRepository, SubmitResult, SubscribeResult } from './repository';
import type { EventWithRelations, EventFilters, OrganiserWithEvents, Paginated } from './types';
import { MOCK_EVENTS, MOCK_ORGANISERS } from './mock-data';
import { applyFilters, paginate } from './filter';

/**
 * In-memory repository. Reads from the mock catalogue; writes (submit/subscribe)
 * are validated and acknowledged but not persisted — the mock has no database.
 * This is the adapter used whenever Supabase env is absent.
 */
export class MockEventRepository implements EventRepository {
  private events = MOCK_EVENTS;

  async listEvents(filters: EventFilters): Promise<Paginated<EventWithRelations>> {
    const filtered = applyFilters(this.events, filters);
    const items = paginate(filtered, filters.offset ?? 0, filters.limit);
    return { items, total: filtered.length };
  }

  async getEventBySlug(slug: string): Promise<EventWithRelations | null> {
    return this.events.find((e) => e.slug === slug) ?? null;
  }

  async featured(limit = 6): Promise<EventWithRelations[]> {
    return applyFilters(this.events, {})
      .filter((e) => e.featured)
      .slice(0, limit);
  }

  async thisWeek(limit = 8): Promise<EventWithRelations[]> {
    return applyFilters(this.events, {})
      .filter((e) => isThisWeek(e.starts_at))
      .slice(0, limit);
  }

  async thisWeekend(limit = 8): Promise<EventWithRelations[]> {
    return applyFilters(this.events, {})
      .filter((e) => isThisWeekend(e.starts_at))
      .slice(0, limit);
  }

  async nearYou(city: string | undefined, limit = 8): Promise<EventWithRelations[]> {
    const upcoming = applyFilters(this.events, {});
    if (!city) return upcoming.slice(0, limit);
    const local = upcoming.filter((e) => e.venue?.city === city);
    // Fall back to the wider list if the city is quiet, so the rail is never empty.
    return (local.length > 0 ? local : upcoming).slice(0, limit);
  }

  async similar(event: EventWithRelations, limit = 4): Promise<EventWithRelations[]> {
    const upcoming = applyFilters(this.events, {}).filter((e) => e.id !== event.id);
    const scored = upcoming
      .map((e) => {
        let score = 0;
        if (e.category === event.category) score += 3;
        if (e.venue?.city === event.venue?.city) score += 2;
        if (e.tags.some((t) => event.tags.includes(t))) score += 1;
        return { e, score };
      })
      .filter((s) => s.score > 0)
      .sort((a, b) => b.score - a.score);
    return scored.slice(0, limit).map((s) => s.e);
  }

  async getOrganiserBySlug(slug: string): Promise<OrganiserWithEvents | null> {
    const org = Object.values(MOCK_ORGANISERS).find((o) => o.slug === slug);
    if (!org) return null;
    const events = this.events
      .filter((e) => e.organiser.slug === slug)
      .sort((a, b) => new Date(b.starts_at).getTime() - new Date(a.starts_at).getTime());
    return {
      id: org.id,
      name: org.name,
      slug: org.slug,
      logo_url: null,
      bio: org.bio,
      city: org.city as never,
      verified: org.verified,
      contact_email: null,
      payout_details: null,
      socials: {},
      created_at: '2026-01-01T00:00:00Z',
      events,
    };
  }

  async listOrganiserSlugs(): Promise<string[]> {
    return Object.values(MOCK_ORGANISERS).map((o) => o.slug);
  }

  async listEventSlugs(): Promise<string[]> {
    return this.events.map((e) => e.slug);
  }

  async submitEvent(input: SubmitEventInput): Promise<SubmitResult> {
    // No persistence in the mock; return the slug the draft would receive.
    return { ok: true, slug: draftSlug(input.title) };
  }

  async subscribe(_input: SubscribeInput): Promise<SubscribeResult> {
    return { ok: true };
  }
}

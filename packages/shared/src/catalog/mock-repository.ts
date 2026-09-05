import { draftSlug, type SubmitEventInput, type SubscribeInput } from '../schemas';
import { isThisWeek, isThisWeekend } from '../datetime';
import type { EventRepository, SubmitResult, SubscribeResult, CityCount } from './repository';
import type {
  EventWithRelations,
  EventFilters,
  OrganiserSummary,
  OrganiserWithEvents,
  Paginated,
} from './types';
import { MOCK_EVENTS, MOCK_ORGANISERS } from './mock-data';
import { applyFilters, paginate, cityCounts } from './filter';
import { mockExtraSold } from './mock-inventory';
import { mockRecordSubmission } from './mock-submissions';

/**
 * In-memory repository. Reads from the mock catalogue; writes (submit/subscribe)
 * are validated and acknowledged but not persisted — the mock has no database.
 * This is the adapter used whenever Supabase env is absent.
 */
export class MockEventRepository implements EventRepository {
  /**
   * Recomputed on every access (the catalogue is small) so tickets sold via
   * the mock checkout path — tracked separately in `mock-inventory.ts` so it
   * survives Next.js's per-bundle module copies — show up here without this
   * class needing to know when a purchase happened.
   */
  private get events(): EventWithRelations[] {
    return MOCK_EVENTS.map((e) => {
      if (e.ticketTypes.length === 0) return e;
      const ticketTypes = e.ticketTypes.map((t) => ({ ...t, sold: t.sold + mockExtraSold(t.id) }));
      const remaining = ticketTypes.reduce((acc, t) => acc + Math.max(t.quantity - t.sold, 0), 0);
      const status = remaining <= 0 && e.status === 'published' ? 'sold_out' : e.status;
      return { ...e, ticketTypes, status };
    });
  }

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

  async popularCities(limit = 6): Promise<CityCount[]> {
    return cityCounts(applyFilters(this.events, {}), limit);
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

  async eventsByIds(ids: string[]): Promise<EventWithRelations[]> {
    if (ids.length === 0) return [];
    const wanted = new Set(ids);
    // Past events included on purpose: a saved event that has happened should
    // still appear in the account, marked as past, not silently vanish.
    return this.events.filter((e) => wanted.has(e.id));
  }

  async organisersByIds(ids: string[]): Promise<OrganiserSummary[]> {
    if (ids.length === 0) return [];
    const wanted = new Set(ids);
    return Object.values(MOCK_ORGANISERS)
      .filter((o) => wanted.has(o.id))
      .map((o) => ({
        id: o.id,
        name: o.name,
        slug: o.slug,
        verified: o.verified,
        city: o.city as OrganiserSummary['city'],
        logo_url: null,
      }));
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

  /** No real follows in the mock catalogue — a stable, deterministic stand-in. */
  async followerCount(organiserId: string): Promise<number> {
    let hash = 0;
    for (let i = 0; i < organiserId.length; i++)
      hash = (hash * 31 + organiserId.charCodeAt(i)) >>> 0;
    return 8 + (hash % 120);
  }

  async listOrganiserSlugs(): Promise<string[]> {
    return Object.values(MOCK_ORGANISERS).map((o) => o.slug);
  }

  async listEventSlugs(): Promise<string[]> {
    return this.events.map((e) => e.slug);
  }

  async listFeaturedOrganizers(limit = 6): Promise<OrganiserSummary[]> {
    // Count published events per organizer, return top by count.
    const publishedByOrg = new Map<
      string,
      { org: (typeof MOCK_ORGANISERS)[string]; count: number }
    >();
    for (const event of this.events) {
      if (event.status !== 'published') continue;
      const orgSlug = event.organiser.slug;
      const org = Object.values(MOCK_ORGANISERS).find((o) => o.slug === orgSlug);
      if (!org) continue;
      const entry = publishedByOrg.get(org.id) || { org, count: 0 };
      publishedByOrg.set(org.id, { org, count: entry.count + 1 });
    }
    return Array.from(publishedByOrg.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, limit)
      .map((entry) => ({
        id: entry.org.id,
        name: entry.org.name,
        slug: entry.org.slug,
        verified: entry.org.verified,
        city: entry.org.city as OrganiserSummary['city'],
        logo_url: null,
      }));
  }

  /**
   * Mirrors `submit_public_event`: a submission becomes a draft, and a draft
   * is not public. The slug carries a random suffix for the same reason the
   * RPC adds one — `events.slug` is unique, so two "Diwali Night"s must not
   * collide.
   */
  async submitEvent(input: SubmitEventInput): Promise<SubmitResult> {
    const slug = `${draftSlug(input.title)}-${Math.random().toString(36).slice(2, 8)}`;
    mockRecordSubmission({
      slug,
      title: input.title,
      starts_at: input.starts_at,
      city: input.city,
      organiser_name: input.organiser_name,
      venue_name: input.venue_name,
      category: input.category,
    });
    return { ok: true, slug };
  }

  async subscribe(_input: SubscribeInput): Promise<SubscribeResult> {
    return { ok: true };
  }
}

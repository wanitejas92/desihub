import {
  draftSlug,
  isThisWeek,
  isThisWeekend,
  slugify,
  cityCounts,
  type SubmitEventInput,
  type SubscribeInput,
} from '@desihub/shared';
import type { SupabaseClient } from '@supabase/supabase-js';
import type {
  EventRepository,
  SubmitResult,
  SubscribeResult,
  EventWithRelations,
  EventFilters,
  OrganiserSummary,
  OrganiserWithEvents,
  Paginated,
  CityCount,
} from '@desihub/shared';

const EVENT_SELECT = `
  *,
  organiser:organisers!inner(id,name,slug,verified,city,logo_url),
  venue:venues(id,name,city,address,lat,lng),
  ticketTypes:ticket_types(id,name,price_cents,quantity,sold,fee_mode,min_per_order,max_per_order)
`;

const VISIBLE = ['published', 'sold_out', 'cancelled'];

/** Supabase-backed repository. RLS keeps anonymous reads to visible events. */
export class SupabaseEventRepository implements EventRepository {
  constructor(private readonly db: SupabaseClient) {}

  async listEvents(filters: EventFilters): Promise<Paginated<EventWithRelations>> {
    let q = this.db.from('events').select(EVENT_SELECT, { count: 'exact' }).in('status', VISIBLE);

    if (filters.category) q = q.eq('category', filters.category);
    if (filters.familyFriendly) q = q.eq('family_friendly', true);
    if (filters.price === 'free') q = q.eq('is_free', true);
    if (filters.price === 'paid') q = q.eq('is_free', false);
    if (filters.dateFrom) q = q.gte('starts_at', filters.dateFrom);
    if (filters.dateTo) q = q.lte('starts_at', `${filters.dateTo}T23:59:59Z`);
    if (!filters.includePast) q = q.gte('starts_at', new Date().toISOString());
    if (filters.language) q = q.contains('languages', [filters.language]);
    if (filters.search) q = q.ilike('title', `%${filters.search}%`);

    q = q.order('starts_at', { ascending: !filters.includePast });

    const offset = filters.offset ?? 0;
    if (filters.limit != null) q = q.range(offset, offset + filters.limit - 1);

    const { data, count, error } = await q;
    if (error) throw error;
    let items = (data ?? []).map(normaliseEvent);
    if (filters.city) items = items.filter((e) => e.venue?.city === filters.city);
    return { items, total: count ?? items.length };
  }

  async getEventBySlug(slug: string): Promise<EventWithRelations | null> {
    const { data, error } = await this.db
      .from('events')
      .select(EVENT_SELECT)
      .eq('slug', slug)
      .in('status', VISIBLE)
      .maybeSingle();
    if (error) throw error;
    return data ? normaliseEvent(data) : null;
  }

  async featured(limit = 6): Promise<EventWithRelations[]> {
    const { data, error } = await this.db
      .from('events')
      .select(EVENT_SELECT)
      .in('status', VISIBLE)
      .eq('featured', true)
      .gte('starts_at', new Date().toISOString())
      .order('starts_at', { ascending: true })
      .limit(limit);
    if (error) throw error;
    return (data ?? []).map(normaliseEvent);
  }

  private async upcoming(limit = 100): Promise<EventWithRelations[]> {
    const { data, error } = await this.db
      .from('events')
      .select(EVENT_SELECT)
      .in('status', VISIBLE)
      .gte('starts_at', new Date().toISOString())
      .order('starts_at', { ascending: true })
      .limit(limit);
    if (error) throw error;
    return (data ?? []).map(normaliseEvent);
  }

  async thisWeek(limit = 8): Promise<EventWithRelations[]> {
    const up = await this.upcoming();
    return up.filter((e) => isThisWeek(e.starts_at)).slice(0, limit);
  }

  async thisWeekend(limit = 8): Promise<EventWithRelations[]> {
    const up = await this.upcoming();
    return up.filter((e) => isThisWeekend(e.starts_at)).slice(0, limit);
  }

  async nearYou(city: string | undefined, limit = 8): Promise<EventWithRelations[]> {
    const up = await this.upcoming();
    if (!city) return up.slice(0, limit);
    const local = up.filter((e) => e.venue?.city === city);
    return (local.length > 0 ? local : up).slice(0, limit);
  }

  async popularCities(limit = 6): Promise<CityCount[]> {
    return cityCounts(await this.upcoming(), limit);
  }

  async similar(event: EventWithRelations, limit = 4): Promise<EventWithRelations[]> {
    const up = (await this.upcoming()).filter((e) => e.id !== event.id);
    return up
      .map((e) => {
        let score = 0;
        if (e.category === event.category) score += 3;
        if (e.venue?.city === event.venue?.city) score += 2;
        if (e.tags.some((t) => event.tags.includes(t))) score += 1;
        return { e, score };
      })
      .filter((s) => s.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit)
      .map((s) => s.e);
  }

  async eventsByIds(ids: string[]): Promise<EventWithRelations[]> {
    if (ids.length === 0) return [];
    // No status filter and no date floor: a saved event that sold out, was
    // cancelled, or has already happened still belongs in the account.
    const { data, error } = await this.db.from('events').select(EVENT_SELECT).in('id', ids);
    if (error) throw error;
    return (data ?? []).map(normaliseEvent);
  }

  async organisersByIds(ids: string[]): Promise<OrganiserSummary[]> {
    if (ids.length === 0) return [];
    const { data, error } = await this.db
      .from('organisers')
      .select('id,name,slug,verified,city,logo_url')
      .in('id', ids);
    if (error) throw error;
    return (data ?? []) as OrganiserSummary[];
  }

  async getOrganiserBySlug(slug: string): Promise<OrganiserWithEvents | null> {
    const { data: org, error } = await this.db
      .from('organisers')
      .select('*')
      .eq('slug', slug)
      .maybeSingle();
    if (error) throw error;
    if (!org) return null;
    const { data: events, error: evErr } = await this.db
      .from('events')
      .select(EVENT_SELECT)
      .eq('organiser_id', org.id)
      .in('status', VISIBLE)
      .order('starts_at', { ascending: false });
    if (evErr) throw evErr;
    return { ...(org as OrganiserWithEvents), events: (events ?? []).map(normaliseEvent) };
  }

  async listOrganiserSlugs(): Promise<string[]> {
    const { data, error } = await this.db.from('organisers').select('slug');
    if (error) throw error;
    return (data ?? []).map((r) => r.slug as string);
  }

  async listEventSlugs(): Promise<string[]> {
    const { data, error } = await this.db.from('events').select('slug').in('status', VISIBLE);
    if (error) throw error;
    return (data ?? []).map((r) => r.slug as string);
  }

  async submitEvent(input: SubmitEventInput): Promise<SubmitResult> {
    // Persisted as a draft event source for review (no auth required).
    const slug = `${draftSlug(input.title)}-${slugify(crypto.randomUUID().slice(0, 6))}`;
    const { error } = await this.db.from('event_sources').insert({
      kind: 'manual',
      url: input.ticket_url || null,
      raw_text: JSON.stringify(input),
    });
    if (error) throw error;
    return { ok: true, slug };
  }

  async subscribe(input: SubscribeInput): Promise<SubscribeResult> {
    const { error } = await this.db
      .from('subscribers')
      .upsert(
        { email: input.email, city: input.city ?? null, interests: input.interests },
        { onConflict: 'email' },
      );
    if (error) throw error;
    return { ok: true };
  }
}

/** Supabase returns embedded relations as arrays/objects; normalise to the VM. */
function normaliseEvent(row: Record<string, unknown>): EventWithRelations {
  const organiser = pickOne(row.organiser);
  const venue = pickOne(row.venue);
  return {
    ...(row as unknown as EventWithRelations),
    organiser: organiser as EventWithRelations['organiser'],
    venue: (venue as EventWithRelations['venue']) ?? null,
    ticketTypes: (row.ticketTypes as EventWithRelations['ticketTypes']) ?? [],
  };
}

function pickOne(value: unknown): unknown {
  return Array.isArray(value) ? value[0] : value;
}

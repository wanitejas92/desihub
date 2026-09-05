import {
  isThisWeek,
  isThisWeekend,
  cityCounts,
  type SubmitEventInput,
  type SubscribeInput,
} from '@desihub/shared';
import type { SupabaseClient } from '@supabase/supabase-js';
import { describeDbError, logDbError, SubmitEventError } from './errors';
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
  ticketTypes:ticket_types(id,name,price_cents,quantity,sold,fee_mode,min_per_order,max_per_order),
  booking:booking_configurations(event_id,booking_type,provider,booking_url,external_event_id,status,metadata)
`;

const VISIBLE = ['published', 'sold_out', 'cancelled'];

/** Supabase-backed repository. RLS keeps anonymous reads to visible events. */
export class SupabaseEventRepository implements EventRepository {
  constructor(private readonly db: SupabaseClient) {}

  async listEvents(filters: EventFilters): Promise<Paginated<EventWithRelations>> {
    /*
     * A city filter needs `venues` inner-joined: PostgREST only lets a query
     * filter on an embedded resource's column (`venue.city`) when that embed
     * is `!inner`, and an inner join is the right semantics anyway — an
     * event with no venue can never match a city filter. Doing this in SQL
     * (rather than fetching everything and filtering city in JS afterwards)
     * matters because `count: 'exact'` and `.range()` are both computed by
     * Postgres from the query as sent — a JS-only city filter would leave
     * the reported total, and any future pagination, describing the
     * *unfiltered* set instead of the city the visitor actually picked.
     */
    const select = filters.city
      ? EVENT_SELECT.replace('venue:venues(', 'venue:venues!inner(')
      : EVENT_SELECT;
    let q = this.db.from('events').select(select, { count: 'exact' }).in('status', VISIBLE);

    if (filters.city) q = q.eq('venue.city', filters.city);
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
    // `select` is a computed string (not the `EVENT_SELECT` literal), so
    // supabase-js can't infer a precise row type for it the way it does for
    // every other call below — cast back to the shape `normaliseEvent` expects.
    const items = ((data ?? []) as unknown as Record<string, unknown>[]).map(normaliseEvent);
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

  async followerCount(organiserId: string): Promise<number> {
    const { count, error } = await this.db
      .from('follows')
      .select('user_id', { count: 'exact', head: true })
      .eq('organiser_id', organiserId);
    if (error) return 0;
    return count ?? 0;
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

  async listFeaturedOrganizers(limit = 6): Promise<OrganiserSummary[]> {
    // Organizers with the most published events (only published count).
    // Fetch all with their published event counts, then sort in JS since
    // Supabase's count aggregate doesn't support order-by directly.
    const { data: organisers, error } = await this.db
      .from('organisers')
      .select('id,name,slug,verified,city,logo_url');

    if (error) throw error;
    if (!organisers || organisers.length === 0) return [];

    // Get event counts for each organizer
    const { data: counts, error: countErr } = await this.db
      .from('events')
      .select('organiser_id,id')
      .eq('status', 'published');

    if (countErr) throw countErr;

    const eventCountByOrganizer = new Map<string, number>();
    (counts ?? []).forEach((row) => {
      const id = row.organiser_id as string;
      eventCountByOrganizer.set(id, (eventCountByOrganizer.get(id) ?? 0) + 1);
    });

    // Sort by event count (descending) and take the top ones
    const sorted = organisers
      .map((r) => ({
        id: r.id,
        name: r.name,
        slug: r.slug,
        verified: r.verified,
        city: r.city as OrganiserSummary['city'],
        logo_url: r.logo_url,
        eventCount: eventCountByOrganizer.get(r.id) ?? 0,
      }))
      .filter((r) => r.eventCount > 0)
      .sort((a, b) => b.eventCount - a.eventCount)
      .slice(0, limit);

    return sorted.map(({ eventCount: _eventCount, ...r }) => r);
  }

  /**
   * One RPC, because a public submission cannot be done from the client side
   * at all.
   *
   * What was here before ran four statements as the caller: insert
   * `event_sources`, find-or-create the organiser, create the venue, insert
   * the event. For the visitors this form is actually for — logged out, no
   * account, exactly as the page advertises — every one of those is refused
   * by RLS, and the first one threw:
   *
   *   new row violates row-level security policy for table "event_sources"
   *
   * `submit_public_event` (0014) does the whole thing inside the database as
   * one SECURITY DEFINER transaction, so a submission is atomic: either the
   * event, its organiser, its venue and its provenance row all exist, or none
   * of them do. There is no longer a half-submitted state where provenance
   * was written but the event was not.
   */
  async submitEvent(input: SubmitEventInput): Promise<SubmitResult> {
    const { data, error } = await this.db.rpc('submit_public_event', {
      p_title: input.title,
      p_starts_at: input.starts_at,
      p_city: input.city,
      p_organiser_name: input.organiser_name,
      p_description: input.description ?? null,
      p_highlights: input.highlights ?? null,
      p_terms: input.terms ?? null,
      // No `?? 'community'` here: that is not a member of event_category, so
      // it failed every submission that left the category blank. The
      // function's own default ('cultural') applies when this is null.
      p_category: input.category ?? null,
      p_venue_name: input.venue_name ?? null,
      p_contact_email: input.contact_email || null,
      p_image_url: input.image_url || null,
      p_entry_type: input.entry_type ?? 'free',
      p_min_price_cents: input.min_price_cents ?? null,
      p_max_price_cents: input.max_price_cents ?? null,
      p_booking_url: input.booking_url || input.ticket_url || null,
    });

    if (error) {
      logDbError('submitEvent', error);
      throw new SubmitEventError(describeDbError(error, 'event'), error);
    }
    if (typeof data !== 'string' || data.length === 0) {
      throw new SubmitEventError(
        'The database accepted the submission but returned no event link. Please check the review queue before resubmitting.',
        null,
      );
    }

    return { ok: true, slug: data };
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
    // A 1:1 embed still arrives as an array. Null when unconfigured — the
    // booking service derives a default rather than the page branching.
    booking: (pickOne(row.booking) as EventWithRelations['booking']) ?? null,
  };
}

function pickOne(value: unknown): unknown {
  return Array.isArray(value) ? value[0] : value;
}

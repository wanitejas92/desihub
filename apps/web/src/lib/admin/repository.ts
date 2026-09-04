import { slugify } from '@desihub/shared';
import type { ProfileRole } from '@desihub/shared';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { AdminEventInput, AdminStats, AdminUserRow, ReviewEvent } from './types';

/**
 * Admin operations, run through the **caller's own** Supabase session rather
 * than the service-role key. That is deliberate: every statement here is
 * still checked by RLS, so `requireAdmin()` failing open would not hand
 * anyone write access — `is_admin()` in Postgres would still refuse. The
 * service-role client stays reserved for the two callers that genuinely have
 * no user session (the Stripe webhook and guest order lookup).
 */
export class AdminRepository {
  constructor(private readonly db: SupabaseClient) {}

  async stats(): Promise<AdminStats> {
    const [pending, published, organisers, users] = await Promise.all([
      this.db.from('events').select('id', { count: 'exact', head: true }).eq('status', 'draft'),
      this.db.from('events').select('id', { count: 'exact', head: true }).eq('status', 'published'),
      this.db.from('organisers').select('id', { count: 'exact', head: true }),
      this.db.from('profiles').select('id', { count: 'exact', head: true }),
    ]);
    return {
      pending: pending.count ?? 0,
      published: published.count ?? 0,
      organisers: organisers.count ?? 0,
      users: users.count ?? 0,
    };
  }

  /** Oldest first: a submission should not rot behind newer ones. */
  async listByStatus(status: string, limit = 50): Promise<ReviewEvent[]> {
    const { data, error } = await this.db
      .from('events')
      .select(
        `id,slug,title,description,category,image_url,starts_at,created_at,status,review_note,
         organiser:organisers!inner(name,slug,verified),
         venue:venues(name,city)`,
      )
      .eq('status', status)
      .order('created_at', { ascending: true })
      .limit(limit);
    if (error) throw error;
    return (data ?? []).map(toReviewEvent);
  }

  async approve(eventId: string, reviewerId: string): Promise<void> {
    // The publish itself also fires `promote_organiser_on_publish` (0008),
    // which lifts the organiser's owner from attendee to organiser.
    const { error } = await this.db
      .from('events')
      .update({
        status: 'published',
        review_note: null,
        reviewed_at: new Date().toISOString(),
        reviewed_by: reviewerId,
      })
      .eq('id', eventId);
    if (error) throw error;
  }

  async reject(eventId: string, reviewerId: string, note: string): Promise<void> {
    const { error } = await this.db
      .from('events')
      .update({
        status: 'rejected',
        review_note: note,
        reviewed_at: new Date().toISOString(),
        reviewed_by: reviewerId,
      })
      .eq('id', eventId);
    if (error) throw error;
  }

  /** Puts a rejected or cancelled event back in the queue. */
  async returnToQueue(eventId: string): Promise<void> {
    const { error } = await this.db
      .from('events')
      .update({ status: 'draft', review_note: null, reviewed_at: null, reviewed_by: null })
      .eq('id', eventId);
    if (error) throw error;
  }

  async listUsers(limit = 100): Promise<AdminUserRow[]> {
    const { data, error } = await this.db
      .from('profiles')
      .select('id,email,name,city,role,created_at')
      .order('created_at', { ascending: false })
      .limit(limit);
    if (error) throw error;
    const rows = data ?? [];
    if (rows.length === 0) return [];

    // One extra round trip for the published-event count per user, rather than
    // N. Organisers are keyed by owner, so the join is owner → organiser →
    // event and is folded up here instead of in SQL.
    const { data: orgs } = await this.db
      .from('organisers')
      .select('id,owner_id,events(id,status)')
      .in(
        'owner_id',
        rows.map((r) => r.id),
      );

    const counts = new Map<string, number>();
    for (const org of orgs ?? []) {
      const ownerId = org.owner_id as string | null;
      if (!ownerId) continue;
      const events = (org.events ?? []) as { status: string }[];
      const published = events.filter((e) => e.status === 'published').length;
      counts.set(ownerId, (counts.get(ownerId) ?? 0) + published);
    }

    return rows.map((r) => ({
      id: r.id as string,
      email: (r.email as string | null) ?? null,
      name: (r.name as string | null) ?? null,
      city: (r.city as string | null) ?? null,
      role: r.role as ProfileRole,
      created_at: r.created_at as string,
      published_events: counts.get(r.id as string) ?? 0,
    }));
  }

  async setRole(userId: string, role: ProfileRole): Promise<void> {
    const { error } = await this.db.from('profiles').update({ role }).eq('id', userId);
    if (error) throw error;
  }

  /**
   * Admin fast path: one form, straight to published. An organiser is reused
   * by slug or created on the spot, so the admin never has to set one up
   * first — which is the whole point of this path existing.
   */
  async createPublishedEvent(input: AdminEventInput, adminId: string): Promise<string> {
    const organiserSlug = slugify(input.organiser_name);
    let organiserId: string;

    const { data: existingOrg } = await this.db
      .from('organisers')
      .select('id')
      .eq('slug', organiserSlug)
      .maybeSingle();

    if (existingOrg) {
      organiserId = existingOrg.id as string;
    } else {
      const { data: created, error: orgErr } = await this.db
        .from('organisers')
        .insert({
          name: input.organiser_name,
          slug: organiserSlug,
          city: input.city,
          // Admin-created organisers are unowned until the real organiser
          // claims the page; `verified` because an admin vouched for it.
          owner_id: null,
          verified: true,
        })
        .select('id')
        .single();
      if (orgErr) throw orgErr;
      organiserId = created.id as string;
    }

    let venueId: string | null = null;
    if (input.venue_name) {
      const { data: venue, error: venueErr } = await this.db
        .from('venues')
        .insert({ name: input.venue_name, city: input.city })
        .select('id')
        .single();
      if (venueErr) throw venueErr;
      venueId = venue.id as string;
    }

    // Slug collisions are possible across organisers ("diwali-night" twice),
    // so a short random suffix keeps the unique index happy without asking
    // the admin to invent one.
    const slug = `${slugify(input.title)}-${crypto.randomUUID().slice(0, 6)}`;

    const { data: event, error } = await this.db
      .from('events')
      .insert({
        organiser_id: organiserId,
        venue_id: venueId,
        title: input.title,
        slug,
        description: input.description,
        category: input.category,
        image_url: input.image_url,
        poster_image_url: input.poster_image_url,
        starts_at: input.starts_at,
        ends_at: input.ends_at,
        is_free: input.is_free,
        min_price_cents: input.min_price_cents,
        max_price_cents: input.min_price_cents,
        external_ticket_url: input.booking_url,
        // An admin creating an event *is* the review, so it goes live now.
        status: 'published',
        featured: input.featured,
        reviewed_at: new Date().toISOString(),
        reviewed_by: adminId,
      })
      .select('slug')
      .single();
    if (error) throw error;
    return event.slug as string;
  }
}

function toReviewEvent(row: Record<string, unknown>): ReviewEvent {
  const organiser = pickOne(row.organiser) as Record<string, unknown> | undefined;
  const venue = pickOne(row.venue) as Record<string, unknown> | undefined;
  return {
    id: row.id as string,
    slug: row.slug as string,
    title: row.title as string,
    description: (row.description as string | null) ?? null,
    category: row.category as string,
    image_url: (row.image_url as string | null) ?? null,
    starts_at: row.starts_at as string,
    created_at: row.created_at as string,
    status: row.status as ReviewEvent['status'],
    review_note: (row.review_note as string | null) ?? null,
    city: (venue?.city as string | null) ?? null,
    venue_name: (venue?.name as string | null) ?? null,
    organiser_name: (organiser?.name as string) ?? 'Unknown',
    organiser_slug: (organiser?.slug as string) ?? '',
    organiser_verified: Boolean(organiser?.verified),
  };
}

function pickOne(value: unknown): unknown {
  return Array.isArray(value) ? value[0] : value;
}

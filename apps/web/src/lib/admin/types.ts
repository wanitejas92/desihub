import type { City, EventStatus, ProfileRole } from '@desihub/shared';

/** A row in the moderation queue — just enough to decide without opening it. */
export interface ReviewEvent {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  category: string;
  image_url: string | null;
  starts_at: string;
  created_at: string;
  status: EventStatus;
  review_note: string | null;
  city: string | null;
  venue_name: string | null;
  organiser_name: string;
  organiser_slug: string;
  organiser_verified: boolean;
}

export interface AdminUserRow {
  id: string;
  email: string | null;
  name: string | null;
  city: string | null;
  role: ProfileRole;
  created_at: string;
  /** Published events across every organiser this user owns. */
  published_events: number;
}

export interface AdminStats {
  pending: number;
  published: number;
  organisers: number;
  users: number;
}

/**
 * What an admin fills in to put an event straight on the site. Deliberately
 * the shortest path that still produces a complete listing: everything not
 * asked for is either derived or left null.
 */
export interface AdminEventInput {
  title: string;
  starts_at: string;
  ends_at: string | null;
  city: City;
  category: string;
  venue_name: string | null;
  organiser_name: string;
  description: string | null;
  image_url: string | null;
  poster_image_url: string | null;
  is_free: boolean;
  min_price_cents: number | null;
  booking_url: string | null;
  featured: boolean;
}

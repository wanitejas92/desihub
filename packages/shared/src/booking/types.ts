/**
 * Booking is deliberately a separate concern from the event itself.
 *
 * An event answers WHAT / WHEN / WHERE. How you get in — and, crucially, on
 * whose website you get in — changes independently: the same Diwali night can
 * be free this year, ticketed on the organiser's own site next year, and sold
 * through DesiHub the year after. Baking any of that into the event record (or
 * into the event page) means rewriting both every time a new channel appears.
 *
 * So: `Event` carries the entry economics (`entry_type`, price range) and a
 * separate `BookingConfiguration` carries the channel. The event detail page
 * never reads either directly — it asks the booking service for a
 * `BookingOption` and renders that.
 */

/**
 * How you get in. This is about money and admission, not about which website
 * handles it — a paid event might be booked externally today and natively
 * tomorrow without this value changing.
 */
export const ENTRY_TYPES = ['free', 'registration', 'paid', 'door'] as const;
export type EntryType = (typeof ENTRY_TYPES)[number];

export const ENTRY_TYPE_LABELS: Record<EntryType, string> = {
  free: 'Free — no registration',
  registration: 'Free — registration required',
  paid: 'Paid',
  door: 'Pay at the door',
};

/**
 * Where booking happens. `desihub` and `external_api` are defined here but not
 * enabled by default (see `isBookingTypeEnabled`) — the shape exists so
 * adding them later is a config change, not a schema migration plus a page
 * rewrite.
 */
export const BOOKING_TYPES = [
  /** Nothing to book: turn up, or the event is informational. */
  'none',
  /** Free but the organiser wants names — a form, on their site or ours. */
  'free_registration',
  /** MVP default: we hand the visitor to the organiser's booking page. */
  'external_url',
  /** DesiHub's own checkout (built, gated off by default). */
  'desihub',
  /** A ticketing partner's API — Eventbrite and friends. Not yet built. */
  'external_api',
] as const;
export type BookingType = (typeof BOOKING_TYPES)[number];

/** Whether the channel is currently taking bookings. */
export const BOOKING_STATUSES = ['available', 'sold_out', 'closed', 'not_open_yet'] as const;
export type BookingStatus = (typeof BOOKING_STATUSES)[number];

export interface BookingConfiguration {
  event_id: string;
  booking_type: BookingType;
  /**
   * Which concrete provider handles it. For `external_url` this is a label for
   * the destination ("Eventbrite", "the organiser's website") shown in the
   * leaving-DesiHub confirmation; for API types it selects the adapter.
   */
  provider: string | null;
  booking_url: string | null;
  /** The partner's own id for this event, once API providers exist. */
  external_event_id: string | null;
  status: BookingStatus;
  /** Provider-specific extras. Nothing in the page may read this directly. */
  metadata: Record<string, unknown>;
}

/**
 * What the page renders. Every provider produces one of these, so the booking
 * card is a pure function of the option and knows nothing about channels.
 */
export interface BookingOption {
  /** Small label above the price — "Tickets from", "Free entry", "At the door". */
  label: string;
  /** The headline money line: "€15 – €35", "FREE", "€10". Empty to hide. */
  priceLine: string;
  cta: BookingCta;
  /** One line under the button, e.g. the redirect disclosure. */
  note?: string;
  /** Compact wording for the mobile sticky bar, which has one line of room. */
  compactLabel: string;
  /** False when nothing can be booked — sold out, closed, or nothing set up. */
  available: boolean;
  /** Which provider produced this, for debugging and analytics. */
  providerId: string;
}

export type BookingCta =
  /** Leaves DesiHub. The UI must confirm before navigating. */
  | { kind: 'external'; label: string; url: string; destination: string }
  /** Stays on DesiHub — our own checkout or registration route. */
  | { kind: 'internal'; label: string; href: string }
  /** No booking step at all; offer the calendar instead. */
  | { kind: 'calendar'; label: string }
  /** Nothing to click: sold out, cancelled, or not configured. */
  | { kind: 'disabled'; label: string };

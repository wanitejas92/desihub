import { z } from 'zod';
import {
  EVENT_CATEGORIES,
  EVENT_STATUSES,
  ORDER_STATUSES,
  TICKET_STATUSES,
  FEE_MODES,
  PROFILE_ROLES,
  MEAL_CHOICES,
  CITIES,
  EVENT_LANGUAGES,
} from './constants';
import { BOOKING_STATUSES, BOOKING_TYPES, ENTRY_TYPES } from './booking/types';
import { slugify } from './slug';

/**
 * Zod schemas mirror the Postgres tables and are the single runtime contract
 * shared by web, mobile and any import/validation code. DB row shapes use
 * snake_case to match Postgres; the app layer can map to camelCase if desired.
 */

export const uuid = z.string().uuid();
const isoDate = z.string().datetime({ offset: true });
const nonNegInt = z.number().int().nonnegative();

export const cityEnum = z.enum(CITIES);
export const categoryEnum = z.enum(EVENT_CATEGORIES);
export const eventStatusEnum = z.enum(EVENT_STATUSES);
export const languageEnum = z.enum(EVENT_LANGUAGES);

export const profileSchema = z.object({
  id: uuid,
  name: z.string().min(1).max(120).nullable(),
  phone: z.string().max(32).nullable(),
  email: z.string().email().nullable(),
  city: cityEnum.nullable(),
  languages: z.array(z.string()).default([]),
  notification_prefs: z
    .object({
      push: z.boolean().default(true),
      email: z.boolean().default(true),
      whatsapp: z.boolean().default(false),
    })
    .default({ push: true, email: true, whatsapp: false }),
  role: z.enum(PROFILE_ROLES).default('attendee'),
  created_at: isoDate,
});
export type Profile = z.infer<typeof profileSchema>;

export const organiserSchema = z.object({
  id: uuid,
  name: z.string().min(1).max(160),
  slug: z.string().min(1).max(80),
  logo_url: z.string().url().nullable(),
  bio: z.string().max(2000).nullable(),
  city: cityEnum.nullable(),
  verified: z.boolean().default(false),
  contact_email: z.string().email().nullable(),
  payout_details: z.record(z.unknown()).nullable(),
  socials: z
    .object({
      instagram: z.string().url().optional(),
      facebook: z.string().url().optional(),
      website: z.string().url().optional(),
      whatsapp_channel: z.string().url().optional(),
    })
    .partial()
    .default({}),
  created_at: isoDate,
});
export type Organiser = z.infer<typeof organiserSchema>;

export const venueSchema = z.object({
  id: uuid,
  name: z.string().min(1).max(160),
  address: z.string().max(300).nullable(),
  city: cityEnum,
  lat: z.number().min(-90).max(90).nullable(),
  lng: z.number().min(-180).max(180).nullable(),
  capacity: nonNegInt.nullable(),
  accessibility_notes: z.string().max(1000).nullable(),
});
export type Venue = z.infer<typeof venueSchema>;

export const eventSchema = z.object({
  id: uuid,
  organiser_id: uuid,
  venue_id: uuid.nullable(),
  title: z.string().min(1).max(200),
  slug: z.string().min(1).max(80),
  description: z.string().max(8000).nullable(),
  category: categoryEnum,
  sub_category: z.string().max(80).nullable(),
  image_url: z.string().url().nullable(),
  gallery: z.array(z.string().url()).max(10).default([]),
  starts_at: isoDate,
  ends_at: isoDate.nullable(),
  doors_at: isoDate.nullable(),
  is_free: z.boolean().default(false),
  /**
   * How you get in. `is_free` stays as the denormalised flag every filter and
   * card already reads; `entry_type` is the richer answer the booking layer
   * needs (a free event that still requires registration is not the same as
   * one you can just turn up to).
   */
  entry_type: z.enum(ENTRY_TYPES).default('paid'),
  min_price_cents: nonNegInt.nullable(),
  max_price_cents: nonNegInt.nullable(),
  currency: z.string().length(3).default('EUR'),
  languages: z.array(languageEnum).default([]),
  age_policy: z.string().max(80).nullable(),
  dress_code: z.string().max(120).nullable().default(null),
  /**
   * The performers. A lightweight embedded list, not an entity: DesiHub has no
   * artist profiles yet, and inventing a table we cannot populate would give
   * every event page a set of dead links. Promoting this to a real `artists`
   * table later only changes what fills the array.
   */
  lineup: z
    .array(
      z.object({
        name: z.string().min(1).max(120),
        role: z.string().max(80).nullable().default(null),
        image_url: z.string().url().nullable().default(null),
      }),
    )
    .max(20)
    .default([]),
  /** @deprecated Superseded by `booking_configurations.booking_url`. */
  external_ticket_url: z.string().url().nullable(),
  status: eventStatusEnum.default('draft'),
  featured: z.boolean().default(false),
  family_friendly: z.boolean().default(false),
  tags: z.array(z.string().max(40)).default([]),
  seo_title: z.string().max(160).nullable(),
  seo_description: z.string().max(320).nullable(),
  created_at: isoDate,
});
export type Event = z.infer<typeof eventSchema>;

/**
 * Booking lives in its own table, one row per event. Kept separate from
 * `events` so switching an organiser from their own booking page to DesiHub
 * ticketing is an update to this row and nothing else — no event migration, no
 * change to the detail page.
 */
export const bookingConfigurationSchema = z.object({
  event_id: uuid,
  booking_type: z.enum(BOOKING_TYPES).default('none'),
  provider: z.string().max(80).nullable().default(null),
  booking_url: z.string().url().nullable().default(null),
  external_event_id: z.string().max(160).nullable().default(null),
  status: z.enum(BOOKING_STATUSES).default('available'),
  metadata: z.record(z.unknown()).default({}),
});

export const ticketTypeSchema = z
  .object({
    id: uuid,
    event_id: uuid,
    name: z.string().min(1).max(120),
    description: z.string().max(1000).nullable(),
    price_cents: nonNegInt,
    fee_mode: z.enum(FEE_MODES).default('pass_on'),
    quantity: nonNegInt,
    sold: nonNegInt.default(0),
    min_per_order: z.number().int().min(1).default(1),
    max_per_order: z.number().int().min(1).default(10),
    sales_start: isoDate.nullable(),
    sales_end: isoDate.nullable(),
    is_group: z.boolean().default(false),
    group_size: z.number().int().min(1).nullable(),
    meal_option_required: z.boolean().default(false),
  })
  .refine((t) => t.sold <= t.quantity, {
    message: 'sold cannot exceed quantity',
    path: ['sold'],
  })
  .refine((t) => t.max_per_order >= t.min_per_order, {
    message: 'max_per_order must be >= min_per_order',
    path: ['max_per_order'],
  });
export type TicketType = z.infer<typeof ticketTypeSchema>;

export const orderSchema = z.object({
  id: uuid,
  user_id: uuid.nullable(),
  event_id: uuid,
  status: z.enum(ORDER_STATUSES).default('pending'),
  subtotal_cents: nonNegInt,
  fees_cents: nonNegInt,
  total_cents: nonNegInt,
  payment_method: z.string().max(40).nullable(),
  payment_ref: z.string().max(120).nullable(),
  buyer_email: z.string().email(),
  created_at: isoDate,
});
export type Order = z.infer<typeof orderSchema>;

export const ticketSchema = z.object({
  id: uuid,
  order_id: uuid,
  ticket_type_id: uuid,
  holder_name: z.string().max(120).nullable(),
  holder_email: z.string().email().nullable(),
  qr_token: z.string().min(16),
  status: z.enum(TICKET_STATUSES).default('valid'),
  checked_in_at: isoDate.nullable(),
  checked_in_by: uuid.nullable(),
  meal_choice: z.enum(MEAL_CHOICES).default('none'),
});
export type Ticket = z.infer<typeof ticketSchema>;

export const subscriberSchema = z.object({
  id: uuid,
  email: z.string().email(),
  city: cityEnum.nullable(),
  interests: z.array(categoryEnum).default([]),
  created_at: isoDate,
});
export type Subscriber = z.infer<typeof subscriberSchema>;

export const eventSourceSchema = z.object({
  id: uuid,
  event_id: uuid.nullable(),
  kind: z.enum(['facebook', 'instagram', 'eventbrite', 'manual', 'other']),
  url: z.string().url().nullable(),
  raw_text: z.string().nullable(),
  imported_by: uuid.nullable(),
  created_at: isoDate,
});
export type EventSource = z.infer<typeof eventSourceSchema>;

/* ------------------------------------------------------------------ */
/* Form / input schemas (Phase 1)                                      */
/* ------------------------------------------------------------------ */

/**
 * The `/submit` form: three required fields, everything else optional. No
 * login required. Produces a draft event for review.
 */
export const submitEventSchema = z
  .object({
    // Required (the three visible fields).
    title: z.string().trim().min(3, 'Give your event a title').max(200),
    starts_at: isoDate,
    city: cityEnum,
    // Optional.
    category: categoryEnum.optional(),
    venue_name: z.string().max(160).optional(),
    description: z.string().max(8000).optional(),
    organiser_name: z.string().max(160).optional(),
    contact_email: z.string().email('Enter a valid email').optional().or(z.literal('')),
    /** Poster/artwork, uploaded to Storage by the form before it submits. */
    image_url: z.string().url('Enter a valid image link').optional().or(z.literal('')),
    /**
     * How people attend, asked as one question with four answers rather than
     * as a ticket-type builder. Organisers who already sell somewhere else
     * just paste their link.
     */
    entry_type: z.enum(ENTRY_TYPES).default('free'),
    min_price_cents: nonNegInt.nullable().optional(),
    max_price_cents: nonNegInt.nullable().optional(),
    booking_url: z.string().url('Enter a valid link').optional().or(z.literal('')),
    /** @deprecated Old field name for `booking_url`; still accepted. */
    ticket_url: z.string().url('Enter a valid link').optional().or(z.literal('')),
    is_free: z.boolean().optional(),
  })
  .superRefine((v, ctx) => {
    if (v.entry_type === 'paid' && !v.booking_url && !v.ticket_url) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['booking_url'],
        message: 'Add the link where people buy tickets',
      });
    }
    if (
      v.min_price_cents != null &&
      v.max_price_cents != null &&
      v.max_price_cents < v.min_price_cents
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['max_price_cents'],
        message: 'Highest price must be at least the lowest price',
      });
    }
  });
export type SubmitEventInput = z.infer<typeof submitEventSchema>;

/** Email capture: city + interests, collected one field at a time. */
export const subscribeSchema = z.object({
  email: z.string().email('Enter a valid email'),
  city: cityEnum.optional(),
  interests: z.array(categoryEnum).max(12).default([]),
});
export type SubscribeInput = z.infer<typeof subscribeSchema>;

/**
 * Structured result of the admin import extractor. TEXT FIELDS ONLY — the
 * importer never copies images (copyright rule). image_url stays null and the
 * organiser must upload their own art or we render a fallback card.
 */
export const importExtractionSchema = z.object({
  title: z.string().nullable(),
  starts_at: isoDate.nullable(),
  ends_at: isoDate.nullable(),
  venue_name: z.string().nullable(),
  city: cityEnum.nullable(),
  category: categoryEnum.nullable(),
  min_price_cents: nonNegInt.nullable(),
  max_price_cents: nonNegInt.nullable(),
  is_free: z.boolean().nullable(),
  description: z.string().nullable(),
  source_url: z.string().url().nullable(),
  /** Confidence 0..1 per extracted field, for the review UI. */
  confidence: z.record(z.number().min(0).max(1)).default({}),
});
export type ImportExtraction = z.infer<typeof importExtractionSchema>;

/** Helper: build a draft Event slug from a title. */
export function draftSlug(title: string): string {
  return slugify(title);
}

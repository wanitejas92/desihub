/** Core domain vocabularies. Kept in sync with the Postgres enums in migrations. */

/** Event categories that must be first-class in DesiHub. */
export const EVENT_CATEGORIES = [
  'concert',
  'party',
  'garba_dandiya',
  'diwali',
  'holi',
  'temple',
  'cultural',
  'comedy',
  'food',
  'family',
  'workshop',
  'networking',
] as const;
export type EventCategory = (typeof EVENT_CATEGORIES)[number];

export const EVENT_CATEGORY_LABELS: Record<EventCategory, string> = {
  concert: 'Concert',
  party: 'Bollywood / Desi party',
  garba_dandiya: 'Garba & Dandiya',
  diwali: 'Diwali',
  holi: 'Holi',
  temple: 'Temple event',
  cultural: 'Cultural night',
  comedy: 'Comedy',
  food: 'Food festival',
  family: 'Kids & family',
  workshop: 'Workshop',
  networking: 'Networking',
};

export const EVENT_STATUSES = ['draft', 'published', 'cancelled', 'sold_out', 'rejected'] as const;
export type EventStatus = (typeof EVENT_STATUSES)[number];

/**
 * What the public may see. `draft` and `rejected` are the two statuses that
 * stay with the owning organiser and admins — the first because it has not
 * been reviewed yet, the second because it has and the answer was no.
 */
export const PUBLIC_EVENT_STATUSES = ['published', 'cancelled', 'sold_out'] as const;

export const ORDER_STATUSES = ['pending', 'paid', 'failed', 'refunded', 'cancelled'] as const;
export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const TICKET_STATUSES = ['valid', 'used', 'refunded', 'transferred'] as const;
export type TicketStatus = (typeof TICKET_STATUSES)[number];

export const FEE_MODES = ['absorb', 'pass_on'] as const;
export type FeeMode = (typeof FEE_MODES)[number];

export const PROFILE_ROLES = ['attendee', 'organiser', 'admin'] as const;
export type ProfileRole = (typeof PROFILE_ROLES)[number];

export const MEAL_CHOICES = ['veg', 'non_veg', 'jain', 'none'] as const;
export type MealChoice = (typeof MEAL_CHOICES)[number];

/** NL cities with meaningful South Asian communities (drives "near you"/filters). */
export const CITIES = [
  'Amsterdam',
  'Amstelveen',
  'Den Haag',
  'Utrecht',
  'Eindhoven',
  'Rotterdam',
  'Almere',
  'Tilburg',
  'Groningen',
  'Nijmegen',
] as const;
export type City = (typeof CITIES)[number];

/** UI languages we structure for from Phase 1 (only English filled initially). */
export const UI_LOCALES = ['en', 'nl', 'hi'] as const;
export type UiLocale = (typeof UI_LOCALES)[number];

/** Spoken/performance languages an event may be in. */
export const EVENT_LANGUAGES = [
  'English',
  'Hindi',
  'Dutch',
  'Punjabi',
  'Gujarati',
  'Tamil',
  'Telugu',
  'Bengali',
  'Marathi',
  'Urdu',
  'Nepali',
  'Sinhala',
  'Malayalam',
] as const;
export type EventLanguage = (typeof EVENT_LANGUAGES)[number];

export const DEFAULT_CURRENCY = 'EUR';
export const DEFAULT_TIMEZONE = 'Europe/Amsterdam';
export const DEFAULT_LOCALE_FOR_FORMATTING = 'en-NL';

/** Klarna / pay-in-3 becomes available above this order total (see brief). */
export const KLARNA_MIN_TOTAL_CENTS = 6000;

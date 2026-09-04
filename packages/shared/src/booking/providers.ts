import { formatMoney, formatPriceRange } from '../money';
import type { EventStatus } from '../constants';
import type { BookingConfiguration, BookingOption, BookingType, EntryType } from './types';

/**
 * The slice of an event a provider is allowed to see. Structural, not an
 * import of `EventWithRelations`: a provider must not start reaching into
 * venue, organiser or ticket-type detail, and this type is what stops it.
 */
export interface BookableEvent {
  slug: string;
  entry_type: EntryType;
  is_free: boolean;
  min_price_cents: number | null;
  max_price_cents: number | null;
  currency: string;
  /** Follows the event status enum, so a new status cannot silently bypass
   *  the checks in `service.ts` that read it. */
  status: EventStatus;
}

/**
 * One booking channel. Adding Eventbrite, or switching an organiser onto
 * DesiHub ticketing, means writing one of these and registering it — the
 * event page does not change.
 */
export interface BookingProvider {
  readonly id: string;
  /** Booking types this provider claims. */
  readonly handles: readonly BookingType[];
  getBookingOptions(event: BookableEvent, config: BookingConfiguration): BookingOption;
}

/* ------------------------------------------------------------------ */
/* Shared bits                                                         */
/* ------------------------------------------------------------------ */

function priceLineFor(event: BookableEvent): string {
  return formatPriceRange(
    event.min_price_cents,
    event.max_price_cents,
    event.is_free,
    event.currency,
  );
}

/** "Tickets from €15" vs "Tickets €15 – €35" — the label depends on the shape. */
function paidLabel(event: BookableEvent): string {
  const hasRange =
    event.max_price_cents !== null &&
    event.min_price_cents !== null &&
    event.max_price_cents > event.min_price_cents;
  if (event.min_price_cents === null) return 'Tickets';
  return hasRange ? 'Tickets' : 'Tickets from';
}

function unavailable(
  providerId: string,
  label: string,
  ctaLabel: string,
  priceLine = '',
): BookingOption {
  return {
    label,
    priceLine,
    cta: { kind: 'disabled', label: ctaLabel },
    compactLabel: label,
    available: false,
    providerId,
  };
}

/* ------------------------------------------------------------------ */
/* none — turn up, or nothing is configured                            */
/* ------------------------------------------------------------------ */

/**
 * Also the fallback when a configured channel is unavailable, so the page
 * always has something honest to render rather than an empty card.
 */
export const noBookingProvider: BookingProvider = {
  id: 'none',
  handles: ['none'],
  getBookingOptions(event) {
    if (event.entry_type === 'door') {
      const at =
        event.min_price_cents !== null ? formatMoney(event.min_price_cents, event.currency) : null;
      return {
        label: 'At the door',
        priceLine: at ? `${at} at the door` : 'Pay at the door',
        cta: { kind: 'calendar', label: 'Add to calendar' },
        note: 'Pay at the door on the night — no booking needed.',
        compactLabel: at ? `${at} at the door` : 'Pay at the door',
        available: true,
        providerId: 'none',
      };
    }
    if (event.entry_type === 'free' || event.is_free) {
      return {
        label: 'Free entry',
        priceLine: 'Free',
        cta: { kind: 'calendar', label: 'Add to calendar' },
        note: 'No ticket or registration needed — just turn up.',
        compactLabel: 'Free entry',
        available: true,
        providerId: 'none',
      };
    }
    // Paid, but no channel set up yet. Show the price, promise nothing.
    return unavailable('none', 'Tickets', 'Booking opens soon', priceLineFor(event));
  },
};

/* ------------------------------------------------------------------ */
/* free_registration                                                   */
/* ------------------------------------------------------------------ */

export const freeRegistrationProvider: BookingProvider = {
  id: 'free_registration',
  handles: ['free_registration'],
  getBookingOptions(_event, config) {
    if (config.status === 'sold_out') {
      return unavailable('free_registration', 'Fully booked', 'Join the waitlist', 'Free');
    }
    if (config.status === 'closed') {
      return unavailable('free_registration', 'Registration closed', 'Closed', 'Free');
    }
    if (!config.booking_url) {
      // Registration required but nowhere to do it — don't invent a link.
      return unavailable('free_registration', 'Free entry', 'Registration opens soon', 'Free');
    }
    return {
      label: 'Free entry',
      priceLine: 'Free',
      cta: {
        kind: 'external',
        label: 'Register',
        url: config.booking_url,
        destination: config.provider ?? "the organiser's website",
      },
      note: `Registration is handled by ${config.provider ?? 'the organiser'}.`,
      compactLabel: 'Free entry',
      available: true,
      providerId: 'free_registration',
    };
  },
};

/* ------------------------------------------------------------------ */
/* external_url — the MVP workhorse                                    */
/* ------------------------------------------------------------------ */

export const externalUrlProvider: BookingProvider = {
  id: 'external_url',
  handles: ['external_url'],
  getBookingOptions(event, config) {
    const price = priceLineFor(event);
    if (config.status === 'sold_out' || event.status === 'sold_out') {
      return unavailable('external_url', 'Sold out', 'Join the waitlist', price);
    }
    if (config.status === 'closed') {
      return unavailable('external_url', 'Sales closed', 'Sales closed', price);
    }
    if (config.status === 'not_open_yet') {
      return unavailable('external_url', paidLabel(event), 'On sale soon', price);
    }
    if (!config.booking_url) {
      return unavailable('external_url', paidLabel(event), 'Booking opens soon', price);
    }
    const destination = config.provider ?? "the organiser's website";
    return {
      label: paidLabel(event),
      priceLine: price,
      cta: { kind: 'external', label: 'Book now', url: config.booking_url, destination },
      // Said plainly and always: the visitor must never believe DesiHub is
      // taking their payment.
      note: `Booking and payment are handled by ${destination}.`,
      compactLabel: price === 'Free' ? 'Free entry' : `From ${price.split('–')[0]!.trim()}`,
      available: true,
      providerId: 'external_url',
    };
  },
};

/* ------------------------------------------------------------------ */
/* desihub — our own checkout. Built in Phase 3, gated off by default. */
/* ------------------------------------------------------------------ */

/**
 * Deliberately thin: it hands the visitor to `/e/<slug>/tickets`, our own
 * route, and the selector there owns inventory and pricing. The provider's job
 * is only to say "booking happens here", so this file stays free of ticket
 * types — the thing the brief explicitly does not want hard-coded.
 */
export const desihubProvider: BookingProvider = {
  id: 'desihub',
  handles: ['desihub'],
  getBookingOptions(event, config) {
    const price = priceLineFor(event);
    if (config.status === 'sold_out' || event.status === 'sold_out') {
      return unavailable('desihub', 'Sold out', 'Join the waitlist', price);
    }
    if (config.status !== 'available') {
      return unavailable('desihub', paidLabel(event), 'On sale soon', price);
    }
    return {
      label: paidLabel(event),
      priceLine: price,
      cta: { kind: 'internal', label: 'Get tickets', href: `/e/${event.slug}#tickets` },
      note: 'Booked securely on DesiHub.',
      compactLabel: price === 'Free' ? 'Free entry' : `From ${price.split('–')[0]!.trim()}`,
      available: true,
      providerId: 'desihub',
    };
  },
};

/**
 * Registry. Order is irrelevant — lookup is by booking type — but keeping the
 * MVP three first documents what actually ships today.
 */
export const BOOKING_PROVIDERS: readonly BookingProvider[] = [
  noBookingProvider,
  freeRegistrationProvider,
  externalUrlProvider,
  desihubProvider,
];

import {
  BOOKING_PROVIDERS,
  noBookingProvider,
  type BookableEvent,
  type BookingProvider,
} from './providers';
import type { BookingConfiguration, BookingOption, BookingType, EntryType } from './types';

/**
 * The one entry point the event detail page is allowed to use. It picks a
 * provider and returns what to render — nothing above it knows whether booking
 * happens on DesiHub, on the organiser's site, or through a partner API.
 */

/**
 * Channels enabled for the MVP. `desihub` (our Phase 3 checkout) and
 * `external_api` are implemented-or-planned but off, so a config row that
 * names one degrades gracefully instead of showing a dead button.
 *
 * Flipping DesiHub ticketing on for everyone is a one-line change here; doing
 * it for a single pilot organiser is a per-event config row plus this flag.
 */
const DEFAULT_ENABLED: readonly BookingType[] = ['none', 'free_registration', 'external_url'];

export function enabledBookingTypes(): readonly BookingType[] {
  // Read at call time, not module load: Next inlines NEXT_PUBLIC_* at build,
  // and tests flip it between cases.
  const nativeOn =
    process.env.NEXT_PUBLIC_DESIHUB_TICKETING === '1' || process.env.DESIHUB_TICKETING === '1';
  return nativeOn ? [...DEFAULT_ENABLED, 'desihub'] : DEFAULT_ENABLED;
}

export function isBookingTypeEnabled(type: BookingType): boolean {
  return enabledBookingTypes().includes(type);
}

/**
 * A config for an event that has none. Every event resolves to *something*, so
 * the page never has to branch on absence.
 */
export function defaultBookingConfiguration(
  eventId: string,
  entryType: EntryType,
): BookingConfiguration {
  return {
    event_id: eventId,
    booking_type: entryType === 'registration' ? 'free_registration' : 'none',
    provider: null,
    booking_url: null,
    external_event_id: null,
    status: 'available',
    metadata: {},
  };
}

function providerFor(type: BookingType): BookingProvider {
  return BOOKING_PROVIDERS.find((p) => p.handles.includes(type)) ?? noBookingProvider;
}

/**
 * Degrade a config whose channel isn't enabled. An organiser row saying
 * `desihub` while native ticketing is off still has a booking URL more often
 * than not — use it rather than showing nothing.
 */
function resolveType(config: BookingConfiguration): BookingType {
  if (isBookingTypeEnabled(config.booking_type)) return config.booking_type;
  if (config.booking_url) return 'external_url';
  return 'none';
}

export function getBookingOptions(
  event: BookableEvent & { id: string; booking?: BookingConfiguration | null },
): BookingOption {
  const config = event.booking ?? defaultBookingConfiguration(event.id, event.entry_type);

  // A cancelled event overrides every channel — nobody should be sent to a
  // payment page for something that isn't happening.
  if (event.status === 'cancelled') {
    return {
      label: 'Cancelled',
      priceLine: '',
      cta: { kind: 'disabled', label: 'Event cancelled' },
      note: 'This event has been cancelled by the organiser.',
      compactLabel: 'Cancelled',
      available: false,
      providerId: 'none',
    };
  }

  return providerFor(resolveType(config)).getBookingOptions(event, {
    ...config,
    booking_type: resolveType(config),
  });
}

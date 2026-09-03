import { EVENT_CATEGORY_LABELS } from '@desihub/shared';
import type { EventWithRelations } from '@/lib/data';

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://desihub.nl';

/**
 * Schema.org Event JSON-LD. People Google "dandiya Amsterdam 2026" — rich
 * results depend on this being complete and correct on every event page.
 */
export function eventJsonLd(event: EventWithRelations) {
  const offers =
    event.is_free || event.min_price_cents == null
      ? {
          '@type': 'Offer',
          price: '0',
          priceCurrency: event.currency,
          availability:
            event.status === 'sold_out'
              ? 'https://schema.org/SoldOut'
              : 'https://schema.org/InStock',
          url: `${SITE}/e/${event.slug}`,
        }
      : {
          '@type': 'AggregateOffer',
          lowPrice: (event.min_price_cents / 100).toFixed(2),
          highPrice: ((event.max_price_cents ?? event.min_price_cents) / 100).toFixed(2),
          priceCurrency: event.currency,
          availability:
            event.status === 'sold_out'
              ? 'https://schema.org/SoldOut'
              : 'https://schema.org/InStock',
          url: event.external_ticket_url ?? `${SITE}/e/${event.slug}`,
        };

  return {
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: event.title,
    description: event.description ?? EVENT_CATEGORY_LABELS[event.category],
    startDate: event.starts_at,
    endDate: event.ends_at ?? undefined,
    eventStatus:
      event.status === 'cancelled'
        ? 'https://schema.org/EventCancelled'
        : 'https://schema.org/EventScheduled',
    eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
    image: event.image_url ? [event.image_url] : undefined,
    location: event.venue
      ? {
          '@type': 'Place',
          name: event.venue.name,
          address: {
            '@type': 'PostalAddress',
            streetAddress: event.venue.address ?? undefined,
            addressLocality: event.venue.city,
            addressCountry: 'NL',
          },
          geo:
            event.venue.lat != null && event.venue.lng != null
              ? { '@type': 'GeoCoordinates', latitude: event.venue.lat, longitude: event.venue.lng }
              : undefined,
        }
      : undefined,
    organizer: {
      '@type': 'Organization',
      name: event.organiser.name,
      url: `${SITE}/o/${event.organiser.slug}`,
    },
    offers,
    inLanguage: event.languages,
    url: `${SITE}/e/${event.slug}`,
  };
}

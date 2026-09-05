import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import {
  formatEventDateNoYear,
  formatEventDateBadge,
  formatEventTime,
  getBookingOptions,
  eventHighlights,
  isSameLocalDay,
  formatEventDate,
  formatEventDateShort,
  EVENT_CATEGORY_LABELS,
} from '@desihub/shared';
import { getRepository } from '@/lib/data';
import { EventImage } from '@/components/event-image';
import { ShareButton } from '@/components/share-button';
import { FavouriteButton } from '@/components/favourite-button';
import { EventOrganiserCard } from '@/components/event/event-organiser-card';
import { VenueMap } from '@/components/event/venue-map';
import { EventRail } from '@/components/event-rail';
import { TicketSelector } from '@/components/ticket-selector';
import { BookingCard, BookingCta } from '@/components/event/booking-card';
import { EventDescription } from '@/components/event/event-description';
import {
  EventGallery,
  EventHighlights,
  EventInfoGrid,
  EventLineup,
  SectionHeading,
} from '@/components/event/event-sections';
import { IconMapPin, IconExternalLink } from '@/components/ui/icons';
import { eventJsonLd } from '@/lib/seo';

export const revalidate = 3600;

export async function generateStaticParams() {
  const repo = await getRepository();
  const slugs = await repo.listEventSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const repo = await getRepository();
  const event = await repo.getEventBySlug(slug);
  if (!event) return { title: 'Event not found' };
  const desc =
    event.seo_description ??
    event.description?.slice(0, 200) ??
    `${EVENT_CATEGORY_LABELS[event.category]} in ${event.venue?.city ?? 'the Netherlands'}.`;
  return {
    title: event.seo_title ?? event.title,
    description: desc,
    alternates: { canonical: `/e/${event.slug}` },
    openGraph: { title: event.title, description: desc, type: 'website' },
  };
}

export default async function EventPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const repo = await getRepository();
  const event = await repo.getEventBySlug(slug);
  if (!event) notFound();

  const [similar, followerCount] = await Promise.all([
    repo.similar(event, 8),
    repo.followerCount(event.organiser.id),
  ]);

  /*
    The one call this page makes about booking. Whether the visitor ends up on
    the organiser's site, in our own checkout, or with a calendar file is the
    booking service's decision — everything below just renders the answer.
  */
  const booking = getBookingOptions(event);
  const nativeTickets = booking.providerId === 'desihub' && event.ticketTypes.length > 0;

  const calendarEvent = {
    title: event.title,
    description: event.description ?? undefined,
    location: event.venue ? `${event.venue.name}, ${event.venue.city}` : undefined,
    startsAt: event.starts_at,
    endsAt: event.ends_at,
    url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://desihub.nl'}/e/${event.slug}`,
  };

  const timeLine = `${formatEventTime(event.starts_at)}${
    event.ends_at
      ? isSameLocalDay(event.starts_at, event.ends_at)
        ? `–${formatEventTime(event.ends_at)}`
        : ` – ${formatEventDateShort(event.ends_at)}, ${formatEventTime(event.ends_at)}`
      : ''
  }`;

  const dateBadge = formatEventDateBadge(event.starts_at);

  const infoRows = [
    { label: 'Date', value: formatEventDate(event.starts_at) },
    { label: 'Time', value: timeLine },
    { label: 'Venue', value: event.venue?.name ?? '' },
    { label: 'City', value: event.venue?.city ?? '' },
    { label: 'Category', value: EVENT_CATEGORY_LABELS[event.category] },
    { label: 'Language', value: event.languages.join(', ') },
    { label: 'Age limit', value: event.age_policy ?? '' },
    { label: 'Dress code', value: event.dress_code ?? '' },
  ];

  const mapsQuery = event.venue
    ? encodeURIComponent(
        [event.venue.name, event.venue.address, event.venue.city].filter(Boolean).join(', '),
      )
    : '';

  return (
    <article className="pb-28">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(eventJsonLd(event)) }}
      />

      <div className="max-w-content mx-auto grid gap-8 px-4 py-6 sm:px-6 lg:grid-cols-[340px_minmax(0,1fr)] lg:gap-10 lg:py-10">
        {/* ---------------------------------------------------------------- */}
        {/* Left — poster, organiser, map                                    */}
        {/* ---------------------------------------------------------------- */}
        <aside className="space-y-5">
          <div className="bg-bg-subtle border-border relative aspect-[3/4] w-full overflow-hidden rounded-2xl border">
            <EventImage
              imageUrl={event.poster_image_url ?? event.image_url}
              title={event.title}
              category={event.category}
              startsAt={event.starts_at}
              organiserName={event.organiser.name}
              priority
              sizes="(max-width: 1024px) 100vw, 340px"
              fallbackWidth={800}
              fallbackHeight={1000}
            />
            <FavouriteButton eventId={event.id} className="absolute top-3 right-3" />
          </div>

          <EventOrganiserCard
            id={event.organiser.id}
            name={event.organiser.name}
            slug={event.organiser.slug}
            verified={event.organiser.verified}
            logoUrl={event.organiser.logo_url}
            followerCount={followerCount}
          />

          {event.venue && (
            <VenueMap
              name={event.venue.name}
              address={event.venue.address}
              city={event.venue.city}
              lat={event.venue.lat}
              lng={event.venue.lng}
            />
          )}
        </aside>

        {/* ---------------------------------------------------------------- */}
        {/* Right — title, date, venue, booking, about                       */}
        {/* ---------------------------------------------------------------- */}
        <div className="space-y-6">
          <h1 className="font-display text-fg text-2xl leading-[1.15] font-bold tracking-tight text-balance sm:text-3xl">
            {event.title}
          </h1>

          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="border-border flex w-14 shrink-0 flex-col items-center rounded-lg border py-1.5">
                <span className="text-accent-pink text-[10px] font-bold tracking-wider">
                  {dateBadge.month}
                </span>
                <span className="text-fg text-lg leading-none font-bold">{dateBadge.day}</span>
              </div>
              <div>
                <p className="text-fg font-semibold">{formatEventDateNoYear(event.starts_at)}</p>
                <p className="text-fg-muted text-sm">{timeLine}</p>
              </div>
            </div>
            <ShareButton title={event.title} path={`/e/${event.slug}`} />
          </div>

          {event.venue && (
            <div className="border-border/70 flex items-start gap-3 border-t border-b py-5">
              <span className="border-border text-fg-muted flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border">
                <IconMapPin width={18} height={18} />
              </span>
              <div className="min-w-0">
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${mapsQuery}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-fg hover:text-accent inline-flex items-center gap-1.5 font-semibold"
                >
                  {event.venue.name}
                  <IconExternalLink width={13} height={13} />
                </a>
                <p className="text-fg-muted mt-0.5 text-sm">
                  {[event.venue.address, event.venue.city].filter(Boolean).join(', ')}
                </p>
              </div>
            </div>
          )}

          <BookingCard option={booking} calendarEvent={calendarEvent}>
            {nativeTickets && (
              <div id="tickets" className="border-border/70 mt-5 scroll-mt-24 border-t pt-5">
                <TicketSelector event={event} />
              </div>
            )}
          </BookingCard>

          {event.description && (
            <section>
              <SectionHeading>About Event</SectionHeading>
              <div className="mt-4">
                <EventDescription text={event.description} />
              </div>
            </section>
          )}

          <EventHighlights highlights={eventHighlights(event.category)} />
          <EventLineup lineup={event.lineup} />
          <EventInfoGrid rows={infoRows} />
          <EventGallery images={event.gallery} title={event.title} />
        </div>
      </div>

      {similar.length > 0 && (
        <div className="border-border/70 border-t pt-4">
          <EventRail title="You may also like" events={similar} />
        </div>
      )}

      {/*
        Persistent price/booking bar, visible on every screen size — the
        primary call to action lives here, matching how the reference design
        keeps price and "Book now" pinned regardless of scroll position.
      */}
      <div className="border-border bg-bg/95 fixed inset-x-0 bottom-0 z-30 flex items-center justify-between gap-4 border-t px-4 py-3 backdrop-blur sm:px-6">
        <div className="min-w-0">
          <p className="text-fg-subtle text-xs">{booking.label}</p>
          <p className="font-display text-fg truncate text-lg font-semibold">
            {booking.priceLine || booking.compactLabel}
          </p>
        </div>
        <div className="shrink-0">
          <BookingCta option={booking} calendarEvent={calendarEvent} compact />
        </div>
      </div>
    </article>
  );
}

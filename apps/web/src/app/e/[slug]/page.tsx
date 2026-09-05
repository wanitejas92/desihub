import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import {
  formatEventDateNoYear,
  formatEventDateBadge,
  formatEventTime,
  getBookingOptions,
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
import { StickyBookingBar } from '@/components/event/sticky-booking-bar';
import { EventDescription } from '@/components/event/event-description';
import {
  EventGallery,
  EventHighlights,
  EventInfoGrid,
  EventLineup,
  EventTerms,
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
            // Desktop only — the venue address just above already links out
            // to Google Maps, so an embedded map on mobile is a second, more
            // expensive way to do the same thing on a screen with less room.
            <div className="hidden sm:block">
              <VenueMap
                name={event.venue.name}
                address={event.venue.address}
                city={event.venue.city}
                lat={event.venue.lat}
                lng={event.venue.lng}
              />
            </div>
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

          {/*
            Price and the primary CTA live only in the sticky bottom bar now
            — this used to repeat both in a full card here too, which just
            showed the same price and button twice on screen at once. The
            ticket selector is real, necessary UI (not decorative), so it
            still gets its own spot when native tickets are in play.
          */}
          {nativeTickets && (
            <div id="tickets" className="scroll-mt-24">
              <TicketSelector event={event} />
            </div>
          )}

          {event.description && (
            <section>
              <SectionHeading>About Event</SectionHeading>
              <div className="mt-4">
                <EventDescription text={event.description} />
              </div>
            </section>
          )}

          {/*
            The facts a visitor actually decides on — date, time, venue,
            language, age policy — right after the description, before the
            more decorative sections below it. Burying them under Highlights
            and the gallery meant scrolling past photos to find them.
          */}
          <EventInfoGrid rows={infoRows} />
          <EventHighlights highlights={event.highlights} />
          <EventLineup lineup={event.lineup} />
          <EventGallery images={event.gallery} title={event.title} />
          <EventTerms terms={event.terms} />
        </div>
      </div>

      {similar.length > 0 && (
        <div className="border-border/70 border-t pt-4">
          <EventRail title="You may also like" events={similar} />
        </div>
      )}

      <StickyBookingBar booking={booking} calendarEvent={calendarEvent} />
    </article>
  );
}

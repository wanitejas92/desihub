import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import {
  formatEventDate,
  formatEventDateShort,
  formatEventTime,
  getBookingOptions,
  eventHighlights,
  isSameLocalDay,
  EVENT_CATEGORY_LABELS,
} from '@desihub/shared';
import { getRepository } from '@/lib/data';
import { EventImage } from '@/components/event-image';
import { ShareButton } from '@/components/share-button';
import { FavouriteButton } from '@/components/favourite-button';
import { OrganiserCard } from '@/components/organiser-card';
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
  VenueBlock,
} from '@/components/event/event-sections';
import { IconChevronRight } from '@/components/ui/icons';
import { CATEGORY_TONE, TONE_ACCENT } from '@/lib/category-tone';
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

  const similar = await repo.similar(event, 8);

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

  // The hero tint follows the category, so a temple aarti does not arrive
  // dressed as a nightclub.
  const tone = CATEGORY_TONE[event.category];
  const accent = TONE_ACCENT[tone];

  const timeLine = `${formatEventTime(event.starts_at)}${
    event.ends_at
      ? isSameLocalDay(event.starts_at, event.ends_at)
        ? `–${formatEventTime(event.ends_at)}`
        : ` – ${formatEventDateShort(event.ends_at)}, ${formatEventTime(event.ends_at)}`
      : ''
  }`;

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

  return (
    <article className="pb-28 lg:pb-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(eventJsonLd(event)) }}
      />

      {/* ---------------------------------------------------------------- */}
      {/* Hero — image, then the four things a visitor needs in 3 seconds   */}
      {/* ---------------------------------------------------------------- */}
      <header className="relative">
        {/*
          Wide and shallow on desktop: the cover is context, not the content.
          A taller band pushed the title, date and price below the fold, which
          is exactly the information the page exists to deliver in 3 seconds.
        */}
        <div className="bg-bg-subtle relative aspect-[16/9] w-full overflow-hidden sm:aspect-[21/9] lg:aspect-[3.6/1]">
          <EventImage
            imageUrl={event.image_url}
            title={event.title}
            category={event.category}
            startsAt={event.starts_at}
            organiserName={event.organiser.name}
            priority
            sizes="100vw"
            fallbackWidth={1600}
            fallbackHeight={640}
          />
          <div
            aria-hidden
            className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"
          />
        </div>

        <div className="max-w-content relative mx-auto px-4 sm:px-6">
          <div className="bg-surface shadow-elevation-lg -mt-10 rounded-2xl p-6 sm:-mt-16 sm:p-8">
            <nav className="text-fg-subtle mb-3 flex items-center text-sm" aria-label="Breadcrumb">
              <Link href="/browse" className="hover:text-fg">
                Events
              </Link>
              <IconChevronRight width={14} height={14} className="mx-1" />
              <Link href={`/browse?category=${event.category}`} className="hover:text-fg">
                {EVENT_CATEGORY_LABELS[event.category]}
              </Link>
            </nav>

            <span
              className="rounded-pill inline-flex items-center px-3 py-1 text-xs font-bold tracking-[0.06em] uppercase"
              style={{ backgroundColor: `${accent}1F`, color: accent }}
            >
              {EVENT_CATEGORY_LABELS[event.category]}
            </span>

            <h1 className="font-display text-fg mt-3 text-3xl leading-[1.1] font-bold tracking-tight text-balance sm:text-4xl lg:text-5xl">
              {event.title}
            </h1>

            {event.sub_category && (
              <p className="text-fg-muted mt-2 max-w-prose text-base sm:text-lg">
                {event.sub_category}
              </p>
            )}

            <ul
              role="list"
              className="text-fg-muted mt-5 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm sm:text-base"
            >
              <li>📅 {formatEventDate(event.starts_at)}</li>
              <li>⏰ {timeLine}</li>
              {event.venue && <li>📍 {event.venue.name}</li>}
              {event.venue && <li>🏙 {event.venue.city}</li>}
            </ul>

            <div className="mt-6 flex flex-wrap gap-2">
              <FavouriteButton eventId={event.id} variant="inline" />
              <ShareButton title={event.title} path={`/e/${event.slug}`} />
            </div>
          </div>
        </div>
      </header>

      {/* ---------------------------------------------------------------- */}
      {/* Body                                                              */}
      {/* ---------------------------------------------------------------- */}
      <div className="max-w-content mx-auto grid gap-10 px-4 py-10 sm:px-6 lg:grid-cols-[minmax(0,1fr)_22rem] lg:gap-12">
        <div className="space-y-12">
          {event.description && (
            <section>
              <SectionHeading>About the event</SectionHeading>
              <div className="mt-4">
                <EventDescription text={event.description} />
              </div>
            </section>
          )}

          <EventHighlights highlights={eventHighlights(event.category)} />
          <EventLineup lineup={event.lineup} />

          {event.venue && (
            <VenueBlock
              name={event.venue.name}
              address={event.venue.address}
              city={event.venue.city}
            />
          )}

          <EventInfoGrid rows={infoRows} />
          <EventGallery images={event.gallery} title={event.title} />

          <section>
            <SectionHeading>Organised by</SectionHeading>
            <div className="mt-4">
              <OrganiserCard
                id={event.organiser.id}
                name={event.organiser.name}
                slug={event.organiser.slug}
                verified={event.organiser.verified}
                city={event.organiser.city}
                showFollow
              />
            </div>
          </section>
        </div>

        <aside className="lg:pt-1">
          <div id="tickets" className="scroll-mt-24">
            <BookingCard option={booking} calendarEvent={calendarEvent}>
              {nativeTickets && (
                <div className="border-border/70 mt-5 border-t pt-5">
                  <TicketSelector event={event} />
                </div>
              )}
            </BookingCard>
          </div>
        </aside>
      </div>

      {similar.length > 0 && (
        <div className="border-border/70 border-t pt-4">
          <EventRail title="You may also like" events={similar} />
        </div>
      )}

      {/*
        Mobile sticky booking bar. aria-hidden because it duplicates the card
        above for thumb reach; the same controls stay keyboard- and
        screen-reader-reachable in the aside.
      */}
      <div
        aria-hidden="true"
        className="border-border bg-bg/95 fixed inset-x-0 bottom-0 z-30 flex items-center justify-between gap-4 border-t px-4 py-3 backdrop-blur lg:hidden"
      >
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

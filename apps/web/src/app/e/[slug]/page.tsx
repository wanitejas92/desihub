import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import {
  formatEventDate,
  formatEventTime,
  formatPriceRange,
  EVENT_CATEGORY_LABELS,
} from '@desihub/shared';
import { getRepository } from '@/lib/data';
import { EventImage } from '@/components/event-image';
import { CategoryPill } from '@/components/category-pill';
import { DateChip } from '@/components/date-chip';
import { AddToCalendar } from '@/components/add-to-calendar';
import { ShareButton } from '@/components/share-button';
import { OrganiserCard } from '@/components/organiser-card';
import { EventRail } from '@/components/event-rail';
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
  const price = formatPriceRange(
    event.min_price_cents,
    event.max_price_cents,
    event.is_free,
    event.currency,
  );
  const mapsQuery = encodeURIComponent(
    event.venue ? `${event.venue.name}, ${event.venue.address ?? ''}, ${event.venue.city}` : '',
  );
  const calInput = {
    title: event.title,
    description: event.description ?? undefined,
    location: event.venue ? `${event.venue.name}, ${event.venue.city}` : undefined,
    startsAt: event.starts_at,
    endsAt: event.ends_at,
    url: `${process.env.NEXT_PUBLIC_SITE_URL ?? 'https://desihub.nl'}/e/${event.slug}`,
  };

  return (
    <article className="max-w-content mx-auto px-4 py-6 sm:px-6">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(eventJsonLd(event)) }}
      />

      <nav className="text-fg-muted mb-4 text-sm" aria-label="Breadcrumb">
        <Link href="/browse" className="hover:text-fg">
          Events
        </Link>
        <span className="mx-2">/</span>
        <Link href={`/browse?category=${event.category}`} className="hover:text-fg">
          {EVENT_CATEGORY_LABELS[event.category]}
        </Link>
      </nav>

      <div className="grid gap-8 lg:grid-cols-[1.5fr_1fr]">
        <div>
          <div className="bg-bg-sunken relative aspect-[16/10] overflow-hidden rounded-lg">
            <EventImage
              imageUrl={event.image_url}
              title={event.title}
              category={event.category}
              startsAt={event.starts_at}
              organiserName={event.organiser.name}
              priority
              sizes="(max-width: 1024px) 100vw, 720px"
              fallbackWidth={1200}
              fallbackHeight={750}
            />
            <div className="absolute top-4 left-4 flex gap-2">
              <DateChip startsAt={event.starts_at} />
            </div>
            <div className="absolute top-4 right-4">
              <CategoryPill category={event.category} />
            </div>
          </div>

          <h1 className="font-display mt-6 text-3xl leading-tight font-semibold sm:text-4xl">
            {event.title}
          </h1>

          <div className="text-fg-muted mt-3 flex flex-wrap items-center gap-x-4 gap-y-1">
            <span>{formatEventDate(event.starts_at)}</span>
            <span aria-hidden>·</span>
            <span>
              {formatEventTime(event.starts_at)}
              {event.ends_at ? `–${formatEventTime(event.ends_at)}` : ''}
            </span>
            {event.age_policy && (
              <>
                <span aria-hidden>·</span>
                <span>{event.age_policy}</span>
              </>
            )}
          </div>

          <div className="mt-5 flex flex-wrap gap-2">
            <AddToCalendar event={calInput} />
            <ShareButton title={event.title} path={`/e/${event.slug}`} />
          </div>

          {event.description && (
            <div className="mt-8 max-w-prose">
              <h2 className="font-display text-xl font-semibold">About this event</h2>
              <p className="text-fg mt-3 leading-relaxed whitespace-pre-line">
                {event.description}
              </p>
            </div>
          )}

          {event.languages.length > 0 && (
            <div className="mt-6 flex flex-wrap gap-2">
              {event.languages.map((l) => (
                <span key={l} className="rounded-pill bg-bg-subtle text-fg-muted px-3 py-1 text-sm">
                  {l}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Sticky ticket + venue rail */}
        <aside className="space-y-4">
          <div className="border-border bg-surface rounded-lg border p-5 lg:sticky lg:top-20">
            <p className="text-fg-muted text-sm">Price</p>
            <p className="font-display text-fg text-2xl font-semibold">{price}</p>
            <TicketCta event={event} />
            <p className="text-fg-subtle mt-3 text-center text-xs">
              You&apos;ll complete your purchase on the organiser&apos;s ticket page.
            </p>
          </div>

          {event.venue && (
            <div className="border-border bg-surface rounded-md border p-4">
              <p className="text-fg-subtle text-xs font-semibold tracking-wide uppercase">Venue</p>
              <p className="text-fg mt-2 font-semibold">{event.venue.name}</p>
              {event.venue.address && (
                <p className="text-fg-muted text-sm">{event.venue.address}</p>
              )}
              <p className="text-fg-muted text-sm">{event.venue.city}</p>
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${mapsQuery}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-accent mt-3 inline-flex text-sm font-semibold hover:underline"
              >
                Get directions →
              </a>
            </div>
          )}

          <OrganiserCard
            name={event.organiser.name}
            slug={event.organiser.slug}
            verified={event.organiser.verified}
            city={event.organiser.city}
          />
        </aside>
      </div>

      {similar.length > 0 && (
        <div className="border-border mt-12 border-t pt-4">
          <EventRail title="Similar events" events={similar} />
        </div>
      )}
    </article>
  );
}

function TicketCta({
  event,
}: {
  event: Awaited<ReturnType<Awaited<ReturnType<typeof getRepository>>['getEventBySlug']>>;
}) {
  if (!event) return null;
  if (event.status === 'sold_out') {
    return (
      <button
        disabled
        className="bg-bg-sunken text-fg-muted mt-4 w-full cursor-not-allowed rounded-md px-4 py-3 font-semibold"
      >
        Sold out
      </button>
    );
  }
  if (event.status === 'cancelled') {
    return (
      <button
        disabled
        className="bg-error-bg text-error mt-4 w-full cursor-not-allowed rounded-md px-4 py-3 font-semibold"
      >
        Cancelled
      </button>
    );
  }
  if (event.is_free) {
    return (
      <div className="bg-success-bg text-success mt-4 w-full rounded-md px-4 py-3 text-center font-semibold">
        Free entry — no ticket needed
      </div>
    );
  }
  if (event.external_ticket_url) {
    return (
      <a
        href={event.external_ticket_url}
        target="_blank"
        rel="noopener noreferrer"
        className="bg-accent text-accent-fg hover:bg-accent-hover mt-4 block w-full rounded-md px-4 py-3 text-center font-semibold transition-colors"
      >
        Get tickets
      </a>
    );
  }
  return (
    <div className="bg-bg-subtle text-fg-muted mt-4 w-full rounded-md px-4 py-3 text-center text-sm">
      Tickets coming soon
    </div>
  );
}

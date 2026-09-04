import Link from 'next/link';
import Image from 'next/image';
import type { EventHighlight } from '@desihub/shared';
import { monogramAvatar } from '@/lib/artist-avatar';
import { IconMapPin, IconArrowRight } from '@/components/ui/icons';

/**
 * The optional blocks of the event page. Every one of them hides itself when
 * it has nothing to say — an event page padded out with empty "Gallery" and
 * "Artists" headings looks abandoned, and most community events genuinely
 * only fill in half of these.
 */

export function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="font-display text-fg text-xl font-bold tracking-tight sm:text-2xl">
      {children}
    </h2>
  );
}

/* ------------------------------------------------------------------ */
/* Highlights — what the evening is actually like                      */
/* ------------------------------------------------------------------ */

export function EventHighlights({ highlights }: { highlights: EventHighlight[] }) {
  if (highlights.length === 0) return null;
  return (
    <section>
      <SectionHeading>Highlights</SectionHeading>
      <ul role="list" className="mt-4 grid gap-3 sm:grid-cols-3">
        {highlights.map((h) => (
          <li
            key={h.label}
            className="border-border/70 bg-surface flex items-center gap-3 rounded-xl border px-4 py-3.5"
          >
            <span aria-hidden className="text-xl leading-none">
              {h.icon}
            </span>
            <span className="text-fg text-sm font-semibold">{h.label}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Lineup                                                              */
/* ------------------------------------------------------------------ */

export interface LineupArtist {
  name: string;
  role: string | null;
  image_url: string | null;
}

/**
 * Artists link into a filtered browse rather than to a profile page: DesiHub
 * has no artist entity yet, and a link to an empty profile is worse than a
 * link to every event that artist appears at.
 */
export function EventLineup({ lineup }: { lineup: LineupArtist[] }) {
  if (lineup.length === 0) return null;
  return (
    <section>
      <SectionHeading>Line-up</SectionHeading>
      <ul role="list" className="mt-4 flex flex-wrap gap-x-6 gap-y-5">
        {lineup.map((a) => (
          <li key={a.name}>
            <Link
              href={`/browse?q=${encodeURIComponent(a.name)}`}
              className="group flex w-24 flex-col items-center text-center sm:w-28"
            >
              <span className="ring-border/60 group-hover:ring-accent relative block h-20 w-20 overflow-hidden rounded-full ring-1 transition-[box-shadow,transform] duration-300 group-hover:scale-[1.04] sm:h-24 sm:w-24">
                <Image
                  src={a.image_url ?? monogramAvatar(a.name)}
                  alt=""
                  fill
                  sizes="96px"
                  className="object-cover"
                  unoptimized={!a.image_url}
                />
              </span>
              <span className="text-fg group-hover:text-accent mt-2.5 text-sm leading-snug font-semibold">
                {a.name}
              </span>
              {a.role && <span className="text-fg-subtle text-xs">{a.role}</span>}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Venue                                                               */
/* ------------------------------------------------------------------ */

export function VenueBlock({
  name,
  address,
  city,
}: {
  name: string;
  address: string | null;
  city: string;
}) {
  const query = encodeURIComponent([name, address, city].filter(Boolean).join(', '));
  return (
    <section>
      <SectionHeading>Venue</SectionHeading>
      <div className="border-border/70 bg-surface mt-4 overflow-hidden rounded-2xl border">
        {/*
          A styled map placeholder rather than an embedded tile service: an
          iframe to a third-party map is a tracking cookie on every event page,
          and the two links below do the job the visitor actually wants.
        */}
        <div
          className="relative h-32 sm:h-40"
          style={{
            backgroundImage:
              'linear-gradient(135deg, rgba(255,138,0,0.14), rgba(240,68,111,0.14) 45%, rgba(123,53,214,0.14))',
          }}
          aria-hidden
        >
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="bg-surface/90 shadow-elevation flex h-11 w-11 items-center justify-center rounded-full">
              <IconMapPin width={20} height={20} className="text-accent" />
            </span>
          </div>
        </div>
        <div className="p-5">
          <p className="text-fg font-display text-lg font-semibold">{name}</p>
          {address && <p className="text-fg-muted mt-1 text-sm">{address}</p>}
          <p className="text-fg-muted text-sm">{city}</p>
          <div className="mt-4 flex flex-wrap gap-2">
            <a
              href={`https://www.google.com/maps/search/?api=1&query=${query}`}
              target="_blank"
              rel="noopener noreferrer"
              className="border-border text-fg hover:bg-bg-subtle rounded-pill inline-flex h-10 items-center gap-1.5 border px-4 text-sm font-semibold"
            >
              <IconMapPin width={14} height={14} />
              View on map
            </a>
            <a
              href={`https://www.google.com/maps/dir/?api=1&destination=${query}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent hover:bg-accent-subtle rounded-pill inline-flex h-10 items-center gap-1 px-4 text-sm font-semibold"
            >
              Get directions
              <IconArrowRight width={14} height={14} />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Information grid                                                    */
/* ------------------------------------------------------------------ */

export function EventInfoGrid({ rows }: { rows: { label: string; value: string }[] }) {
  const filled = rows.filter((r) => r.value);
  if (filled.length === 0) return null;
  return (
    <section>
      <SectionHeading>Event information</SectionHeading>
      <dl className="border-border/70 bg-surface mt-4 grid gap-px overflow-hidden rounded-2xl border sm:grid-cols-2">
        {filled.map((r) => (
          <div key={r.label} className="bg-surface px-5 py-4">
            <dt className="text-fg-subtle text-xs font-semibold tracking-[0.06em] uppercase">
              {r.label}
            </dt>
            <dd className="text-fg mt-1 text-sm font-medium">{r.value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Gallery                                                             */
/* ------------------------------------------------------------------ */

export function EventGallery({ images, title }: { images: string[]; title: string }) {
  if (images.length === 0) return null;
  return (
    <section>
      <SectionHeading>Gallery</SectionHeading>
      <ul
        role="list"
        className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3"
        // First image spans two columns on wide screens — a flat grid of
        // identical squares reads as stock filler.
      >
        {images.map((src, i) => (
          <li
            key={src}
            className={i === 0 && images.length > 2 ? 'sm:col-span-2 sm:row-span-2' : undefined}
          >
            <span className="bg-bg-subtle relative block aspect-[4/3] overflow-hidden rounded-xl sm:aspect-auto sm:h-full sm:min-h-[9rem]">
              <Image
                src={src}
                alt={`${title} — photo ${i + 1}`}
                fill
                sizes="(max-width: 640px) 50vw, 33vw"
                className="object-cover transition-transform duration-500 hover:scale-[1.03]"
              />
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}

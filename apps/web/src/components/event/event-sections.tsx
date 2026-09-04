import Link from 'next/link';
import Image from 'next/image';
import type { EventHighlight } from '@desihub/shared';
import { monogramAvatar } from '@/lib/artist-avatar';

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

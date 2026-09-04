'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import type { Banner } from '@desihub/shared';
import { fallbackCardDataUri } from '@/lib/fallback-card';
import type { EventCategory } from '@desihub/shared';
import { IconChevronLeft, IconChevronRight } from '@/components/ui/icons';

/** Tones the fallback art cycles through; see Slide. */
const FALLBACK_TONES: EventCategory[] = ['concert', 'diwali', 'garba_dandiya'];

function hashTitle(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}

/**
 * The rotating promo strip — the one place homepage artwork comes from.
 *
 * Uploading a banner is a file drop plus a row (Supabase Studio + the
 * `banners` bucket, or `public/banners/` in dev), never a code change. That
 * is the whole reason this replaced a hard-coded hero illustration: the
 * person running DesiHub changes what the homepage leads with, not a build.
 *
 * A slide whose file is missing draws designed fallback art rather than a
 * broken image, so a half-finished upload never shows as breakage.
 */
const ROTATE_MS = 5500;

export function PromoCarousel({ banners }: { banners: Banner[] }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const count = banners.length;

  const go = useCallback((next: number) => setIndex(((next % count) + count) % count), [count]);

  useEffect(() => {
    // One slide has nothing to rotate to; a paused strip stays put. Readers
    // who asked for less motion get a static first slide with working
    // controls rather than no carousel at all.
    if (count < 2 || paused) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const t = setInterval(() => setIndex((i) => (i + 1) % count), ROTATE_MS);
    return () => clearInterval(t);
  }, [count, paused]);

  if (count === 0) return null;

  return (
    <section
      aria-roledescription="carousel"
      aria-label="Featured events"
      className="group relative"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={() => setPaused(false)}
    >
      <div className="bg-bg-subtle relative aspect-[16/6] overflow-hidden rounded-2xl sm:aspect-[24/7] lg:aspect-[5.5/1]">
        {banners.map((b, i) => (
          <Slide key={b.id} banner={b} active={i === index} position={i + 1} total={count} />
        ))}
      </div>

      {count > 1 && (
        <>
          <Arrow side="left" onClick={() => go(index - 1)} />
          <Arrow side="right" onClick={() => go(index + 1)} />

          {/* Dots are real buttons: the strip must be operable without a
              mouse and without waiting for the rotation to come round. */}
          <div className="mt-3 flex justify-center gap-2">
            {banners.map((b, i) => (
              <button
                key={b.id}
                type="button"
                onClick={() => go(i)}
                aria-label={`Show ${b.title}`}
                aria-current={i === index}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i === index ? 'bg-accent w-7' : 'bg-border hover:bg-fg-subtle w-3'
                }`}
              />
            ))}
          </div>
        </>
      )}
    </section>
  );
}

function Slide({
  banner,
  active,
  position,
  total,
}: {
  banner: Banner;
  active: boolean;
  position: number;
  total: number;
}) {
  const [loaded, setLoaded] = useState(false);

  /*
    Designed fallback art is the *base layer*, with the real banner drawn on
    top once it decodes — not an onError swap. A server-rendered <img> whose
    file is missing fires its error event before React hydrates, so the
    handler never runs and the reader is left looking at a broken-image
    marker. Layering cannot miss the event because it never listens for one.

    Tone varies per banner so a set of fallbacks doesn't read as one repeated
    tile, and is hashed from the title so it is stable across renders.
  */
  const fallback = fallbackCardDataUri({
    title: banner.title,
    category: FALLBACK_TONES[hashTitle(banner.title) % FALLBACK_TONES.length]!,
    startsAt: '',
    width: 1600,
    height: 500,
  });

  const inner = (
    <>
      <span
        aria-hidden
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url("${fallback}")` }}
      />
      {/* A drop-in asset whose presence is unknown at build time, so
          next/image (which needs the file to exist) can't be used here. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={banner.imageUrl}
        alt={banner.title}
        onLoad={() => setLoaded(true)}
        className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-500 ${
          loaded ? 'opacity-100' : 'opacity-0'
        }`}
      />
      <span
        aria-hidden
        className="absolute inset-0 bg-gradient-to-r from-black/55 via-black/15 to-transparent"
      />
      <p className="font-display absolute bottom-5 left-5 max-w-[70%] text-lg font-bold text-balance text-white drop-shadow sm:bottom-7 sm:left-8 sm:text-2xl">
        {banner.title}
      </p>
    </>
  );

  return (
    <div
      role="group"
      aria-roledescription="slide"
      aria-label={`${position} of ${total}`}
      // Inactive slides stay mounted for the cross-fade, but must not be
      // announced or tabbable — an invisible link is a keyboard trap.
      aria-hidden={!active}
      className={`absolute inset-0 transition-opacity duration-700 ease-out ${
        active ? 'opacity-100' : 'pointer-events-none opacity-0'
      }`}
    >
      {banner.linkUrl ? (
        <Link href={banner.linkUrl} className="block h-full w-full" tabIndex={active ? 0 : -1}>
          {inner}
        </Link>
      ) : (
        inner
      )}
    </div>
  );
}

function Arrow({ side, onClick }: { side: 'left' | 'right'; onClick: () => void }) {
  const Icon = side === 'left' ? IconChevronLeft : IconChevronRight;
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={side === 'left' ? 'Previous banner' : 'Next banner'}
      className={`bg-surface/85 text-fg shadow-elevation absolute top-1/2 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full opacity-0 backdrop-blur transition-opacity duration-200 group-hover:opacity-100 focus-visible:opacity-100 sm:flex ${
        side === 'left' ? 'left-3' : 'right-3'
      }`}
    >
      <Icon width={18} height={18} />
    </button>
  );
}

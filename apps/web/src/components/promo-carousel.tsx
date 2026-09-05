'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import type { Banner } from '@desihub/shared';
import { fallbackCardDataUri } from '@/lib/fallback-card';
import type { EventCategory } from '@desihub/shared';
import { cn } from '@/lib/cn';
import { IconChevronLeft, IconChevronRight } from '@/components/ui/icons';

/** Tones the fallback art cycles through; see SlideArt. */
const FALLBACK_TONES: EventCategory[] = ['concert', 'diwali', 'garba_dandiya'];

function hashTitle(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0;
  return h;
}

/** Same fallback-art tone lookup used everywhere else — kept out of components. */
function toneFor(title: string): EventCategory {
  return FALLBACK_TONES[hashTitle(title) % FALLBACK_TONES.length]!;
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

  // The "one big banner plus two peeking neighbours" desktop layout only
  // reads correctly with three distinct banners either side of the active
  // one — with fewer, the "neighbour" would just be the active banner
  // again, which looks like a bug rather than a gallery.
  const showPeek = count >= 3;

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
      {/* Single cross-fading slide — the only presentation below `lg`, and
          still the desktop presentation when there aren't enough banners
          for the three-up layout below. */}
      <div
        className={cn(
          'bg-bg-subtle relative aspect-[5/3] overflow-hidden rounded-2xl sm:aspect-[16/9]',
          showPeek && 'lg:hidden',
        )}
      >
        {banners.map((b, i) => (
          <Slide key={b.id} banner={b} active={i === index} position={i + 1} total={count} />
        ))}
      </div>

      {/* The row sets one explicit height and the tiles fill it.
          
          Aspect-ratio on the tiles themselves is what broke this twice: as
          grid items they default to `min-width: auto`, so a height-derived
          width pushed straight through the track and the homepage scrolled
          sideways to 2238px on a 1440px viewport. Sizing the row instead
          means the three tiles are equal-height by construction, the banner
          can never drive the page wider than its container, and the strip
          keeps a sensible height on a very wide monitor rather than growing
          to half the screen. */}
      {showPeek && (
        <div className="hidden lg:grid lg:h-[340px] lg:grid-cols-[0.85fr_2.6fr_0.85fr] lg:gap-4 xl:h-[380px]">
          <Tile
            banner={banners[(index - 1 + count) % count]!}
            size="side"
            onClick={() => go(index - 1)}
            aria-label="Previous banner"
          />
          <Tile banner={banners[index]!} size="main" />
          <Tile
            banner={banners[(index + 1) % count]!}
            size="side"
            onClick={() => go(index + 1)}
            aria-label="Next banner"
          />
        </div>
      )}

      {count > 1 && (
        <>
          <Arrow side="left" onClick={() => go(index - 1)} hideAtLg={showPeek} />
          <Arrow side="right" onClick={() => go(index + 1)} hideAtLg={showPeek} />

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

/**
 * Fallback art + real image + legibility scrim, shared by every rendered
 * size — the crossfading slide and the desktop peek tiles all draw a banner
 * the same way, so there is exactly one place that decides "how a banner
 * looks", not three that could drift apart.
 */
function SlideArt({ banner, size }: { banner: Banner; size: 'main' | 'side' | 'wide' }) {
  const [loaded, setLoaded] = useState(false);

  /*
    Designed fallback art is the *base layer*, with the real banner drawn on
    top once it decodes — not an onError swap. A server-rendered <img> whose
    file is missing fires its error event before React hydrates, so the
    handler never runs and the reader is left looking at a broken-image
    marker. Layering cannot miss the event because it never listens for one.
  */
  const fallback = fallbackCardDataUri({
    title: banner.title,
    category: toneFor(banner.title),
    startsAt: '',
    width: 1600,
    height: 500,
  });

  return (
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
        className={cn(
          'absolute inset-0 bg-gradient-to-r from-black/60 via-black/20 to-transparent',
          size === 'side' && 'from-black/70 via-black/35',
        )}
      />
      <p
        className={cn(
          'font-display absolute text-balance text-white drop-shadow',
          size === 'main' &&
            'bottom-5 left-5 max-w-[80%] text-lg font-bold sm:bottom-7 sm:left-8 sm:text-2xl',
          size === 'wide' &&
            'bottom-5 left-5 max-w-[70%] text-lg font-bold sm:bottom-7 sm:left-8 sm:text-2xl',
          size === 'side' && 'bottom-3 left-3 max-w-[85%] text-sm font-semibold',
        )}
      >
        {banner.title}
      </p>
    </>
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
  const inner = <SlideArt banner={banner} size="wide" />;

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

/**
 * One tile in the desktop three-up layout — the large active banner, or one
 * of the two smaller neighbours either side of it. A neighbour is always a
 * button (clicking it steps the carousel there) even when the banner itself
 * also links somewhere, because "jump to this slide" is the tile's actual
 * job in that position; the main tile is the one that follows the banner's
 * own link.
 */
function Tile({
  banner,
  size,
  onClick,
  ...aria
}: {
  banner: Banner;
  size: 'main' | 'side';
  onClick?: () => void;
  'aria-label'?: string;
}) {
  const content = (
    <span
      className={cn(
        'bg-bg-subtle relative block h-full w-full overflow-hidden rounded-2xl',
        size === 'side' &&
          'opacity-80 transition-opacity duration-200 group-hover:opacity-80 hover:!opacity-100',
      )}
    >
      <SlideArt banner={banner} size={size} />
    </span>
  );

  const wrapperClass = 'h-full min-w-0';

  if (size === 'side') {
    return (
      <button
        type="button"
        onClick={onClick}
        aria-label={aria['aria-label']}
        className={cn(wrapperClass, 'block')}
      >
        {content}
      </button>
    );
  }

  return banner.linkUrl ? (
    <Link href={banner.linkUrl} className={cn(wrapperClass, 'block')}>
      {content}
    </Link>
  ) : (
    <div className={wrapperClass}>{content}</div>
  );
}

function Arrow({
  side,
  onClick,
  hideAtLg,
}: {
  side: 'left' | 'right';
  onClick: () => void;
  hideAtLg: boolean;
}) {
  const Icon = side === 'left' ? IconChevronLeft : IconChevronRight;
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={side === 'left' ? 'Previous banner' : 'Next banner'}
      className={cn(
        'bg-surface/85 text-fg shadow-elevation absolute top-1/2 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full opacity-0 backdrop-blur transition-opacity duration-200 group-hover:opacity-100 focus-visible:opacity-100 sm:flex',
        side === 'left' ? 'left-3' : 'right-3',
        hideAtLg && 'lg:hidden',
      )}
    >
      <Icon width={18} height={18} />
    </button>
  );
}

'use client';

import { useState } from 'react';
import { HeroIllustration } from './hero-illustration';

/**
 * The hero artwork slot.
 *
 * The built-in SVG scene is the base layer; a real image drawn on top of it
 * takes over the moment one exists at `public/hero-banner.png`. Layering
 * rather than swapping means no flash of a broken image while the file is
 * missing, and swapping the art is a file drop, not a code change.
 */
const HERO_IMAGE = '/hero-banner.png';

export function HeroBannerImage({ className }: { className?: string }) {
  const [state, setState] = useState<'pending' | 'loaded' | 'missing'>('pending');

  return (
    <div className={`relative overflow-hidden ${className ?? ''}`}>
      <HeroIllustration className="absolute inset-0 h-full w-full" />
      {state !== 'missing' && (
        // A drop-in asset whose presence is unknown at build time, so
        // next/image (which needs the file to exist) can't be used here.
        // Held at opacity-0 until it actually decodes, so a missing file
        // never flashes a broken-image marker over the fallback art.
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={HERO_IMAGE}
          alt=""
          aria-hidden
          onLoad={() => setState('loaded')}
          onError={() => setState('missing')}
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-300 ${
            state === 'loaded' ? 'opacity-100' : 'opacity-0'
          }`}
        />
      )}
    </div>
  );
}

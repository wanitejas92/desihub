import type { EventCategory } from '@desihub/shared';
import { TONE_ACCENT, TONE_SOFT, CATEGORY_TONE } from './category-tone';

/**
 * Generates a branded SVG fallback image for events with no uploaded photo.
 * We never scrape organiser artwork, so a missing image must always resolve
 * to something designed — never a broken image. Output is a data URI usable
 * as an <img> src, rendered server-side with no network.
 *
 * Light-first per brief: a white base with a soft pastel wash and a small
 * accent motif in one of the three brand tones — a clean placeholder
 * graphic, not a text-bearing "poster." The event title already renders as
 * real DOM text right below the image on every card, so the fallback
 * doesn't duplicate it — that used to make sense when the image was a
 * saturated colour block standing in for a poster; on a light, clean image
 * it would just be visual noise competing with the real heading.
 * Categories map onto the three brand tones rather than twelve bespoke
 * hues — "subtle orange/pink/purple accents," not a rainbow grid.
 */

function escapeXml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export interface FallbackCardInput {
  title: string;
  category: EventCategory;
  startsAt: string;
  organiserName?: string;
  width?: number;
  height?: number;
}

export function fallbackCardSvg(input: FallbackCardInput): string {
  const w = input.width ?? 800;
  const h = input.height ?? 600;
  const tone = CATEGORY_TONE[input.category];
  const accent = TONE_ACCENT[tone];
  const soft = TONE_SOFT[tone];
  const cx = w * 0.78;
  const cy = h * 0.4;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" role="img" aria-label="${escapeXml(
    input.title,
  )}">
  <defs>
    <linearGradient id="wash" x1="0" y1="0" x2="1" y2="0.85">
      <stop offset="0" stop-color="${soft}"/>
      <stop offset="0.7" stop-color="#FFFFFF"/>
    </linearGradient>
  </defs>
  <rect width="${w}" height="${h}" fill="#FFFFFF"/>
  <rect width="${w}" height="${h}" fill="url(#wash)"/>
  <circle cx="${cx}" cy="${cy}" r="${h * 0.32}" fill="${accent}" opacity="0.10"/>
  <circle cx="${cx}" cy="${cy}" r="${h * 0.18}" fill="${accent}" opacity="0.16"/>
  <circle cx="${cx}" cy="${cy}" r="${h * 0.07}" fill="${accent}"/>
</svg>`.trim();
}

/** Fallback card as a data URI (UTF-8, not base64, so it stays diff-friendly). */
export function fallbackCardDataUri(input: FallbackCardInput): string {
  const svg = fallbackCardSvg(input);
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

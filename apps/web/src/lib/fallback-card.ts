import type { EventCategory } from '@desihub/shared';
import { categoryHex } from './category-tone';

/**
 * Generates branded poster art for events with no uploaded photo. We never
 * scrape organiser artwork, so a missing image must always resolve to
 * something designed — never a broken image, and never something that reads
 * as *unfinished*. Output is a data URI usable as an <img> src, rendered
 * server-side with no network.
 *
 * The cards are photography-first: the image fills the card and the event's
 * text sits on top of it under a scrim. That makes this art the backdrop for
 * white type, so it has to be deep — a pale wash reads as a broken
 * placeholder, exactly the wrong signal for a ticketing site.
 *
 * But it also has to be *quiet*. The previous ramp was fully saturated
 * orange/pink/purple, and since most seeded events have no photo, the
 * homepage rendered as twenty fluorescent gradients competing with each
 * other and with the accent. These tones are now derived from the category
 * hue and pulled a long way toward near-black, so a full grid reads as a
 * set of posters rather than a swatch chart, and the saffron accent is the
 * brightest thing on the page again — which is the whole point of having
 * one accent.
 *
 * Deterministic per event: the same title always produces the same art, so
 * the grid doesn't reshuffle between renders.
 */

function escapeXml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/** Stable small hash, so art is deterministic per event rather than random. */
function hash(s: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h = Math.imul(h ^ s.charCodeAt(i), 0x01000193) >>> 0;
  }
  return h;
}

/** Warm near-black the duotones are pulled toward — matches the dark ground. */
const SHADE = { r: 0x0e, g: 0x0c, b: 0x0b };

function mix(hex: string, target: { r: number; g: number; b: number }, amount: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const c = (from: number, to: number) =>
    Math.round(from + (to - from) * amount)
      .toString(16)
      .padStart(2, '0');
  return `#${c(r, target.r)}${c(g, target.g)}${c(b, target.b)}`;
}

/**
 * Three steps from one category hue: a near-black ground, a mid body, and a
 * lifted highlight for the light source. Derived rather than hand-picked so
 * adding a category means adding a hue, not inventing three more hex values
 * that may or may not sit at the same depth as the rest.
 */
function toneRamp(category: EventCategory): [string, string, string] {
  const base = categoryHex(category);
  return [
    mix(base, SHADE, 0.82), // ground
    mix(base, SHADE, 0.42), // body
    mix(base, { r: 255, g: 255, b: 255 }, 0.24), // highlight
  ];
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
  const [deep, mid, bright] = toneRamp(input.category);

  const seed = hash(input.title);
  // Light source drifts per event so a grid of fallbacks doesn't look tiled.
  const gx = 18 + (seed % 64);
  const gy = 12 + ((seed >> 6) % 46);
  const rot = (seed >> 12) % 40;
  const id = (seed % 100000).toString(36);

  // A loose arch — the same motif as the hero, at poster scale.
  const archW = w * 0.46;
  const archH = h * 0.86;
  const archX = w * 0.62;
  const archY = h * 0.62;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" role="img" aria-label="${escapeXml(
    input.title,
  )}">
  <defs>
    <linearGradient id="b${id}" x1="0" y1="0" x2="0.6" y2="1">
      <stop offset="0" stop-color="${mid}"/>
      <stop offset="1" stop-color="${deep}"/>
    </linearGradient>
    <radialGradient id="g${id}" cx="${gx}%" cy="${gy}%" r="62%">
      <stop offset="0" stop-color="${bright}" stop-opacity="0.62"/>
      <stop offset="0.55" stop-color="${bright}" stop-opacity="0.16"/>
      <stop offset="1" stop-color="${bright}" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="a${id}" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#FFFFFF" stop-opacity="0.16"/>
      <stop offset="1" stop-color="#FFFFFF" stop-opacity="0.02"/>
    </linearGradient>
  </defs>
  <rect width="${w}" height="${h}" fill="url(#b${id})"/>
  <g transform="rotate(${rot} ${archX} ${archY})">
    <path d="M${archX - archW / 2},${archY} L${archX - archW / 2},${archY - archH * 0.45}
             Q${archX - archW / 2},${archY - archH} ${archX},${archY - archH}
             Q${archX + archW / 2},${archY - archH} ${archX + archW / 2},${archY - archH * 0.45}
             L${archX + archW / 2},${archY} Z" fill="url(#a${id})"/>
  </g>
  <rect width="${w}" height="${h}" fill="url(#g${id})"/>
  <rect width="${w}" height="${h}" fill="${deep}" opacity="0.18"/>
</svg>`.trim();
}

/** Fallback card as a data URI (UTF-8, not base64, so it stays diff-friendly). */
export function fallbackCardDataUri(input: FallbackCardInput): string {
  const svg = fallbackCardSvg(input);
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

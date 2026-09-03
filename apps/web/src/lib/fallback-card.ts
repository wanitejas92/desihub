import { EVENT_CATEGORY_LABELS, type EventCategory } from '@desihub/shared';

/**
 * Generates a branded SVG fallback card for events with no uploaded image. We
 * never scrape organiser artwork, so a missing image must always resolve to
 * something designed — never a broken image. Output is a data URI usable as an
 * <img> src or a CSS background, rendered server-side with no network.
 */

const CATEGORY_COLORS: Record<EventCategory, [string, string]> = {
  concert: ['#3B2A5A', '#6D4AA8'],
  party: ['#7A1F4B', '#C13C7A'],
  garba_dandiya: ['#8A3B12', '#E8802A'],
  diwali: ['#7A4A0F', '#E0A82E'],
  holi: ['#124B63', '#2FA3C9'],
  temple: ['#5A3210', '#B5762E'],
  cultural: ['#123B2E', '#2E8F6B'],
  comedy: ['#5A4A12', '#C9A83C'],
  food: ['#6B2412', '#D65A2E'],
  family: ['#123A5A', '#2E7FB5'],
  workshop: ['#2E2A5A', '#5A54B5'],
  networking: ['#2A2A2A', '#5A5A5A'],
};

function escapeXml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/** Wraps a title into up to 3 lines for the card. */
function wrap(title: string, maxChars = 20, maxLines = 3): string[] {
  const words = title.split(/\s+/);
  const lines: string[] = [];
  let line = '';
  for (const w of words) {
    if ((line + ' ' + w).trim().length > maxChars && line) {
      lines.push(line.trim());
      line = w;
    } else {
      line = (line + ' ' + w).trim();
    }
    if (lines.length === maxLines) break;
  }
  if (line && lines.length < maxLines) lines.push(line.trim());
  if (lines.length === maxLines && words.join(' ').length > lines.join(' ').length) {
    lines[maxLines - 1] = lines[maxLines - 1]!.replace(/.{1}$/, '…');
  }
  return lines;
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
  const h = input.height ?? 1000;
  const [c1, c2] = CATEGORY_COLORS[input.category];
  const lines = wrap(input.title);
  const lineHeight = 58;
  const titleTop = h - 60 - (lines.length - 1) * lineHeight - 120;

  const titleTspans = lines
    .map((ln, i) => `<tspan x="56" y="${titleTop + i * lineHeight}">${escapeXml(ln)}</tspan>`)
    .join('');

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" role="img" aria-label="${escapeXml(
    input.title,
  )}">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="${c1}"/>
      <stop offset="1" stop-color="${c2}"/>
    </linearGradient>
    <pattern id="dots" width="26" height="26" patternUnits="userSpaceOnUse">
      <circle cx="2" cy="2" r="1.5" fill="#ffffff" opacity="0.10"/>
    </pattern>
  </defs>
  <rect width="${w}" height="${h}" fill="url(#g)"/>
  <rect width="${w}" height="${h}" fill="url(#dots)"/>
  <g font-family="Georgia, 'Times New Roman', serif" fill="#ffffff">
    <text font-size="52" font-weight="600">${titleTspans}</text>
  </g>
  <g font-family="Arial, system-ui, sans-serif" fill="#ffffff">
    <text x="56" y="${h - 44}" font-size="26" opacity="0.92">${escapeXml(
      EVENT_CATEGORY_LABELS[input.category],
    )}${input.organiserName ? ' · ' + escapeXml(input.organiserName) : ''}</text>
  </g>
</svg>`.trim();
}

/** Fallback card as a data URI (UTF-8, not base64, so it stays diff-friendly). */
export function fallbackCardDataUri(input: FallbackCardInput): string {
  const svg = fallbackCardSvg(input);
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

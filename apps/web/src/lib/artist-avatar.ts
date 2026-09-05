import { categoryPalette, type CategoryHue } from '@desihub/ui-tokens';

/**
 * Cycles the six category hues rather than the three brand accents, so a
 * line-up reads as a set and never repeats a colour across a typical
 * two-to-four-artist bill. Deep end derived from the same hue, so adding a
 * hue needs no second table.
 */
const TONES = Object.keys(categoryPalette) as CategoryHue[];

function darken(hex: string, amount: number): string {
  const ch = (i: number) => parseInt(hex.slice(i, i + 2), 16);
  const c = (v: number) =>
    Math.round(v * (1 - amount))
      .toString(16)
      .padStart(2, '0');
  return `#${c(ch(1))}${c(ch(3))}${c(ch(5))}`;
}

function initials(name: string): string {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0] ?? '')
    .join('')
    .toUpperCase();
}

/**
 * Monogram avatar for an artist with no photo. We never scrape press shots,
 * so the absent-photo state has to be designed rather than broken — the same
 * rule the event poster fallback follows.
 */
export function artistAvatarDataUri(name: string, index: number): string {
  const tone = TONES[index % TONES.length]!;
  const bright = categoryPalette[tone].base;
  const deep = darken(bright, 0.55);
  const id = index.toString(36);

  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" width="240" height="240" viewBox="0 0 240 240" role="img" aria-label="${name.replace(/[<>&"']/g, '')}">
  <defs>
    <linearGradient id="a${id}" x1="0" y1="0" x2="0.7" y2="1">
      <stop offset="0" stop-color="${bright}"/>
      <stop offset="1" stop-color="${deep}"/>
    </linearGradient>
  </defs>
  <rect width="240" height="240" fill="url(#a${id})"/>
  <text x="120" y="120" text-anchor="middle" dominant-baseline="central"
        font-family="Inter, system-ui, sans-serif" font-size="88" font-weight="700"
        fill="#FFFFFF" fill-opacity="0.92">${initials(name)}</text>
</svg>`.trim();

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

/**
 * Same avatar, tone picked from the name rather than a list position — for
 * lineups, where there is no stable index and the same artist should look the
 * same on every event page they appear on.
 */
export function monogramAvatar(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = (hash * 31 + name.charCodeAt(i)) >>> 0;
  return artistAvatarDataUri(name, hash % TONES.length);
}

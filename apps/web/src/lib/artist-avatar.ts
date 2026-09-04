import { TONE_ACCENT } from './category-tone';

const TONES = ['orange', 'pink', 'purple'] as const;

const DEEP: Record<(typeof TONES)[number], string> = {
  orange: '#7A2A05',
  pink: '#6B0E30',
  purple: '#33106B',
};

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
  const bright = TONE_ACCENT[tone];
  const deep = DEEP[tone];
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

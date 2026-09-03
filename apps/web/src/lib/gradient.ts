/**
 * Deterministic decorative gradients — used wherever we need a designed
 * banner but have no photo asset (organiser cover band, city tiles). Never
 * scraped, never invented data: just a stable colour pair per id/name so the
 * same entity always renders the same way.
 *
 * Two intensities, per brief ("do not use large saturated gradient
 * backgrounds throughout... do not make every card colorful"):
 *  - `deterministicGradient` — medium-soft, for the organiser page's single
 *    decorative cover band (one accent moment per page, not a repeated grid).
 *  - `gradientByIndex` — pastel, for city tiles, which render as a grid of
 *    cards and must stay predominantly light like every other card.
 */
const BANNER_GRADIENTS: [string, string][] = [
  ['#FFB25C', '#F2799D'],
  ['#F2799D', '#A876E0'],
  ['#A876E0', '#FFB25C'],
  ['#FFC98C', '#F2799D'],
  ['#F2799D', '#C3A3EA'],
  ['#A876E0', '#FFC98C'],
];

const CARD_WASH: [string, string][] = [
  ['#FFF2E3', '#FFF0F3'],
  ['#FFF0F3', '#F3EEFF'],
  ['#F3EEFF', '#FFF2E3'],
  ['#FFF7EC', '#FFF0F3'],
  ['#FFF0F3', '#F8F1FD'],
  ['#F3EEFF', '#FFF7EC'],
];

export function deterministicGradient(seed: string): [string, string] {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  return BANNER_GRADIENTS[hash % BANNER_GRADIENTS.length]!;
}

/**
 * Pastel wash by position rather than name-hash — for a grid rendered
 * together (e.g. city tiles), this guarantees neighbours look different; a
 * name-hash can (and did) collide several entries onto the same colour.
 */
export function gradientByIndex(index: number): [string, string] {
  return CARD_WASH[index % CARD_WASH.length]!;
}

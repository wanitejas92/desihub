/**
 * Deterministic decorative gradients — used wherever we need a designed
 * banner but have no photo asset (organiser pages, city tiles). Never
 * scraped, never invented data: just a stable colour pair per id/name so
 * the same entity always renders the same way.
 */
const BANNER_GRADIENTS: [string, string][] = [
  ['#3B2A5A', '#6D4AA8'],
  ['#7A1F4B', '#C13C7A'],
  ['#8A3B12', '#E8802A'],
  ['#124B63', '#2FA3C9'],
  ['#123B2E', '#2E8F6B'],
  ['#6B2412', '#D65A2E'],
];

export function deterministicGradient(seed: string): [string, string] {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  return BANNER_GRADIENTS[hash % BANNER_GRADIENTS.length]!;
}

/**
 * Gradient by position rather than name-hash — for a grid rendered together
 * (e.g. city tiles), this guarantees neighbours look different; a name-hash
 * can (and did) collide several entries onto the same colour.
 */
export function gradientByIndex(index: number): [string, string] {
  return BANNER_GRADIENTS[index % BANNER_GRADIENTS.length]!;
}

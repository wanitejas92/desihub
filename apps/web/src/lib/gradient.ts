/**
 * Deterministic decorative gradients — used wherever we need a designed
 * banner but have no photo asset (organiser pages, city tiles). Never
 * scraped, never invented data: just a stable colour pair per id/name so
 * the same entity always renders the same way. Each pair is a two-stop
 * slice of the brand trio (orange/pink/purple), so these read as DesiHub
 * rather than an arbitrary palette — per brief, "do not overuse" the three
 * accents means restrained use, not introducing off-brand hues instead.
 */
const BANNER_GRADIENTS: [string, string][] = [
  ['#FF8A00', '#F0446F'], // orange → pink
  ['#F0446F', '#7B35D6'], // pink → purple
  ['#7B35D6', '#FF8A00'], // purple → orange
  ['#FFA640', '#F0446F'], // light orange → pink
  ['#F0446F', '#9B5EE0'], // pink → light purple
  ['#7B35D6', '#F7A94D'], // purple → light orange
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

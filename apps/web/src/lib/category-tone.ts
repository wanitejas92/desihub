import type { EventCategory } from '@desihub/shared';
import { categoryPalette, type CategoryHue } from '@desihub/ui-tokens';

/**
 * Which of the six designed hues each category wears.
 *
 * Categories used to collapse onto the three *brand* accents, which is why
 * the site read as a wall of orange/pink/purple: the colour that meant
 * "this is the action" was also the colour that meant "this is a comedy
 * night". Those jobs are now separate. Saffron is the accent and appears
 * only on things you can act on; these six identify, the way a transit
 * map's line colours do, and deliberately avoid the orange band so the two
 * can never be confused.
 *
 * Pairs are grouped by feel rather than spread evenly — Garba and Holi are
 * both riots of colour, temple and cultural events both sit quieter — so
 * the palette carries a little meaning rather than being a lookup table.
 */
export type { CategoryHue };

export const CATEGORY_HUE: Record<EventCategory, CategoryHue> = {
  concert: 'indigo',
  cultural: 'indigo',
  party: 'plum',
  holi: 'plum',
  garba_dandiya: 'rose',
  diwali: 'violet',
  temple: 'violet',
  comedy: 'ocean',
  family: 'ocean',
  networking: 'ocean',
  food: 'jade',
  workshop: 'jade',
};

/** Solid identity colour — theme-aware via the CSS variable. */
export function categoryColorVar(category: EventCategory): string {
  return `var(--category-${CATEGORY_HUE[category]})`;
}

/**
 * Literal hex, for the one place a CSS variable cannot reach: SVG fallback
 * art rendered to a data URI on the server, which has no access to the
 * document's custom properties.
 */
export function categoryHex(category: EventCategory): string {
  return categoryPalette[CATEGORY_HUE[category]].base;
}

/** Back-compat alias — several call sites still import the old name. */
export const CATEGORY_TONE = CATEGORY_HUE;

import type { EventCategory } from '@desihub/shared';

/**
 * Every category collapses onto one of the three brand tones — used
 * anywhere a category needs a colour without inventing a 12-hue palette
 * (fallback card art, category nav, browse page headers).
 */
export type CategoryTone = 'orange' | 'pink' | 'purple';

export const TONE_ACCENT: Record<CategoryTone, string> = {
  orange: '#FF8A00',
  pink: '#F0446F',
  purple: '#7B35D6',
};

export const TONE_SOFT: Record<CategoryTone, string> = {
  orange: '#FFF2E3',
  pink: '#FFF0F3',
  purple: '#F3EEFF',
};

export const CATEGORY_TONE: Record<EventCategory, CategoryTone> = {
  concert: 'orange',
  garba_dandiya: 'orange',
  diwali: 'orange',
  food: 'orange',
  party: 'pink',
  holi: 'pink',
  comedy: 'pink',
  family: 'pink',
  temple: 'purple',
  cultural: 'purple',
  workshop: 'purple',
  networking: 'purple',
};

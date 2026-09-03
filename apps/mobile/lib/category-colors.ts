import type { EventCategory } from '@desihub/shared';

/** Category gradient pairs for fallback cards — matches the web generator. */
export const CATEGORY_COLORS: Record<EventCategory, [string, string]> = {
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

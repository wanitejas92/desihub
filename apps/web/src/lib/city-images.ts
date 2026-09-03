import type { City } from '@desihub/shared';

/**
 * Real photo per city, keyed by name. Empty today — Phase 1 has no admin
 * upload UI yet, so there's nowhere for an operator to set these. A city
 * with no entry here renders the designed gradient tile instead; dropping a
 * URL in (by hand now, via an admin portal later — same shape either way)
 * is all a future upload flow needs to do, no component changes required.
 */
export const CITY_IMAGES: Partial<Record<City, string>> = {};

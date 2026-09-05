import type { City } from '../constants';

/**
 * One interface, two implementations — the same split banners, listings and
 * accounts use. City names and event counts are computed live from real
 * event data elsewhere; this repository only answers "does this city have a
 * cover photo, and where is it" so Popular Cities can render a real photo
 * instead of the designed gradient fallback where one has been set.
 */
export interface CityImageRepository {
  /** Map of city name to its cover photo URL — only cities with one set appear. */
  listAll(): Promise<Partial<Record<City, string>>>;
}

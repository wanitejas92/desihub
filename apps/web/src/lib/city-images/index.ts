import { MockCityImageRepository, type CityImageRepository } from '@desihub/shared';
import { hasSupabase } from '../data';

/** Same adapter split as events, banners and accounts. */
let cached: CityImageRepository | null = null;

export async function getCityImageRepository(): Promise<CityImageRepository> {
  if (cached) return cached;
  if (hasSupabase()) {
    const [{ SupabaseCityImageRepository }, { createClient }] = await Promise.all([
      import('./supabase-city-image-repository'),
      import('../supabase/server'),
    ]);
    cached = new SupabaseCityImageRepository(await createClient());
  } else {
    cached = new MockCityImageRepository();
  }
  return cached;
}

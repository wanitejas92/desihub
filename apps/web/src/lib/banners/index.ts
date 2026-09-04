import { MockBannerRepository, type BannerRepository } from '@desihub/shared';
import { hasSupabase } from '../data';

/** Same adapter split as events, accounts and orders. */
let cached: BannerRepository | null = null;

export async function getBannerRepository(): Promise<BannerRepository> {
  if (cached) return cached;
  if (hasSupabase()) {
    const [{ SupabaseBannerRepository }, { createClient }] = await Promise.all([
      import('./supabase-banner-repository'),
      import('../supabase/server'),
    ]);
    cached = new SupabaseBannerRepository(await createClient());
  } else {
    cached = new MockBannerRepository();
  }
  return cached;
}

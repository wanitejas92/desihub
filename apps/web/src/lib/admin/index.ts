import { hasSupabase } from '@/lib/data';
import type { AdminRepository } from './repository';

/**
 * The admin portal is Supabase-only. There is no mock implementation on
 * purpose: moderation is about writes against real rows, and a fake one would
 * let an admin "approve" something into a store that resets on reload. When
 * Supabase is absent the pages say so plainly instead.
 */
export async function getAdminRepository(): Promise<AdminRepository | null> {
  if (!hasSupabase()) return null;
  const [{ AdminRepository: Repo }, { createClient }] = await Promise.all([
    import('./repository'),
    import('@/lib/supabase/server'),
  ]);
  return new Repo(await createClient());
}

export type { AdminStats, AdminUserRow, ReviewEvent, AdminEventInput } from './types';

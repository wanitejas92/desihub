import { cookies } from 'next/headers';
import {
  MockAccountRepository,
  mockGetUser,
  type AccountRepository,
  type AccountUser,
} from '@desihub/shared';
import { hasSupabase } from '@/lib/data';

/**
 * Session resolution, one place. Two modes, chosen by the same rule the
 * listings layer uses:
 *
 * - Supabase configured → real auth. The session lives in the `@supabase/ssr`
 *   cookies and is verified with `auth.getUser()` (which checks the JWT with
 *   the auth server) rather than `getSession()` (which trusts the cookie).
 * - Not configured → the in-memory mock, keyed by a dev cookie, so the whole
 *   account flow is usable and E2E-testable offline.
 *
 * The dev cookie is read **only** in the second branch. In any deployment
 * with Supabase env set it is ignored entirely, so it cannot be forged into
 * a real session.
 */
export const DEV_SESSION_COOKIE = 'desihub_dev_session';

export async function getAccountRepository(): Promise<AccountRepository | null> {
  if (hasSupabase()) {
    const { createClient } = await import('@/lib/supabase/server');
    const db = await createClient();
    const { data, error } = await db.auth.getUser();
    if (error || !data.user) return null;
    const { SupabaseAccountRepository } = await import('./supabase-account-repository');
    return new SupabaseAccountRepository(db, data.user.id, data.user.email ?? '');
  }

  const userId = (await cookies()).get(DEV_SESSION_COOKIE)?.value;
  if (!userId || !mockGetUser(userId)) return null;
  return new MockAccountRepository(userId);
}

export async function getCurrentUser(): Promise<AccountUser | null> {
  const repo = await getAccountRepository();
  return repo ? repo.getUser() : null;
}

/**
 * What every page needs to render account-aware UI: the user plus the two
 * collections, fetched once per request instead of once per card.
 */
export interface AccountSnapshot {
  user: AccountUser | null;
  savedEventIds: string[];
  followedOrganiserIds: string[];
}

export async function getAccountSnapshot(): Promise<AccountSnapshot> {
  const repo = await getAccountRepository();
  if (!repo) return { user: null, savedEventIds: [], followedOrganiserIds: [] };

  const [user, savedEventIds, followedOrganiserIds] = await Promise.all([
    repo.getUser(),
    repo.listSavedEventIds(),
    repo.listFollowedOrganiserIds(),
  ]);
  if (!user) return { user: null, savedEventIds: [], followedOrganiserIds: [] };
  return { user, savedEventIds, followedOrganiserIds };
}

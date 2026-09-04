import { cookies } from 'next/headers';
import { MockOrderRepository, mockGetUser, type OrderRepository } from '@desihub/shared';
import { hasSupabase } from '@/lib/data';
import { DEV_SESSION_COOKIE } from '@/lib/account/session';

/**
 * Repository resolution, same rule as `account/session.ts`: Supabase env
 * present → the real adapter (RLS-gated, `reserve_tickets`/`release_tickets`
 * RPCs); absent → the in-memory mock, keyed by whatever the dev session
 * cookie resolves to. Checkout works signed out too — `userId` is nullable
 * throughout, matching `orders.user_id`.
 */
export async function getOrderRepository(): Promise<OrderRepository> {
  if (hasSupabase()) {
    const { createClient } = await import('@/lib/supabase/server');
    const db = await createClient();
    const { data } = await db.auth.getUser();
    const { SupabaseOrderRepository } = await import('./supabase-order-repository');
    return new SupabaseOrderRepository(db, data.user?.id ?? null);
  }

  const cookieUserId = (await cookies()).get(DEV_SESSION_COOKIE)?.value;
  const userId = cookieUserId && mockGetUser(cookieUserId) ? cookieUserId : null;
  return new MockOrderRepository(userId);
}

import { createClient as createSupabaseClient, type SupabaseClient } from '@supabase/supabase-js';

/**
 * Service-role client — bypasses RLS entirely. Used only in two places that
 * are never reached from the browser: the Stripe webhook (which has no user
 * session to authenticate as) and looking up a guest's order by id for the
 * confirmation screen, where the unguessable order UUID *is* the access
 * check (the same pattern Stripe's own Checkout success URL relies on).
 * `SUPABASE_SERVICE_ROLE_KEY` is deliberately not `NEXT_PUBLIC_*` — it must
 * never ship to the client bundle.
 */
export function hasSupabaseAdmin(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY);
}

let cached: SupabaseClient | null = null;

export function createAdminClient(): SupabaseClient {
  if (cached) return cached;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error('Supabase service role is not configured');
  cached = createSupabaseClient(url, key, { auth: { persistSession: false } });
  return cached;
}

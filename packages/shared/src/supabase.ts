import { createClient, type SupabaseClient } from '@supabase/supabase-js';

/**
 * Shared Supabase client factory. The web and mobile apps wrap this with
 * their own auth storage, but the connection contract lives here so there is
 * one place that knows the env var names.
 */

export interface SupabaseEnv {
  url: string;
  anonKey: string;
}

export function readSupabaseEnv(source: Record<string, string | undefined>): SupabaseEnv {
  const url = source.NEXT_PUBLIC_SUPABASE_URL ?? source.EXPO_PUBLIC_SUPABASE_URL;
  const anonKey = source.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? source.EXPO_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) {
    throw new Error(
      'Missing Supabase env. Set NEXT_PUBLIC_SUPABASE_URL / _ANON_KEY (web) or the EXPO_PUBLIC_ equivalents (mobile).',
    );
  }
  return { url, anonKey };
}

export function createDesiHubClient(env: SupabaseEnv): SupabaseClient {
  return createClient(env.url, env.anonKey, {
    auth: { persistSession: true, autoRefreshToken: true },
  });
}

export type { SupabaseClient };

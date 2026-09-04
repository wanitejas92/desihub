'use client';

import { createBrowserClient } from '@supabase/ssr';
import type { SupabaseClient } from '@supabase/supabase-js';

/**
 * Browser-side Supabase client, for the one thing that genuinely belongs in
 * the browser: uploading a file straight to Storage. Routing a 5MB poster
 * through a server action would hit Next's request body limit and buy
 * nothing — Storage checks the user's JWT and the bucket's RLS either way.
 */
let cached: SupabaseClient | null = null;

export function createClient(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  cached ??= createBrowserClient(url, key);
  return cached;
}

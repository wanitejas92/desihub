import type { EventRepository } from './repository';
import { MockEventRepository } from './mock-repository';

/**
 * Chooses the repository implementation. When Supabase env is configured we use
 * the real adapter; otherwise the in-memory mock keeps the site fully working
 * for local dev, previews and E2E. The rest of the app only ever sees the
 * EventRepository interface.
 */
export function hasSupabase(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}

let cached: EventRepository | null = null;

export async function getRepository(): Promise<EventRepository> {
  if (cached) return cached;
  if (hasSupabase()) {
    const [{ SupabaseEventRepository }, { createClient }] = await Promise.all([
      import('./supabase-repository'),
      import('../supabase/server'),
    ]);
    cached = new SupabaseEventRepository(await createClient());
  } else {
    cached = new MockEventRepository();
  }
  return cached;
}

export type { EventRepository } from './repository';
export * from './types';

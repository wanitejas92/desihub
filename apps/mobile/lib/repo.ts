import { MockEventRepository, type EventRepository } from '@desihub/shared';

/**
 * Phase 1 mobile reads from the shared in-memory catalogue — the same 30 events
 * the web app and seed.sql use. The Supabase-backed adapter for React Native
 * (AsyncStorage auth) lands with accounts in Phase 2; the screens only ever see
 * the EventRepository interface, so that swap won't touch the UI.
 */
let repo: EventRepository | null = null;

export function getRepository(): EventRepository {
  return (repo ??= new MockEventRepository());
}

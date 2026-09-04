import type { ProfileRole } from '../constants';

/**
 * The signed-in user as the app layer needs it — the `profiles` row joined
 * with the auth identity, flattened. Deliberately not the raw Postgres row:
 * screens should not care whether a field came from `auth.users` or
 * `profiles`.
 */
export interface AccountUser {
  id: string;
  email: string;
  name: string | null;
  city: string | null;
  languages: string[];
  notificationPrefs: NotificationPrefs;
  role: ProfileRole;
}

export interface NotificationPrefs {
  push: boolean;
  email: boolean;
  whatsapp: boolean;
}

export interface ProfileUpdate {
  name?: string | null;
  city?: string | null;
  languages?: string[];
  notificationPrefs?: NotificationPrefs;
}

/** Anonymous, per-device collections handed up to the account on sign-in. */
export interface LocalCollections {
  savedEventIds: string[];
  followedOrganiserIds: string[];
}

/**
 * Everything the app needs for the *currently signed-in* user. Sign-in and
 * sign-out are deliberately not here: they are session operations that need
 * cookies and redirects, so they live in the web layer. This interface is
 * only ever constructed once a user is known.
 *
 * One interface, two implementations — the same split the listings layer
 * uses: a Supabase adapter (production, enforced by RLS) and an in-memory
 * mock (dev/offline/E2E, no Docker required).
 */
export interface AccountRepository {
  getUser(): Promise<AccountUser | null>;
  updateProfile(update: ProfileUpdate): Promise<AccountUser>;
  listSavedEventIds(): Promise<string[]>;
  setSaved(eventId: string, saved: boolean): Promise<void>;
  listFollowedOrganiserIds(): Promise<string[]>;
  setFollowing(organiserId: string, following: boolean): Promise<void>;
  /** Folds anonymous device collections into the account. Idempotent. */
  mergeLocal(local: LocalCollections): Promise<void>;
}

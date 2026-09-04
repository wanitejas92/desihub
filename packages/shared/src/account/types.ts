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
  /** Event categories the user cares about — drives recommendations and the email digest. */
  interests: string[];
  notificationPrefs: NotificationPrefs;
  role: ProfileRole;
}

/**
 * Only `email` is real: it is the one channel DesiHub can actually deliver
 * to with just an email address on file. `push` and `whatsapp` were stored
 * preferences with no delivery mechanism behind them (no service-worker
 * subscription, no phone number on the profile) — dead toggles that looked
 * like they did something. Kept as optional so old rows with those keys
 * still parse; nothing in the app reads them anymore.
 */
export interface NotificationPrefs {
  email: boolean;
  push?: boolean;
  whatsapp?: boolean;
}

export interface ProfileUpdate {
  name?: string | null;
  city?: string | null;
  languages?: string[];
  interests?: string[];
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

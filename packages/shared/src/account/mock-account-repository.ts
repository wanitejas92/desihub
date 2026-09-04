import type {
  AccountRepository,
  AccountUser,
  LocalCollections,
  NotificationPrefs,
  ProfileUpdate,
} from './types';

/**
 * In-memory accounts for dev/offline/E2E — the same role `MockEventRepository`
 * plays for listings. It is selected only when Supabase env is absent, so it
 * can never stand in for real auth in a configured deployment.
 *
 * State lives in module memory: it survives navigation within a running
 * server but not a restart, which is the honest limit of a mock (the mock
 * listings repository makes the same trade for its writes).
 */

interface MockAccount {
  user: AccountUser;
  saved: Set<string>;
  follows: Set<string>;
}

/**
 * Parked on `globalThis` rather than in a module-level `const`.
 *
 * Next.js bundles server actions and the RSC render into separate server
 * bundles, and each bundle gets its own copy of an imported module — so a
 * plain module-level Map means the action writes to one store and the layout
 * reads from another, and the user appears signed out immediately after
 * signing in. (Verified: that is exactly what happened.) A global keyed store
 * is the same escape hatch the Prisma-client-in-dev pattern uses.
 */
const STORE_KEY = Symbol.for('desihub.mockAccounts');
const globalStore = globalThis as typeof globalThis & {
  [STORE_KEY]?: Map<string, MockAccount>;
};
const accounts: Map<string, MockAccount> = (globalStore[STORE_KEY] ??= new Map<
  string,
  MockAccount
>());

const DEFAULT_PREFS: NotificationPrefs = { push: true, email: true, whatsapp: false };

/**
 * A stable, well-formed UUID per email, so the same address is the same
 * account across server restarts and across E2E runs — a random id would
 * make the mock's behaviour unreproducible.
 */
export function mockUserIdFor(email: string): string {
  const normalised = email.trim().toLowerCase();
  let h1 = 0x811c9dc5;
  let h2 = 0x01000193;
  for (let i = 0; i < normalised.length; i++) {
    h1 = Math.imul(h1 ^ normalised.charCodeAt(i), 0x01000193) >>> 0;
    h2 = Math.imul(h2 + normalised.charCodeAt(i) * (i + 1), 0x85ebca6b) >>> 0;
  }
  let state = (h1 ^ h2) >>> 0 || 0x9e3779b9;
  const hex: string[] = [];
  for (let i = 0; i < 32; i++) {
    state ^= state << 13;
    state >>>= 0;
    state ^= state >>> 17;
    state ^= state << 5;
    state >>>= 0;
    hex.push((state & 0xf).toString(16));
  }
  hex[12] = '4'; // version
  hex[16] = ((parseInt(hex[16]!, 16) & 0x3) | 0x8).toString(16); // variant
  const s = hex.join('');
  return `${s.slice(0, 8)}-${s.slice(8, 12)}-${s.slice(12, 16)}-${s.slice(16, 20)}-${s.slice(20)}`;
}

/** Creates the account on first sign-in, returns the existing one after that. */
export function mockSignIn(email: string): AccountUser {
  const id = mockUserIdFor(email);
  const existing = accounts.get(id);
  if (existing) return existing.user;

  const user: AccountUser = {
    id,
    email: email.trim().toLowerCase(),
    name: null,
    city: null,
    languages: [],
    notificationPrefs: { ...DEFAULT_PREFS },
    role: 'attendee',
  };
  accounts.set(id, { user, saved: new Set(), follows: new Set() });
  return user;
}

export function mockGetUser(userId: string): AccountUser | null {
  return accounts.get(userId)?.user ?? null;
}

/** Test seam — the module-level store would otherwise leak between tests. */
export function resetMockAccounts(): void {
  accounts.clear();
}

export class MockAccountRepository implements AccountRepository {
  constructor(private readonly userId: string) {}

  private account(): MockAccount | null {
    return accounts.get(this.userId) ?? null;
  }

  async getUser(): Promise<AccountUser | null> {
    return this.account()?.user ?? null;
  }

  async updateProfile(update: ProfileUpdate): Promise<AccountUser> {
    const account = this.account();
    if (!account) throw new Error('No such account');
    const next: AccountUser = {
      ...account.user,
      ...(update.name !== undefined ? { name: update.name } : {}),
      ...(update.city !== undefined ? { city: update.city } : {}),
      ...(update.languages !== undefined ? { languages: [...update.languages] } : {}),
      ...(update.notificationPrefs !== undefined
        ? { notificationPrefs: { ...update.notificationPrefs } }
        : {}),
    };
    account.user = next;
    return next;
  }

  async listSavedEventIds(): Promise<string[]> {
    return [...(this.account()?.saved ?? [])];
  }

  async setSaved(eventId: string, saved: boolean): Promise<void> {
    const account = this.account();
    if (!account) return;
    if (saved) account.saved.add(eventId);
    else account.saved.delete(eventId);
  }

  async listFollowedOrganiserIds(): Promise<string[]> {
    return [...(this.account()?.follows ?? [])];
  }

  async setFollowing(organiserId: string, following: boolean): Promise<void> {
    const account = this.account();
    if (!account) return;
    if (following) account.follows.add(organiserId);
    else account.follows.delete(organiserId);
  }

  async mergeLocal(local: LocalCollections): Promise<void> {
    const account = this.account();
    if (!account) return;
    for (const id of local.savedEventIds) account.saved.add(id);
    for (const id of local.followedOrganiserIds) account.follows.add(id);
  }
}

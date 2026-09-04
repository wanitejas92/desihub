import type { SupabaseClient } from '@supabase/supabase-js';
import type {
  AccountRepository,
  AccountUser,
  LocalCollections,
  NotificationPrefs,
  ProfileUpdate,
} from '@desihub/shared';

const DEFAULT_PREFS: NotificationPrefs = { push: true, email: true, whatsapp: false };

interface ProfileRow {
  id: string;
  name: string | null;
  city: string | null;
  languages: string[] | null;
  notification_prefs: Partial<NotificationPrefs> | null;
  role: AccountUser['role'] | null;
  email: string | null;
}

/**
 * Supabase-backed account data. Every table it touches is protected by the
 * `*_own` RLS policies from `0003_rls.sql` (`user_id = auth.uid()`), so these
 * queries are scoped by the database itself, not by a filter we could forget
 * — the explicit `user_id` predicates below are for index selectivity and
 * readability, not as the security boundary.
 */
export class SupabaseAccountRepository implements AccountRepository {
  /**
   * `authEmail` comes from the already-verified `auth.getUser()` call that
   * decided this repository should exist at all — passing it in avoids a
   * second round trip to the auth server on every profile read.
   */
  constructor(
    private readonly db: SupabaseClient,
    private readonly userId: string,
    private readonly authEmail: string,
  ) {}

  async getUser(): Promise<AccountUser | null> {
    const { data: profile, error } = await this.db
      .from('profiles')
      .select('*')
      .eq('id', this.userId)
      .maybeSingle<ProfileRow>();
    if (error) throw error;

    return {
      id: this.userId,
      email: profile?.email ?? this.authEmail,
      name: profile?.name ?? null,
      city: profile?.city ?? null,
      languages: profile?.languages ?? [],
      notificationPrefs: { ...DEFAULT_PREFS, ...(profile?.notification_prefs ?? {}) },
      role: profile?.role ?? 'attendee',
    };
  }

  async updateProfile(update: ProfileUpdate): Promise<AccountUser> {
    const current = await this.getUser();
    if (!current) throw new Error('Not signed in');

    const next: AccountUser = {
      ...current,
      ...(update.name !== undefined ? { name: update.name } : {}),
      ...(update.city !== undefined ? { city: update.city } : {}),
      ...(update.languages !== undefined ? { languages: update.languages } : {}),
      ...(update.notificationPrefs !== undefined
        ? { notificationPrefs: update.notificationPrefs }
        : {}),
    };

    // Upsert, not update: the `handle_new_user` trigger creates the row on
    // signup, but a profile that predates the trigger (or a restored user)
    // would otherwise silently save nothing.
    const { error } = await this.db.from('profiles').upsert(
      {
        id: this.userId,
        email: next.email,
        name: next.name,
        city: next.city,
        languages: next.languages,
        notification_prefs: next.notificationPrefs,
      },
      { onConflict: 'id' },
    );
    if (error) throw error;
    return next;
  }

  async listSavedEventIds(): Promise<string[]> {
    const { data, error } = await this.db
      .from('saved_events')
      .select('event_id')
      .eq('user_id', this.userId);
    if (error) throw error;
    return (data ?? []).map((row: { event_id: string }) => row.event_id);
  }

  async setSaved(eventId: string, saved: boolean): Promise<void> {
    if (saved) {
      const { error } = await this.db
        .from('saved_events')
        .upsert({ user_id: this.userId, event_id: eventId }, { onConflict: 'user_id,event_id' });
      if (error) throw error;
      return;
    }
    const { error } = await this.db
      .from('saved_events')
      .delete()
      .eq('user_id', this.userId)
      .eq('event_id', eventId);
    if (error) throw error;
  }

  async listFollowedOrganiserIds(): Promise<string[]> {
    const { data, error } = await this.db
      .from('follows')
      .select('organiser_id')
      .eq('user_id', this.userId);
    if (error) throw error;
    return (data ?? []).map((row: { organiser_id: string }) => row.organiser_id);
  }

  async setFollowing(organiserId: string, following: boolean): Promise<void> {
    if (following) {
      const { error } = await this.db
        .from('follows')
        .upsert(
          { user_id: this.userId, organiser_id: organiserId },
          { onConflict: 'user_id,organiser_id' },
        );
      if (error) throw error;
      return;
    }
    const { error } = await this.db
      .from('follows')
      .delete()
      .eq('user_id', this.userId)
      .eq('organiser_id', organiserId);
    if (error) throw error;
  }

  async mergeLocal(local: LocalCollections): Promise<void> {
    if (local.savedEventIds.length > 0) {
      const { error } = await this.db.from('saved_events').upsert(
        local.savedEventIds.map((event_id) => ({ user_id: this.userId, event_id })),
        { onConflict: 'user_id,event_id', ignoreDuplicates: true },
      );
      if (error) throw error;
    }
    if (local.followedOrganiserIds.length > 0) {
      const { error } = await this.db.from('follows').upsert(
        local.followedOrganiserIds.map((organiser_id) => ({ user_id: this.userId, organiser_id })),
        { onConflict: 'user_id,organiser_id', ignoreDuplicates: true },
      );
      if (error) throw error;
    }
  }
}

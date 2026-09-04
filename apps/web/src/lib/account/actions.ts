'use server';

import { cookies, headers } from 'next/headers';
import { revalidatePath } from 'next/cache';
import {
  mergeLocalSchema,
  mockSignIn,
  profileUpdateSchema,
  signInSchema,
  type MergeLocalInput,
} from '@desihub/shared';
import { getRepository, hasSupabase } from '@/lib/data';
import { DEV_SESSION_COOKIE, getAccountRepository } from './session';

export interface AuthState {
  status: 'idle' | 'sent' | 'signed_in' | 'error';
  message?: string;
  fieldErrors?: Record<string, string>;
}

const THIRTY_DAYS = 60 * 60 * 24 * 30;

async function siteOrigin(): Promise<string> {
  if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL;
  const h = await headers();
  const host = h.get('host') ?? 'localhost:3000';
  const proto = h.get('x-forwarded-proto') ?? (host.startsWith('localhost') ? 'http' : 'https');
  return `${proto}://${host}`;
}

export async function signInAction(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const parsed = signInSchema.safeParse({ email: formData.get('email') });
  if (!parsed.success) {
    return {
      status: 'error',
      fieldErrors: { email: parsed.error.issues[0]?.message ?? 'Enter a valid email address' },
    };
  }
  const { email } = parsed.data;

  if (hasSupabase()) {
    const { createClient } = await import('@/lib/supabase/server');
    const db = await createClient();
    const { error } = await db.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${await siteOrigin()}/auth/callback` },
    });
    if (error) {
      return { status: 'error', message: 'Could not send the sign-in link. Please try again.' };
    }
    return {
      status: 'sent',
      message: `Check ${email} for your sign-in link. It expires in an hour.`,
    };
  }

  // Offline/dev: no email is sent and no real identity is created — the
  // sign-in page says so plainly rather than pretending otherwise.
  const user = mockSignIn(email);
  (await cookies()).set(DEV_SESSION_COOKIE, user.id, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: THIRTY_DAYS,
  });
  revalidatePath('/', 'layout');
  return { status: 'signed_in', message: 'Signed in.' };
}

export async function signOutAction(): Promise<void> {
  if (hasSupabase()) {
    const { createClient } = await import('@/lib/supabase/server');
    await (await createClient()).auth.signOut();
  } else {
    (await cookies()).delete(DEV_SESSION_COOKIE);
  }
  revalidatePath('/', 'layout');
}

export async function setSavedAction(eventId: string, saved: boolean): Promise<{ ok: boolean }> {
  const repo = await getAccountRepository();
  if (!repo) return { ok: false };
  await repo.setSaved(eventId, saved);
  revalidatePath('/account/saved');
  return { ok: true };
}

export async function setFollowingAction(
  organiserId: string,
  following: boolean,
): Promise<{ ok: boolean }> {
  const repo = await getAccountRepository();
  if (!repo) return { ok: false };
  await repo.setFollowing(organiserId, following);
  revalidatePath('/account/following');
  return { ok: true };
}

export interface ProfileState {
  status: 'idle' | 'success' | 'error';
  message?: string;
  fieldErrors?: Record<string, string>;
}

export async function updateProfileAction(
  _prev: ProfileState,
  formData: FormData,
): Promise<ProfileState> {
  const repo = await getAccountRepository();
  if (!repo) return { status: 'error', message: 'You are not signed in.' };

  const parsed = profileUpdateSchema.safeParse({
    name: (formData.get('name') as string)?.trim() || undefined,
    city: (formData.get('city') as string) || undefined,
    languages: formData.getAll('languages').map(String),
    notifyEmail: formData.get('notifyEmail') === 'on',
    notifyPush: formData.get('notifyPush') === 'on',
    notifyWhatsapp: formData.get('notifyWhatsapp') === 'on',
  });
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0] ?? '_');
      if (!fieldErrors[key]) fieldErrors[key] = issue.message;
    }
    return { status: 'error', message: 'Please check the highlighted fields.', fieldErrors };
  }

  try {
    await repo.updateProfile({
      name: parsed.data.name ?? null,
      city: parsed.data.city ?? null,
      languages: parsed.data.languages,
      notificationPrefs: {
        email: parsed.data.notifyEmail,
        push: parsed.data.notifyPush,
        whatsapp: parsed.data.notifyWhatsapp,
      },
    });
    revalidatePath('/account');
    return { status: 'success', message: 'Profile saved.' };
  } catch {
    return { status: 'error', message: 'Could not save your profile. Please try again.' };
  }
}

/**
 * Folds the device's anonymous saves/follows into the account. Called once
 * by the client right after sign-in — the promise Phase 1 made when it put
 * these in localStorage instead of behind a login wall.
 */
export async function mergeLocalAction(input: MergeLocalInput): Promise<{ merged: boolean }> {
  const repo = await getAccountRepository();
  if (!repo) return { merged: false };

  const parsed = mergeLocalSchema.safeParse(input);
  if (!parsed.success) return { merged: false };

  const followedOrganiserIds = [...parsed.data.followedOrganiserIds];
  // Pre-accounts builds stored follows by slug; resolve them so nobody loses
  // a follow just because they made it before accounts existed.
  if (parsed.data.followedOrganiserSlugs.length > 0) {
    const catalog = await getRepository();
    const resolved = await Promise.all(
      parsed.data.followedOrganiserSlugs.map((slug) => catalog.getOrganiserBySlug(slug)),
    );
    for (const organiser of resolved) {
      if (organiser && !followedOrganiserIds.includes(organiser.id)) {
        followedOrganiserIds.push(organiser.id);
      }
    }
  }

  await repo.mergeLocal({ savedEventIds: parsed.data.savedEventIds, followedOrganiserIds });
  revalidatePath('/', 'layout');
  return { merged: true };
}

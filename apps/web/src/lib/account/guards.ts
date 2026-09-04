import { redirect } from 'next/navigation';
import type { AccountUser, ProfileRole } from '@desihub/shared';
import { getCurrentUser } from './session';

/**
 * Route-level access control. Three tiers, one place.
 *
 * These guards are the *second* line of defence, not the only one. The real
 * boundary is RLS in Postgres (`is_admin()` / `owns_organiser()` in
 * `0003_rls.sql`): even a caller who forged their way past a guard gets an
 * empty result set from the database. What the guards buy is a correct
 * redirect instead of a page that renders half-empty, and a single place to
 * read when asking "who can reach this route?".
 *
 * Role capabilities:
 *   attendee  — browse, save, buy tickets, submit an event as a *draft*
 *   organiser — the above, plus manage the events of organisers they own
 *   admin     — the above, plus publish/reject anything and manage roles
 *
 * Note that publishing is deliberately *not* an organiser capability: an
 * organiser creates drafts, an admin decides what goes live. That is the
 * whole anti-spam story, and it is enforced in RLS as well as here.
 */

/** Where an unauthenticated visitor is sent, preserving their destination. */
function signInUrl(returnTo: string): string {
  return `/sign-in?next=${encodeURIComponent(returnTo)}`;
}

export async function requireUser(returnTo = '/account'): Promise<AccountUser> {
  const user = await getCurrentUser();
  if (!user) redirect(signInUrl(returnTo));
  return user;
}

/**
 * Requires one of `roles`. A signed-out visitor is sent to sign-in (they may
 * well have the role once authenticated); a signed-in visitor who simply
 * lacks the role is sent home rather than to sign-in, which would loop.
 */
export async function requireRole(
  roles: readonly ProfileRole[],
  returnTo: string,
): Promise<AccountUser> {
  const user = await getCurrentUser();
  if (!user) redirect(signInUrl(returnTo));
  if (!roles.includes(user.role)) redirect('/');
  return user;
}

export async function requireAdmin(returnTo = '/admin'): Promise<AccountUser> {
  return requireRole(['admin'], returnTo);
}

/** Organiser-or-above: admins can reach every organiser surface. */
export async function requireOrganiser(returnTo = '/account'): Promise<AccountUser> {
  return requireRole(['organiser', 'admin'], returnTo);
}

/**
 * Non-redirecting checks, for rendering decisions — showing an "Admin" link in
 * the nav, say. Never use these to protect data; use the guards above and let
 * RLS have the final word.
 */
export function isAdmin(user: AccountUser | null): boolean {
  return user?.role === 'admin';
}

export function isOrganiser(user: AccountUser | null): boolean {
  return user?.role === 'organiser' || user?.role === 'admin';
}

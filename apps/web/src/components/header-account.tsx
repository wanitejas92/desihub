import Link from 'next/link';
import type { AccountUser } from '@desihub/shared';
import { IconHeart, IconUsers, IconShieldCheck } from './ui/icons';

/**
 * The account corner of the header. Signed out it's a plain "Sign in" link
 * — no modal, no interstitial — because everything on DesiHub works without
 * an account and signing in should feel optional, not demanded.
 */
export function HeaderAccount({ user }: { user: AccountUser | null }) {
  if (!user) {
    return (
      <Link
        href="/sign-in"
        aria-label="Sign in"
        className="text-fg-muted hover:bg-bg-subtle hover:text-fg inline-flex h-10 shrink-0 items-center justify-center rounded-md px-2 text-sm font-semibold transition-colors sm:px-3"
      >
        {/* Icon-only on phones, where the header row has no width to spare —
            but never hidden: sign-in has to be reachable on mobile too. */}
        <IconUsers width={18} height={18} className="sm:hidden" />
        <span className="hidden sm:inline">Sign in</span>
      </Link>
    );
  }

  const initial = (user.name ?? user.email).charAt(0).toUpperCase();

  return (
    <>
      {user.role === 'admin' && (
        <Link
          href="/admin"
          aria-label="Admin"
          title="Admin"
          className="text-fg-muted hover:bg-bg-subtle hover:text-accent hidden h-10 w-10 items-center justify-center rounded-full transition-colors sm:inline-flex"
        >
          <IconShieldCheck width={18} height={18} />
        </Link>
      )}
      <Link
        href="/account/saved"
        aria-label="Saved events"
        className="text-fg-muted hover:bg-bg-subtle hover:text-accent-pink hidden h-10 w-10 items-center justify-center rounded-full transition-colors sm:inline-flex"
      >
        <IconHeart width={18} height={18} />
      </Link>
      <Link
        href="/account"
        aria-label={`Account — ${user.name ?? user.email}`}
        title={user.name ?? user.email}
        className="bg-accent-subtle text-accent hover:bg-accent hover:text-accent-fg flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold transition-colors"
      >
        {initial || <IconUsers width={18} height={18} />}
      </Link>
    </>
  );
}

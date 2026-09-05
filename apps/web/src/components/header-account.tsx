import Link from 'next/link';
import type { AccountUser } from '@desihub/shared';
import { IconHeart, IconShieldCheck, IconUsers } from './ui/icons';
import { SignInModal } from './sign-in-modal';

/**
 * The account corner of the header. Signed out, it opens a sign-in modal
 * over the current page rather than navigating to /sign-in — everything on
 * DesiHub works without an account, so signing in should feel like a quick
 * detour, not a trip away from what you were doing.
 */
export function HeaderAccount({ user }: { user: AccountUser | null }) {
  if (!user) {
    return <SignInModal />;
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
        className="text-fg-muted hover:bg-bg-subtle hover:text-like hidden h-10 w-10 items-center justify-center rounded-full transition-colors sm:inline-flex"
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

import { redirect } from 'next/navigation';
import type { ReactNode } from 'react';
import { getCurrentUser } from '@/lib/account/session';
import { AccountTabs } from '@/components/account-tabs';
import { SignOutButton } from '@/components/sign-out-button';

export default async function AccountLayout({ children }: { children: ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect('/sign-in?next=/account');

  return (
    <div className="max-w-content mx-auto px-4 py-8 sm:px-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <span
            aria-hidden
            className="bg-accent-subtle font-display text-accent flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-lg font-bold"
          >
            {(user.name ?? user.email).charAt(0).toUpperCase()}
          </span>
          <div>
            <p className="text-accent text-xs font-bold tracking-widest uppercase">Account</p>
            <h1 className="font-display text-2xl leading-tight font-semibold sm:text-3xl">
              {user.name ?? 'Your account'}
            </h1>
            <p className="text-fg-muted text-sm">{user.email}</p>
          </div>
        </div>
        <SignOutButton />
      </div>

      <AccountTabs />
      <div className="mt-6">{children}</div>
    </div>
  );
}

import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { SignInForm } from '@/components/sign-in-form';
import { getCurrentUser } from '@/lib/account/session';
import { hasSupabase } from '@/lib/data';
import { IconHeart, IconUsers, IconCalendarPlus } from '@/components/ui/icons';

export const metadata: Metadata = {
  title: 'Sign in',
  description: 'Sign in to DesiHub to keep your saved events and followed organisers in sync.',
};

const PERKS = [
  { Icon: IconHeart, text: 'Your saved events on every device' },
  { Icon: IconUsers, text: 'Follow organisers and keep the list' },
  { Icon: IconCalendarPlus, text: 'Set your city and languages once' },
];

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string; error?: string }>;
}) {
  const [{ next, error }, user] = await Promise.all([searchParams, getCurrentUser()]);
  if (user) redirect('/account');

  // Only same-site paths, so `?next=` can't bounce someone off-site.
  const target = next && next.startsWith('/') && !next.startsWith('//') ? next : '/account';

  return (
    <div className="max-w-content mx-auto grid gap-10 px-4 py-12 sm:px-6 lg:grid-cols-2 lg:items-start">
      <div>
        <p className="text-accent text-xs font-bold tracking-widest uppercase">Account</p>
        <h1 className="font-display mt-1 text-2xl leading-tight font-semibold sm:text-3xl">
          Sign in to DesiHub
        </h1>
        <p className="text-fg-muted mt-2 max-w-prose">
          You never need an account to browse or to save an event on this device. Signing in just
          keeps it all together.
        </p>
        <ul role="list" className="mt-6 space-y-3">
          {PERKS.map(({ Icon, text }) => (
            <li key={text} className="text-fg flex items-center gap-3 text-sm">
              <span
                aria-hidden
                className="bg-accent-subtle text-accent flex h-8 w-8 shrink-0 items-center justify-center rounded-full"
              >
                <Icon width={16} height={16} />
              </span>
              {text}
            </li>
          ))}
        </ul>
      </div>

      <div className="max-w-md lg:justify-self-end">
        {error === 'link' && (
          <p className="bg-error-bg text-error mb-3 rounded-md px-4 py-3 text-sm">
            That sign-in link didn’t work — it may have expired. Request a new one below.
          </p>
        )}
        <SignInForm demoMode={!hasSupabase()} next={target} />
      </div>
    </div>
  );
}

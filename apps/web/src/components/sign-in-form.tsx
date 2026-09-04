'use client';

import { useActionState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { signInAction, type AuthState } from '@/lib/account/actions';
import { Button } from './ui/button';
import { IconCheckCircle } from './ui/icons';

const initial: AuthState = { status: 'idle' };

/**
 * Email-only sign-in. No password to forget, no social buttons that hand a
 * third party the guest list — a link to the address we'd email events to
 * anyway.
 */
export function SignInForm({ demoMode, next }: { demoMode: boolean; next: string }) {
  const [state, action, pending] = useActionState(signInAction, initial);
  const router = useRouter();

  // Demo mode signs in immediately; there is no email round trip to wait for.
  useEffect(() => {
    if (state.status === 'signed_in') {
      router.replace(next as never);
      router.refresh();
    }
  }, [state.status, next, router]);

  if (state.status === 'sent') {
    return (
      <div className="border-border bg-surface shadow-elevation rounded-lg border p-6 text-center">
        <IconCheckCircle className="text-success mx-auto" width={28} height={28} />
        <h2 className="font-display text-fg mt-3 text-lg font-semibold">Check your inbox</h2>
        <p className="text-fg-muted mt-1 text-sm">{state.message}</p>
      </div>
    );
  }

  return (
    <form
      action={action}
      className="border-border bg-surface shadow-elevation rounded-lg border p-6"
    >
      <label htmlFor="email" className="text-fg block text-sm font-semibold">
        Email address
      </label>
      <input
        id="email"
        name="email"
        type="email"
        required
        autoComplete="email"
        inputMode="email"
        placeholder="you@email.com"
        aria-invalid={Boolean(state.fieldErrors?.email)}
        className="input mt-2 w-full"
      />
      {state.fieldErrors?.email && (
        <p className="text-error mt-1 text-sm">{state.fieldErrors.email}</p>
      )}
      {state.status === 'error' && state.message && (
        <p className="text-error mt-2 text-sm">{state.message}</p>
      )}

      <Button type="submit" disabled={pending} className="mt-4 w-full">
        {pending ? 'One moment…' : demoMode ? 'Continue' : 'Email me a sign-in link'}
      </Button>

      <p className="text-fg-subtle mt-3 text-xs">
        {demoMode
          ? 'Demo mode: this build has no email backend configured, so you are signed straight in and your account lives in this server’s memory only.'
          : 'We’ll email you a one-time link. No password to remember.'}
      </p>
    </form>
  );
}

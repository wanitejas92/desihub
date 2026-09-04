'use client';

import { useActionState, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  signInAction,
  signInWithPasswordAction,
  signUpWithPasswordAction,
  type AuthState,
} from '@/lib/account/actions';
import { Button } from './ui/button';
import { IconCheckCircle } from './ui/icons';

const initial: AuthState = { status: 'idle' };

type Mode = 'magic-link' | 'password';
type PasswordIntent = 'signin' | 'signup';

/**
 * One primary form, not three equal-weight tabs. Magic link is the default —
 * it matches the page's own pitch ("you never need an account") — with
 * password sign-in/sign-up as an opt-in secondary path via text links below
 * the card, rather than a same-height tab strip. Fewer top-level choices,
 * and a returning password user is one click away instead of three.
 */
export function SignInForm({ demoMode, next }: { demoMode: boolean; next: string }) {
  const [mode, setMode] = useState<Mode>('magic-link');
  const [passwordIntent, setPasswordIntent] = useState<PasswordIntent>('signin');
  const [state, action, pending] = useActionState(
    mode === 'magic-link'
      ? signInAction
      : passwordIntent === 'signin'
        ? signInWithPasswordAction
        : signUpWithPasswordAction,
    initial,
  );
  const router = useRouter();

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
    <div className="space-y-4">
      <form
        action={action}
        className="border-border bg-surface shadow-elevation rounded-lg border p-6"
      >
        {mode === 'magic-link' ? (
          <div>
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
              {pending ? 'Sending...' : demoMode ? 'Continue' : 'Send magic link'}
            </Button>
            <p className="text-fg-subtle mt-3 text-xs">
              {demoMode
                ? 'Demo mode: instant sign-in, no email needed.'
                : "We'll email you a one-time link. No password to remember."}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="text-fg block text-sm font-semibold">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                autoComplete="email"
                placeholder="you@email.com"
                aria-invalid={Boolean(state.fieldErrors?.email)}
                className="input mt-2 w-full"
              />
              {state.fieldErrors?.email && (
                <p className="text-error mt-1 text-sm">{state.fieldErrors.email}</p>
              )}
            </div>
            <div>
              <label htmlFor="password" className="text-fg block text-sm font-semibold">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                autoComplete={passwordIntent === 'signin' ? 'current-password' : 'new-password'}
                placeholder={passwordIntent === 'signin' ? '••••••••' : 'At least 8 characters'}
                aria-invalid={Boolean(state.fieldErrors?.password)}
                className="input mt-2 w-full"
              />
              {state.fieldErrors?.password && (
                <p className="text-error mt-1 text-sm">{state.fieldErrors.password}</p>
              )}
            </div>
            {passwordIntent === 'signup' && (
              <div>
                <label htmlFor="confirmPassword" className="text-fg block text-sm font-semibold">
                  Confirm password
                </label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  required
                  autoComplete="new-password"
                  placeholder="••••••••"
                  aria-invalid={Boolean(state.fieldErrors?.confirmPassword)}
                  className="input mt-2 w-full"
                />
                {state.fieldErrors?.confirmPassword && (
                  <p className="text-error mt-1 text-sm">{state.fieldErrors.confirmPassword}</p>
                )}
              </div>
            )}
            {state.status === 'error' && state.message && (
              <p className="text-error text-sm">{state.message}</p>
            )}
            <Button type="submit" disabled={pending} className="w-full">
              {pending
                ? passwordIntent === 'signin'
                  ? 'Signing in...'
                  : 'Creating account...'
                : passwordIntent === 'signin'
                  ? 'Sign in'
                  : 'Create account'}
            </Button>
          </div>
        )}
      </form>

      <p className="text-center text-sm">
        {mode === 'magic-link' ? (
          <button
            type="button"
            onClick={() => setMode('password')}
            className="text-accent font-semibold hover:underline"
          >
            Sign in with a password instead
          </button>
        ) : (
          <>
            <button
              type="button"
              onClick={() => setMode('magic-link')}
              className="text-accent font-semibold hover:underline"
            >
              Use a magic link instead
            </button>
            <span className="text-fg-subtle mx-2">·</span>
            <button
              type="button"
              onClick={() => setPasswordIntent((v) => (v === 'signin' ? 'signup' : 'signin'))}
              className="text-accent font-semibold hover:underline"
            >
              {passwordIntent === 'signin' ? 'Create an account' : 'Sign in instead'}
            </button>
          </>
        )}
      </p>
    </div>
  );
}

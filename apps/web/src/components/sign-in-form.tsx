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

type AuthMethod = 'email-otp' | 'password-signin' | 'password-signup';

/**
 * Sign-in form with multiple options: email OTP, password sign-in, password sign-up.
 * Users can choose their preferred authentication method.
 */
export function SignInForm({ demoMode, next }: { demoMode: boolean; next: string }) {
  const [method, setMethod] = useState<AuthMethod>('email-otp');
  const [state, action, pending] = useActionState(
    method === 'email-otp'
      ? signInAction
      : method === 'password-signin'
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
      <div className="flex gap-2">
        <button
          onClick={() => setMethod('email-otp')}
          className={`flex-1 rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
            method === 'email-otp'
              ? 'bg-accent text-accent-fg'
              : 'border-border bg-surface text-fg-muted hover:text-fg border'
          }`}
        >
          Magic Link
        </button>
        <button
          onClick={() => setMethod('password-signin')}
          className={`flex-1 rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
            method === 'password-signin'
              ? 'bg-accent text-accent-fg'
              : 'border-border bg-surface text-fg-muted hover:text-fg border'
          }`}
        >
          Sign In
        </button>
        <button
          onClick={() => setMethod('password-signup')}
          className={`flex-1 rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
            method === 'password-signup'
              ? 'bg-accent text-accent-fg'
              : 'border-border bg-surface text-fg-muted hover:text-fg border'
          }`}
        >
          Create
        </button>
      </div>

      <form
        action={action}
        className="border-border bg-surface shadow-elevation rounded-lg border p-6"
      >
        {method === 'email-otp' && (
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
        )}

        {method === 'password-signin' && (
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
                autoComplete="current-password"
                placeholder="••••••••"
                aria-invalid={Boolean(state.fieldErrors?.password)}
                className="input mt-2 w-full"
              />
              {state.fieldErrors?.password && (
                <p className="text-error mt-1 text-sm">{state.fieldErrors.password}</p>
              )}
            </div>
            {state.status === 'error' && state.message && (
              <p className="text-error text-sm">{state.message}</p>
            )}
            <Button type="submit" disabled={pending} className="w-full">
              {pending ? 'Signing in...' : 'Sign in'}
            </Button>
          </div>
        )}

        {method === 'password-signup' && (
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
                autoComplete="new-password"
                placeholder="At least 8 characters"
                aria-invalid={Boolean(state.fieldErrors?.password)}
                className="input mt-2 w-full"
              />
              {state.fieldErrors?.password && (
                <p className="text-error mt-1 text-sm">{state.fieldErrors.password}</p>
              )}
            </div>
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
            {state.status === 'error' && state.message && (
              <p className="text-error text-sm">{state.message}</p>
            )}
            <Button type="submit" disabled={pending} className="w-full">
              {pending ? 'Creating account...' : 'Create account'}
            </Button>
          </div>
        )}
      </form>
    </div>
  );
}

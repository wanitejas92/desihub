'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/browser';
import { IconAlertCircle } from './ui/icons';

/**
 * Redirect-based OAuth: clicking this sends the browser to Google, which
 * sends it back to /auth/callback with a `code` that route already knows
 * how to exchange (the same PKCE flow the magic-link email uses).
 *
 * Gated behind NEXT_PUBLIC_GOOGLE_AUTH_ENABLED rather than just "Supabase is
 * configured": a Supabase project with no Google provider set up rejects
 * this with a 400 (`Unsupported provider: provider is not enabled`), and a
 * button that reliably errors is worse than no button. Flip the env var on
 * once a Google provider with real OAuth client credentials is configured
 * in the Supabase dashboard (Authentication → Providers → Google) — that
 * step happens outside this codebase.
 */
export function GoogleSignInButton({ next }: { next: string }) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();
  const enabled = process.env.NEXT_PUBLIC_GOOGLE_AUTH_ENABLED === 'true';

  if (!supabase || !enabled) return null;

  async function handleClick() {
    setError(null);
    setPending(true);
    const { error: authError } = await supabase!.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
      },
    });
    // A redirect on success replaces this page, so only the failure path
    // ever reaches here — leaving the button stuck on "Redirecting…" with
    // no feedback on error would look broken rather than say what happened.
    if (authError) {
      setError(authError.message);
      setPending(false);
    }
  }

  return (
    <div>
      <button
        type="button"
        onClick={handleClick}
        disabled={pending}
        className="border-border bg-surface text-fg hover:bg-bg-subtle inline-flex h-12 w-full items-center justify-center gap-3 rounded-lg border text-sm font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-60"
      >
        <GoogleMark />
        {pending ? 'Redirecting…' : 'Sign in with Google'}
      </button>
      {error && (
        <p role="alert" className="text-error mt-1.5 flex items-center gap-1 text-xs">
          <IconAlertCircle width={13} height={13} className="shrink-0" />
          {error}
        </p>
      )}
    </div>
  );
}

function GoogleMark() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden>
      <path
        fill="#4285F4"
        d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.91c1.7-1.57 2.69-3.88 2.69-6.62Z"
      />
      <path
        fill="#34A853"
        d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.91-2.26c-.81.54-1.84.86-3.05.86-2.35 0-4.34-1.58-5.05-3.71H.94v2.33A9 9 0 0 0 9 18Z"
      />
      <path
        fill="#FBBC05"
        d="M3.95 10.71a5.4 5.4 0 0 1 0-3.42V4.96H.94a9 9 0 0 0 0 8.08l3.01-2.33Z"
      />
      <path
        fill="#EA4335"
        d="M9 3.58c1.32 0 2.51.46 3.44 1.35l2.58-2.58C13.46.89 11.43 0 9 0A9 9 0 0 0 .94 4.96l3.01 2.33C4.66 5.16 6.65 3.58 9 3.58Z"
      />
    </svg>
  );
}

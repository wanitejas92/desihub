'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { usePathname } from 'next/navigation';
import { IconUsers, IconX } from './ui/icons';
import { GoogleSignInButton } from './google-sign-in-button';
import { SignInForm } from './sign-in-form';
import { createClient } from '@/lib/supabase/browser';

/**
 * Sign-in as an overlay on top of whatever page you're on, not a
 * navigation away from it — closing it (or signing in) leaves you exactly
 * where you were. Trigger and panel share one component, portalled to
 * <body> for the same reason MobileNav is: the header's `backdrop-blur`
 * establishes a CSS containing block that would otherwise trap a `fixed`
 * child inside the header's own box instead of the viewport.
 */
export function SignInModal() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const demoMode = !createClient();
  const googleAuthEnabled = process.env.NEXT_PUBLIC_GOOGLE_AUTH_ENABLED === 'true';
  const showDivider = !demoMode && googleAuthEnabled;

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Sign in"
        // A filled circle on a phone, per the reference — a bare outline glyph
        // floating at the edge of the bar reads as an icon nobody styled.
        // From `sm` up it becomes a labelled "Sign in" button, where there is
        // room for the word and the word is clearer than any avatar.
        className="bg-bg-subtle text-fg-muted hover:bg-surface-hover hover:text-fg border-border inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border text-sm font-semibold transition-colors sm:w-auto sm:rounded-md sm:border-0 sm:bg-transparent sm:px-3"
      >
        <IconUsers width={18} height={18} className="sm:hidden" />
        <span className="hidden sm:inline">Sign in</span>
      </button>

      {open &&
        createPortal(
          <div
            className="fixed inset-0 z-50 flex items-end justify-center sm:items-center"
            role="dialog"
            aria-modal="true"
            aria-label="Sign in to DesiHub"
          >
            <button
              type="button"
              aria-label="Close"
              onClick={() => setOpen(false)}
              className="animate-nav-scrim absolute inset-0 bg-black/40"
            />

            <div className="animate-modal-sheet bg-surface relative w-full max-w-sm rounded-t-2xl p-6 shadow-2xl sm:rounded-2xl">
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close"
                className="text-fg-muted hover:bg-bg-subtle hover:text-fg absolute top-4 right-4 inline-flex h-9 w-9 items-center justify-center rounded-full transition-colors"
              >
                <IconX width={18} height={18} />
              </button>

              <h2 className="font-display text-fg pr-8 text-xl font-semibold">
                Sign in to DesiHub
              </h2>
              <p className="text-fg-muted mt-1.5 text-sm">
                You never need an account to browse — signing in just keeps your saved events and
                followed organisers in sync across devices.
              </p>

              {googleAuthEnabled && (
                <div className="mt-5">
                  <GoogleSignInButton next={pathname} />
                </div>
              )}

              {showDivider && (
                <div className="my-5 flex items-center gap-3">
                  <div className="border-border flex-1 border-t" />
                  <span className="text-fg-subtle text-xs font-semibold uppercase">or</span>
                  <div className="border-border flex-1 border-t" />
                </div>
              )}

              <div className={!showDivider ? 'mt-5' : ''}>
                <SignInForm demoMode={demoMode} next={pathname} onSuccess={() => setOpen(false)} />
              </div>
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}

'use client';

import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { IconArrowRight } from '@/components/ui/icons';

/**
 * The handover. DesiHub does not take the money for an externally-booked
 * event, and the brief is emphatic that the visitor must never believe
 * otherwise — so we interrupt once, name the destination and show the actual
 * hostname, rather than silently opening a stranger's checkout.
 *
 * The link is a real <a href> underneath: it middle-clicks, right-clicks and
 * copies like any other link, and works with JS disabled. The dialog only
 * intercepts the plain left-click.
 */
export function ExternalBookingButton({
  url,
  label,
  destination,
  compact,
}: {
  url: string;
  label: string;
  /** Who takes the booking — the organiser's name, or a ticketing partner. */
  destination: string;
  compact?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);
  const confirmRef = useRef<HTMLAnchorElement>(null);

  let host: string;
  try {
    host = new URL(url).hostname.replace(/^www\./, '');
  } catch {
    host = destination;
  }

  useEffect(() => {
    if (!open) return;
    confirmRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  return (
    <>
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        // The compact instance lives in the aria-hidden mobile sticky bar. It
        // duplicates the card above for thumb reach, so it must stay out of the
        // tab order — focusable content inside aria-hidden is a real bug.
        tabIndex={compact ? -1 : undefined}
        onClick={(e) => {
          // Let modified clicks through untouched — a confirmation dialog on
          // cmd-click would be a bug, not a safeguard.
          if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
          e.preventDefault();
          setOpen(true);
        }}
        className={
          compact
            ? 'bg-accent text-accent-fg hover:bg-accent-hover inline-flex h-11 shrink-0 items-center justify-center rounded-md px-5 text-sm font-semibold whitespace-nowrap transition-colors duration-150 ease-out active:scale-[0.98]'
            : 'bg-accent text-accent-fg hover:bg-accent-hover flex h-12 w-full items-center justify-center gap-2 rounded-md font-semibold transition-colors duration-150 ease-out active:scale-[0.98]'
        }
      >
        {label}
        {!compact && <IconArrowRight width={16} height={16} />}
      </a>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 backdrop-blur-sm sm:items-center"
          onClick={(e) => {
            if (e.target === e.currentTarget) setOpen(false);
          }}
        >
          <div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="leaving-title"
            className="bg-surface shadow-elevation-lg w-full max-w-sm rounded-2xl p-6 text-left"
          >
            <h2 id="leaving-title" className="font-display text-fg text-lg font-bold">
              You&apos;re leaving DesiHub
            </h2>
            <p className="text-fg-muted mt-2 text-sm leading-relaxed">
              Booking for this event is handled by {destination}. You&apos;ll finish your booking
              and payment on their website.
            </p>
            <p className="text-fg-subtle bg-bg-subtle mt-3 truncate rounded-md px-3 py-2 font-mono text-xs">
              {host}
            </p>

            <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row">
              <Button
                variant="secondary"
                className="flex-1"
                onClick={() => setOpen(false)}
                type="button"
              >
                Cancel
              </Button>
              <a
                ref={confirmRef}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setOpen(false)}
                className="text-accent-fg flex h-12 flex-1 items-center justify-center gap-1.5 rounded-md font-semibold transition-all duration-150 active:scale-[0.98]"
              >
                Continue to booking
                <IconArrowRight width={16} height={16} />
              </a>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

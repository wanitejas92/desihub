'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { CITIES } from '@desihub/shared';
import { IconMenu, IconX, IconMapPin } from './ui/icons';

/**
 * Below `lg` the primary nav (Categories/Venues/Organisers/About/Contact) has
 * nowhere to live — it's hidden with no replacement. This is that
 * replacement: a right-side sheet. Trigger and panel share one client
 * component so the header itself can stay a server component.
 */
export function MobileNav({ navItems }: { navItems: readonly { href: string; label: string }[] }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

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
        aria-label="Open menu"
        aria-expanded={open}
        className="text-fg-muted hover:bg-bg-subtle hover:text-fg inline-flex h-10 w-10 items-center justify-center rounded-full transition-colors lg:hidden"
      >
        <IconMenu width={20} height={20} />
      </button>

      {open &&
        createPortal(
          // Portalled to <body>: the header's `backdrop-blur` establishes a
          // containing block for `position: fixed` descendants (per the CSS
          // filter/backdrop-filter spec), which trapped this overlay inside
          // the 64px header bar instead of covering the viewport.
          <div
            className="fixed inset-0 z-50 lg:hidden"
            role="dialog"
            aria-modal="true"
            aria-label="Site menu"
          >
            <button
              type="button"
              aria-label="Close menu"
              onClick={() => setOpen(false)}
              className="animate-nav-scrim absolute inset-0 bg-black/40"
            />

            <div className="animate-nav-sheet bg-surface absolute inset-y-0 right-0 flex w-[85%] max-w-sm flex-col shadow-2xl">
              <div className="border-border flex h-16 shrink-0 items-center justify-between border-b px-4">
                <span className="font-display text-fg text-lg font-semibold">Menu</span>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  aria-label="Close menu"
                  className="text-fg-muted hover:bg-bg-subtle hover:text-fg inline-flex h-10 w-10 items-center justify-center rounded-full transition-colors"
                >
                  <IconX width={20} height={20} />
                </button>
              </div>

              <nav aria-label="Primary" className="flex flex-1 flex-col overflow-y-auto p-2">
                {navItems.map(({ href, label }) => (
                  <Link
                    key={href}
                    href={href}
                    className="text-fg hover:bg-bg-subtle rounded-lg px-4 py-3.5 text-base font-semibold transition-colors"
                  >
                    {label}
                  </Link>
                ))}
              </nav>

              <div className="border-border shrink-0 border-t p-4">
                <label className="border-border bg-bg-subtle text-fg flex h-12 items-center gap-2 rounded-lg border px-3.5 text-sm font-medium">
                  <IconMapPin className="text-fg-muted shrink-0" width={17} height={17} />
                  <span className="sr-only">City</span>
                  <select
                    defaultValue=""
                    onChange={(e) =>
                      router.push(
                        (e.target.value ? `/browse?city=${e.target.value}` : '/browse') as never,
                      )
                    }
                    className="h-full w-full bg-transparent outline-none"
                    aria-label="Filter by city"
                  >
                    <option value="">All Cities</option>
                    {CITIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </>
  );
}

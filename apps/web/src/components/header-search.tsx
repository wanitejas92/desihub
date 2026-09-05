'use client';

import { useRouter } from 'next/navigation';
import { useState, type FormEvent } from 'react';
import { IconSearch, IconX } from './ui/icons';
import { cn } from '@/lib/cn';

/**
 * The header's search box — a real input on every breakpoint, submitted on
 * Enter.
 *
 * On mobile this used to be an icon that linked to /browse, so tapping
 * "search" cost a full page load before you could type anything. Now the
 * field is where the tap lands.
 *
 * `type="search"` rather than `type="text"`: iOS then labels the on-screen
 * keyboard's action key "Search" instead of "Go", which is the difference
 * between the control explaining itself and not.
 */
export function HeaderSearch({ className }: { className?: string }) {
  const router = useRouter();
  const [q, setQ] = useState('');

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    router.push((q ? `/browse?q=${encodeURIComponent(q)}` : '/browse') as never);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className={cn(
        'border-border bg-bg-subtle focus-within:border-accent rounded-pill relative items-center border transition-colors',
        className,
      )}
    >
      <IconSearch
        width={15}
        height={15}
        className="text-fg-subtle pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2"
      />
      <input
        type="search"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search events, artists, venues"
        aria-label="Search events"
        // 44px on a phone, 36px once it is sharing a line with everything
        // else on desktop — a header row cannot afford 44 there.
        // `appearance-none` plus the WebKit pseudo-element: `type="search"`
        // draws its own clear button, which sat next to ours and gave the
        // field two × buttons side by side.
        className="text-fg placeholder:text-fg-subtle rounded-pill h-11 w-full appearance-none bg-transparent py-0 pr-8 pl-9 text-sm outline-none lg:h-9 [&::-webkit-search-cancel-button]:hidden [&::-webkit-search-decoration]:hidden"
      />
      {q && (
        <button
          type="button"
          onClick={() => setQ('')}
          aria-label="Clear search"
          className="text-fg-subtle hover:text-fg absolute top-1/2 right-2.5 -translate-y-1/2"
        >
          <IconX width={13} height={13} />
        </button>
      )}
    </form>
  );
}

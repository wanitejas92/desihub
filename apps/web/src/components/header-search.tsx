'use client';

import { useRouter } from 'next/navigation';
import { useState, type FormEvent } from 'react';
import { IconSearch, IconX } from './ui/icons';
import { cn } from '@/lib/cn';

/**
 * The header's inline search box (desktop) — a real shortcut into /browse,
 * submitted on Enter. Search used to live only in a large box inside the
 * homepage hero, which meant it wasn't reachable at all from /browse, an
 * event page, or anywhere else; the header is the one place that's on
 * every page.
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
        placeholder="Search events"
        aria-label="Search events"
        className="text-fg placeholder:text-fg-subtle rounded-pill h-9 w-full bg-transparent py-0 pr-8 pl-9 text-sm outline-none"
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

'use client';

import { useRouter } from 'next/navigation';
import { useState, type FormEvent } from 'react';
import { IconSearch } from './ui/icons';

/**
 * The hero's search bar — a real shortcut into /browse, not a decoration.
 * Used to also carry city and date dropdowns, but location already lives in
 * the header's city pill and date is the This week/This weekend pills right
 * below in the quick-filter rail — one search box, submitted on Enter, is
 * all this needs to be.
 */
export function HeroSearchBar() {
  const router = useRouter();
  const [q, setQ] = useState('');

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    router.push((q ? `/browse?q=${encodeURIComponent(q)}` : '/browse') as never);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="border-border bg-accent-subtle/50 shadow-elevation-lg relative rounded-2xl border p-1.5"
    >
      <IconSearch
        width={18}
        height={18}
        className="text-fg-subtle pointer-events-none absolute top-1/2 left-5 -translate-y-1/2"
      />
      <input
        type="search"
        value={q}
        onChange={(e) => setQ(e.target.value)}
        placeholder="Search events, artists, venues..."
        aria-label="Search events, artists, venues"
        className="text-fg placeholder:text-fg-subtle h-12 w-full rounded-xl bg-transparent py-0 pr-4 pl-12 text-sm outline-none"
      />
    </form>
  );
}

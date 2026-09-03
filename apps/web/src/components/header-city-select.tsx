'use client';

import { useRouter } from 'next/navigation';
import { CITIES } from '@desihub/shared';

/** DesiPass-style "All Cities" pill in the header — jumps into a city-filtered browse view. */
export function HeaderCitySelect() {
  const router = useRouter();

  return (
    <label className="rounded-pill border-border bg-surface text-fg hover:border-accent focus-within:border-accent hidden h-9 items-center gap-1.5 border pr-2 pl-3 text-sm font-medium sm:inline-flex">
      <span aria-hidden>📍</span>
      <span className="sr-only">City</span>
      <select
        defaultValue=""
        onChange={(e) =>
          router.push((e.target.value ? `/browse?city=${e.target.value}` : '/browse') as never)
        }
        className="h-full max-w-[9rem] truncate bg-transparent outline-none"
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
  );
}

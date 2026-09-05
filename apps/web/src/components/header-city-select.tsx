'use client';

import { useRouter } from 'next/navigation';
import { CITIES } from '@desihub/shared';
import { IconMapPin } from './ui/icons';

/** "All Cities" pill in the header — jumps into a city-filtered browse view. */
export function HeaderCitySelect() {
  const router = useRouter();

  return (
    <label // Accent-outlined, per the reference: the city filter is the one control
      // in the header that changes what the whole page shows, so it should
      // read as active rather than as one more neutral chip.
      className="rounded-pill border-accent/50 bg-surface text-fg hover:border-accent focus-within:border-accent inline-flex h-10 shrink-0 items-center gap-1.5 border pr-2 pl-3 text-sm font-semibold transition-colors lg:h-9"
    >
      <IconMapPin className="text-accent shrink-0" width={16} height={16} />
      <span className="sr-only">City</span>
      <select
        defaultValue=""
        onChange={(e) =>
          router.push((e.target.value ? `/browse?city=${e.target.value}` : '/browse') as never)
        }
        className="h-full max-w-[6rem] truncate bg-transparent outline-none sm:max-w-[9rem]"
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

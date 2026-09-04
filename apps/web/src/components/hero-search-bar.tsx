'use client';

import { useRouter } from 'next/navigation';
import { useState, type FormEvent } from 'react';
import { CITIES } from '@desihub/shared';
import { Button } from './ui/button';
import { IconSearch, IconMapPin, IconCalendar, IconChevronDown } from './ui/icons';

const WHEN_OPTIONS = [
  { value: 'week', label: 'This Week' },
  { value: 'weekend', label: 'This Weekend' },
] as const;

/**
 * The hero's search bar — a full-width card sitting across the seam between
 * the hero copy and the artwork. A real shortcut into /browse, not a
 * decoration: every field maps to a filter the browse page already reads.
 */
export function HeroSearchBar() {
  const router = useRouter();
  const [q, setQ] = useState('');
  const [city, setCity] = useState('');
  const [when, setWhen] = useState('');

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (q) params.set('q', q);
    if (city) params.set('city', city);
    if (when) params.set('when', when);
    const qs = params.toString();
    router.push((qs ? `/browse?${qs}` : '/browse') as never);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="border-border bg-surface shadow-elevation-lg flex flex-col gap-2 rounded-2xl border p-3 sm:gap-0 sm:p-2.5 lg:flex-row lg:items-center"
    >
      <div className="relative flex-1 lg:pr-2">
        <IconSearch
          width={18}
          height={18}
          className="text-fg-subtle pointer-events-none absolute top-1/2 left-4 -translate-y-1/2"
        />
        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search events, artists, venues..."
          aria-label="Search events, artists, venues"
          className="text-fg placeholder:text-fg-subtle h-12 w-full rounded-xl bg-transparent py-0 pr-3 pl-11 text-sm outline-none"
        />
      </div>

      <FieldSelect
        icon={IconMapPin}
        value={city}
        onChange={setCity}
        placeholder="All Netherlands"
        options={CITIES.map((c) => ({ value: c, label: c }))}
      />

      <FieldSelect
        icon={IconCalendar}
        value={when}
        onChange={setWhen}
        placeholder="Any time"
        options={WHEN_OPTIONS.map((o) => ({ value: o.value, label: o.label }))}
      />

      <Button
        type="submit"
        className="h-12 w-full justify-center rounded-xl px-10 lg:w-auto lg:shrink-0"
      >
        Search
      </Button>
    </form>
  );
}

function FieldSelect({
  icon: Icon,
  value,
  onChange,
  placeholder,
  options,
}: {
  icon: typeof IconMapPin;
  value: string;
  onChange: (v: string) => void;
  placeholder: string;
  options: { value: string; label: string }[];
}) {
  return (
    <label className="border-border relative flex h-12 items-center gap-2 border-t pt-1 lg:w-52 lg:shrink-0 lg:border-t-0 lg:border-l lg:pt-0 lg:pl-4">
      <Icon width={18} height={18} className="text-fg-subtle shrink-0" />
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="text-fg h-full w-full appearance-none bg-transparent py-0 pr-6 text-sm outline-none"
        aria-label={placeholder}
      >
        <option value="">{placeholder}</option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <IconChevronDown
        width={14}
        height={14}
        className="text-fg-subtle pointer-events-none absolute right-2"
      />
    </label>
  );
}

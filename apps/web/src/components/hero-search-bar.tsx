'use client';

import { useRouter } from 'next/navigation';
import { useState, type FormEvent } from 'react';
import { CITIES } from '@desihub/shared';
import { Button } from './ui/button';
import { IconSearch, IconMapPin, IconCalendar, IconChevronDown } from './ui/icons';

const WHEN_OPTIONS = [
  { value: 'week', label: 'This week' },
  { value: 'weekend', label: 'This weekend' },
] as const;

/** The hero's own search bar — a compact, real shortcut into /browse, not a decoration. */
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
      className="border-border bg-surface shadow-elevation-lg mt-6 flex max-w-2xl flex-col gap-1 rounded-lg border p-1.5 sm:flex-row sm:items-center sm:gap-0 sm:rounded-full sm:p-1.5"
    >
      <div className="relative flex-1">
        <IconSearch
          width={16}
          height={16}
          className="text-fg-subtle pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2"
        />
        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search events, organisers…"
          aria-label="Search events"
          className="text-fg placeholder:text-fg-subtle h-11 w-full rounded-full bg-transparent py-0 pr-3 pl-10 text-sm outline-none"
        />
      </div>

      <div className="border-border flex flex-wrap items-center gap-x-3 gap-y-2 border-t pt-2 sm:flex-nowrap sm:border-t-0 sm:border-l sm:pt-0 sm:pl-1">
        <FieldSelect
          icon={IconMapPin}
          value={city}
          onChange={setCity}
          placeholder="All cities"
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
          pill
          size="sm"
          className="w-full justify-center sm:w-auto sm:shrink-0"
        >
          Search
        </Button>
      </div>
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
    <label className="text-fg-muted relative inline-flex h-11 shrink-0 items-center gap-1.5 pl-2 text-sm">
      <Icon width={15} height={15} className="text-fg-subtle shrink-0" />
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="text-fg h-full max-w-[7.5rem] appearance-none bg-transparent py-0 pr-5 outline-none sm:max-w-[9rem]"
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
        width={12}
        height={12}
        className="text-fg-subtle pointer-events-none absolute right-0"
      />
    </label>
  );
}

'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useCallback } from 'react';
import { CITIES, EVENT_CATEGORIES, EVENT_CATEGORY_LABELS, EVENT_LANGUAGES } from '@desihub/shared';
import { IconSearch, IconChevronDown } from './ui/icons';

/**
 * URL-driven browse filters. Every change writes to the querystring so filtered
 * views are shareable and back/forward works. No local state — the URL is state.
 */
export function FilterBar() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  const setParam = useCallback(
    (key: string, value: string | null) => {
      const next = new URLSearchParams(params.toString());
      if (value) next.set(key, value);
      else next.delete(key);
      router.replace(`${pathname}?${next.toString()}` as never, { scroll: false });
    },
    [params, pathname, router],
  );

  const current = (key: string) => params.get(key) ?? '';
  const hasFilters = Array.from(params.keys()).some((k) =>
    ['city', 'category', 'language', 'price', 'family', 'from', 'to', 'q'].includes(k),
  );

  return (
    <div className="space-y-3" role="search" aria-label="Filter events">
      <div className="relative">
        <IconSearch className="text-fg-subtle pointer-events-none absolute top-1/2 left-4 -translate-y-1/2" />
        <input
          type="search"
          placeholder="Search events, organisers, tags…"
          defaultValue={current('q')}
          onChange={(e) => setParam('q', e.target.value || null)}
          className="input h-12 pl-11"
          aria-label="Search"
        />
      </div>
      <div className="flex flex-wrap gap-2">
        <Select
          label="City"
          value={current('city')}
          onChange={(v) => setParam('city', v)}
          options={CITIES.map((c) => ({ value: c, label: c }))}
        />
        <Select
          label="Category"
          value={current('category')}
          onChange={(v) => setParam('category', v)}
          options={EVENT_CATEGORIES.map((c) => ({ value: c, label: EVENT_CATEGORY_LABELS[c] }))}
        />
        <Select
          label="Language"
          value={current('language')}
          onChange={(v) => setParam('language', v)}
          options={EVENT_LANGUAGES.map((l) => ({ value: l, label: l }))}
        />
        <Select
          label="Price"
          value={current('price')}
          onChange={(v) => setParam('price', v)}
          options={[
            { value: 'free', label: 'Free' },
            { value: 'paid', label: 'Paid' },
          ]}
        />
        <label className="border-border bg-surface text-fg has-[:checked]:border-accent has-[:checked]:bg-accent-subtle inline-flex h-11 cursor-pointer items-center gap-2 rounded-md border px-4 text-sm font-medium">
          <input
            type="checkbox"
            checked={current('family') === '1'}
            onChange={(e) => setParam('family', e.target.checked ? '1' : null)}
          />
          Family-friendly
        </label>
        {hasFilters && (
          <button
            type="button"
            onClick={() => router.replace(pathname as never, { scroll: false })}
            className="text-accent inline-flex h-11 items-center rounded-md px-4 text-sm font-semibold hover:underline"
          >
            Clear all
          </button>
        )}
      </div>
    </div>
  );
}

function Select({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string | null) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <label className="border-border bg-surface focus-within:border-accent relative inline-flex h-11 items-center rounded-md border text-sm">
      <span className="sr-only">{label}</span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value || null)}
        className="text-fg h-full appearance-none rounded-md bg-transparent py-0 pr-9 pl-3 outline-none"
        aria-label={label}
      >
        <option value="">{label}: any</option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <IconChevronDown
        className="text-fg-subtle pointer-events-none absolute right-3"
        width={14}
        height={14}
      />
    </label>
  );
}

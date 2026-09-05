import type { Metadata } from 'next';
import { Suspense } from 'react';
import type { City, EventCategory } from '@desihub/shared';
import { EVENT_CATEGORY_LABELS, weekDateRange, weekendDateRange } from '@desihub/shared';
import { FilterBar } from '@/components/filter-bar';
import { EventGrid } from '@/components/event-grid';
import { EmptyState } from '@/components/empty-state';
import { getRepository, type EventFilters } from '@/lib/data';
import { CATEGORY_ICON } from '@/lib/category-icons';
import { CATEGORY_TONE, TONE_ACCENT, TONE_SOFT } from '@/lib/category-tone';

type SearchParams = Record<string, string | string[] | undefined>;

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}): Promise<Metadata> {
  const sp = await searchParams;
  const parts: string[] = [];
  if (typeof sp.category === 'string')
    parts.push(EVENT_CATEGORY_LABELS[sp.category as EventCategory] ?? sp.category);
  if (typeof sp.city === 'string') parts.push(`in ${sp.city}`);
  const title = parts.length ? `${parts.join(' ')} events` : 'Browse all events';
  return {
    title,
    description: `${title} for the Desi community in the Netherlands.`,
  };
}

function toFilters(sp: SearchParams): EventFilters {
  const str = (k: string) => (typeof sp[k] === 'string' ? (sp[k] as string) : undefined);
  // `when` is a quick-filter shorthand (home page pills) for a date range that's
  // otherwise expressed as explicit `from`/`to` — it takes priority when present.
  const when = str('when');
  const quickRange =
    when === 'weekend' ? weekendDateRange() : when === 'week' ? weekDateRange() : undefined;
  return {
    search: str('q'),
    city: str('city') as City | undefined,
    category: str('category') as EventCategory | undefined,
    language: str('language'),
    price: str('price') === 'free' ? 'free' : str('price') === 'paid' ? 'paid' : undefined,
    familyFriendly: sp.family === '1',
    dateFrom: quickRange?.from ?? str('from'),
    dateTo: quickRange?.to ?? str('to'),
    includePast: sp.past === '1',
  };
}

export default async function BrowsePage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await searchParams;
  const filters = toFilters(sp);
  const category = typeof sp.category === 'string' ? (sp.category as EventCategory) : undefined;
  const categoryLabel = category ? EVENT_CATEGORY_LABELS[category] : undefined;
  const CategoryIcon = category ? CATEGORY_ICON[category] : null;
  const tone = category ? CATEGORY_TONE[category] : undefined;
  const city = filters.city;

  // The heading is the one place a visitor checks "did my filter actually
  // apply?" — it has to name the city and category picked, not sit on a
  // generic "All events" while the grid below quietly filters underneath it.
  const heading =
    categoryLabel && city ? `${categoryLabel} in ${city}` : (categoryLabel ?? city ?? 'All events');
  const subheading =
    category && city
      ? `Every upcoming ${categoryLabel} event in ${city}.`
      : category
        ? `Every upcoming ${categoryLabel} event, in one place.`
        : city
          ? `Every upcoming event in ${city}.`
          : 'Filter by city, category, language, price and more.';

  return (
    <div className="max-w-content mx-auto px-4 py-8 sm:px-6">
      <div className="flex items-center gap-3">
        {CategoryIcon && tone && (
          <span
            aria-hidden
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg"
            style={{ backgroundColor: TONE_SOFT[tone], color: TONE_ACCENT[tone] }}
          >
            <CategoryIcon width={22} height={22} />
          </span>
        )}
        <div>
          <p className="text-accent text-xs font-bold tracking-widest uppercase">Browse</p>
          <h1 className="font-display text-2xl leading-tight font-semibold sm:text-3xl">
            {heading}
          </h1>
        </div>
      </div>
      <p className="text-fg-muted mt-2">{subheading}</p>

      {/*
        Below `lg` this stays the original single column — filters in a
        horizontal bar, results underneath. At `lg` and up it becomes a
        sidebar layout (filters left, results right, like every real
        ticketing site) purely by reflowing the same two children into a
        grid; neither `FilterBar` nor `Results` changes below the `lg:`
        prefix, so mobile is byte-for-byte what it was.
      */}
      <div className="mt-6 lg:mt-8 lg:grid lg:grid-cols-[260px_minmax(0,1fr)] lg:items-start lg:gap-10">
        <div className="lg:sticky lg:top-24">
          <Suspense fallback={<div className="h-24" />}>
            <FilterBar />
          </Suspense>
        </div>

        <div className="mt-8 lg:mt-0">
          <Suspense key={JSON.stringify(filters)} fallback={<ResultsSkeleton />}>
            <Results filters={filters} />
          </Suspense>
        </div>
      </div>
    </div>
  );
}

async function Results({ filters }: { filters: EventFilters }) {
  const repo = await getRepository();
  const { items, total } = await repo.listEvents(filters);

  if (items.length === 0) {
    return (
      <EmptyState
        title="No events match these filters"
        description="Try removing a filter, or widen your date range. New events are added all the time."
        action={{ href: '/browse', label: 'Clear filters' }}
      />
    );
  }

  return (
    <>
      <p className="text-fg-muted mb-4 text-sm" aria-live="polite">
        {total} {total === 1 ? 'event' : 'events'}
      </p>
      <EventGrid events={items} sidebar />
    </>
  );
}

function ResultsSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-3" aria-hidden>
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="animate-pulse">
          <div className="bg-bg-sunken aspect-[4/3] rounded-lg" />
          <div className="bg-bg-sunken mt-3 h-4 w-3/4 rounded" />
          <div className="bg-bg-sunken mt-2 h-3 w-1/2 rounded" />
        </div>
      ))}
    </div>
  );
}

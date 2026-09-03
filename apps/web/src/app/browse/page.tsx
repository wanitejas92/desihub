import type { Metadata } from 'next';
import { Suspense } from 'react';
import type { City, EventCategory } from '@desihub/shared';
import { EVENT_CATEGORY_LABELS } from '@desihub/shared';
import { FilterBar } from '@/components/filter-bar';
import { EventGrid } from '@/components/event-grid';
import { EmptyState } from '@/components/empty-state';
import { getRepository, type EventFilters } from '@/lib/data';

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
  return {
    search: str('q'),
    city: str('city') as City | undefined,
    category: str('category') as EventCategory | undefined,
    language: str('language'),
    price: str('price') === 'free' ? 'free' : str('price') === 'paid' ? 'paid' : undefined,
    familyFriendly: sp.family === '1',
    dateFrom: str('from'),
    dateTo: str('to'),
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

  return (
    <div className="max-w-content mx-auto px-4 py-8 sm:px-6">
      <h1 className="font-display text-2xl font-semibold sm:text-3xl">Browse events</h1>
      <p className="text-fg-muted mt-1">Filter by city, category, language, price and more.</p>

      <div className="mt-6">
        <Suspense fallback={<div className="h-24" />}>
          <FilterBar />
        </Suspense>
      </div>

      <div className="mt-8">
        <Suspense key={JSON.stringify(filters)} fallback={<ResultsSkeleton />}>
          <Results filters={filters} />
        </Suspense>
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
      <EventGrid events={items} />
    </>
  );
}

function ResultsSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4" aria-hidden>
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="animate-pulse">
          <div className="bg-bg-sunken aspect-[4/5] rounded-md" />
          <div className="bg-bg-sunken mt-3 h-4 w-3/4 rounded" />
          <div className="bg-bg-sunken mt-2 h-3 w-1/2 rounded" />
        </div>
      ))}
    </div>
  );
}

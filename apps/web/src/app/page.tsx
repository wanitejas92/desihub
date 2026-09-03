import Link from 'next/link';
import { EmailCapture } from '@/components/email-capture';
import { EventRail } from '@/components/event-rail';
import { EventGrid } from '@/components/event-grid';
import { SeasonStrip } from '@/components/season-strip';
import { QuickFilters } from '@/components/quick-filters';
import { CategoryTiles } from '@/components/browse-tiles';
import { PopularCities } from '@/components/popular-cities';
import { EmptyState } from '@/components/empty-state';
import { getRepository } from '@/lib/data';

// Revalidate hourly — the season strip and "this weekend" are time-sensitive.
export const revalidate = 3600;

export default async function HomePage() {
  const repo = await getRepository();
  const [weekend, featured, upcoming, cities] = await Promise.all([
    repo.thisWeekend(8),
    repo.featured(8),
    repo.nearYou(undefined, 8),
    repo.popularCities(6),
  ]);

  return (
    <>
      <SeasonStrip />
      <QuickFilters />

      <EventRail
        title="This weekend"
        events={weekend}
        seeAllHref="/browse?when=weekend"
        priorityFirst
        emptyTitle="Nothing this weekend — yet"
        emptyDescription="New events are added all the time. Check what's coming up, or be the first to list one."
      />

      <section className="max-w-content mx-auto px-4 py-6 sm:px-6">
        <div className="mb-4 flex items-baseline justify-between gap-4">
          <h2 className="font-display text-xl font-semibold sm:text-2xl">🔥 Trending now</h2>
          {featured.length > 0 && (
            <Link
              href="/browse"
              className="text-accent shrink-0 text-sm font-semibold hover:underline"
            >
              See all →
            </Link>
          )}
        </div>
        {featured.length > 0 ? (
          <EventGrid events={featured} trending />
        ) : (
          <EmptyState
            title="No trending events right now"
            description="Browse everything that's coming up across the Netherlands."
            action={{ href: '/browse', label: 'Browse all events' }}
          />
        )}
      </section>

      <EventRail
        title="Near you"
        events={upcoming}
        seeAllHref="/browse"
        emptyTitle="No upcoming events listed"
        emptyDescription="Be the first to add one for your city."
      />

      <PopularCities cities={cities} />
      <CategoryTiles />

      <section className="max-w-content mx-auto px-4 py-10 sm:px-6">
        <div className="border-border bg-surface rounded-lg border p-6 sm:p-10">
          <EmailCapture />
        </div>
      </section>
    </>
  );
}

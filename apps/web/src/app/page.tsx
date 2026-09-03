import Link from 'next/link';
import { EmailCapture } from '@/components/email-capture';
import { EventRail } from '@/components/event-rail';
import { EventGrid } from '@/components/event-grid';
import { SeasonStrip } from '@/components/season-strip';
import { QuickFilterRail } from '@/components/quick-filter-rail';
import { CategoryTiles } from '@/components/browse-tiles';
import { PopularCities } from '@/components/popular-cities';
import { EmptyState } from '@/components/empty-state';
import { IconFlame, IconChevronRight } from '@/components/ui/icons';
import { getRepository } from '@/lib/data';

// Revalidate hourly — the season strip and quick filters are time-sensitive.
export const revalidate = 3600;

export default async function HomePage() {
  const repo = await getRepository();
  const [allUpcoming, thisWeek, thisWeekend, freeEvents, featured, upcoming, cities] =
    await Promise.all([
      repo.listEvents({ limit: 12 }),
      repo.thisWeek(12),
      repo.thisWeekend(12),
      repo.listEvents({ price: 'free', limit: 12 }),
      repo.featured(8),
      repo.nearYou(undefined, 8),
      repo.popularCities(6),
    ]);

  return (
    <>
      <SeasonStrip />
      <QuickFilterRail
        eventsByFilter={{
          all: allUpcoming.items,
          week: thisWeek,
          weekend: thisWeekend,
          free: freeEvents.items,
        }}
      />

      <section className="max-w-content mx-auto px-4 py-6 sm:px-6">
        <div className="mb-4 flex items-baseline justify-between gap-4">
          <h2 className="font-display text-fg flex items-center gap-1.5 text-xl font-semibold sm:text-2xl">
            <IconFlame className="text-accent" width={20} height={20} />
            Trending now
          </h2>
          {featured.length > 0 && (
            <Link
              href="/browse"
              className="text-accent inline-flex shrink-0 items-center gap-0.5 text-sm font-semibold hover:underline"
            >
              See all
              <IconChevronRight width={14} height={14} />
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

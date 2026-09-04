import Link from 'next/link';
import { EventRail } from '@/components/event-rail';
import { EventGrid } from '@/components/event-grid';
import { Hero, HeroTrustBadges } from '@/components/hero';
import { PromoCarousel } from '@/components/promo-carousel';
import { QuickFilterRail } from '@/components/quick-filter-rail';
import { CategoryTiles } from '@/components/browse-tiles';
import { FeaturedArtists } from '@/components/featured-artists';
import { CelebrateCulture } from '@/components/celebrate-culture';
import { PopularCities } from '@/components/popular-cities';
import { TopVenues } from '@/components/top-venues';
import { OrganiserCtaBanner } from '@/components/organiser-cta-banner';
import { EmptyState } from '@/components/empty-state';
import { IconFlame, IconChevronRight } from '@/components/ui/icons';
import { getRepository } from '@/lib/data';
import { getBannerRepository } from '@/lib/banners';
import { topVenues } from '@/lib/top-venues';

// Revalidate hourly — the season strip and quick filters are time-sensitive.
export const revalidate = 3600;

export default async function HomePage() {
  const [repo, bannerRepo] = await Promise.all([getRepository(), getBannerRepository()]);
  const banners = await bannerRepo.listActive();
  const [allUpcoming, thisWeek, thisWeekend, freeEvents, featured, upcoming, cities, venuePool] =
    await Promise.all([
      repo.listEvents({ limit: 12 }),
      repo.thisWeek(12),
      repo.thisWeekend(12),
      repo.listEvents({ price: 'free', limit: 12 }),
      repo.featured(8),
      repo.nearYou(undefined, 8),
      repo.popularCities(6),
      repo.listEvents({ limit: 60 }),
    ]);

  return (
    <>
      {/*
        Banners, search, and buttons sized to their natural content height —
        forcing this block to fill the full viewport looked broken on tall
        monitors (huge dead margins, worse when no banner is active). Natural
        sizing keeps it compact and consistent across screen sizes.
      */}
      {banners.length > 0 && (
        <div className="max-w-content mx-auto px-4 py-2 sm:px-6 lg:py-2">
          <PromoCarousel banners={banners} />
        </div>
      )}

      <Hero />
      <HeroTrustBadges />

      <QuickFilterRail
        eventsByFilter={{
          all: allUpcoming.items,
          week: thisWeek,
          weekend: thisWeekend,
          free: freeEvents.items,
        }}
      />

      <section className="max-w-content mx-auto px-4 py-8 sm:px-6">
        <div className="mb-5 flex items-baseline justify-between gap-4">
          <h2 className="font-display text-fg flex items-center gap-1.5 text-lg font-semibold sm:text-xl">
            <IconFlame className="text-accent" width={18} height={18} />
            Trending events
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
          <EventGrid events={featured} />
        ) : (
          <EmptyState
            title="No trending events right now"
            description="Browse everything that's coming up across the Netherlands."
            action={{ href: '/browse', label: 'Browse all events' }}
          />
        )}
      </section>

      <CategoryTiles />

      <EventRail
        title="This weekend"
        events={thisWeekend.length > 0 ? thisWeekend : upcoming}
        seeAllHref="/browse?when=weekend"
        emptyTitle="Nothing listed for this weekend yet"
        emptyDescription="Be the first to add one for your city."
      />

      <PopularCities cities={cities} />
      <FeaturedArtists />
      <CelebrateCulture />
      <TopVenues venues={topVenues(venuePool.items)} />
      <OrganiserCtaBanner />
    </>
  );
}

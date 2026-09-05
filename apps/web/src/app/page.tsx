import Link from 'next/link';
import { EventGrid } from '@/components/event-grid';
import { Hero } from '@/components/hero';
import { CategoryQuickNav } from '@/components/category-quick-nav';
import { CreateEventStrip } from '@/components/create-event-strip';
import { PromoCarousel } from '@/components/promo-carousel';
import { QuickFilterRail } from '@/components/quick-filter-rail';
import { FeaturedOrganisers } from '@/components/featured-organisers';
import { PopularCities } from '@/components/popular-cities';
import { OrganiserCtaBanner } from '@/components/organiser-cta-banner';
import { EmptyState } from '@/components/empty-state';
import { IconFlame, IconCalendar, IconChevronRight } from '@/components/ui/icons';
import { getRepository } from '@/lib/data';
import { getBannerRepository } from '@/lib/banners';
import { getCityImageRepository } from '@/lib/city-images';

// Revalidate hourly — the season strip and quick filters are time-sensitive.
export const revalidate = 3600;

export default async function HomePage() {
  const [repo, bannerRepo, cityImageRepo] = await Promise.all([
    getRepository(),
    getBannerRepository(),
    getCityImageRepository(),
  ]);
  const banners = await bannerRepo.listActive();
  // `dateTo` = today, `includePast` on (which also flips the sort to
  // newest-first) — the same two filters /browse's own "past events" view
  // uses, just capped to a homepage-sized rail here.
  const today = new Date().toISOString().slice(0, 10);
  const [allUpcoming, thisWeek, thisWeekend, freeEvents, featured, cities, cityImages, past] =
    await Promise.all([
      repo.listEvents({ limit: 12 }),
      repo.thisWeek(12),
      repo.thisWeekend(12),
      repo.listEvents({ price: 'free', limit: 12 }),
      repo.featured(8),
      repo.popularCities(6),
      cityImageRepo.listAll(),
      repo.listEvents({ includePast: true, dateTo: today, limit: 8 }),
    ]);

  return (
    <>
      <CategoryQuickNav />
      <CreateEventStrip />

      {banners.length > 0 && (
        <div className="max-w-content mx-auto px-4 py-2 sm:px-6 lg:py-2">
          <PromoCarousel banners={banners} />
        </div>
      )}

      <Hero />

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

      <PopularCities cities={cities} cityImages={cityImages} />
      <FeaturedOrganisers />

      {past.items.length > 0 && (
        <section className="max-w-content mx-auto px-4 py-8 sm:px-6">
          <div className="mb-5 flex items-baseline justify-between gap-4">
            <h2 className="font-display text-fg flex items-center gap-1.5 text-lg font-semibold sm:text-xl">
              <IconCalendar className="text-fg-muted" width={18} height={18} />
              Past events
            </h2>
            <Link
              href={`/browse?past=1&to=${today}`}
              className="text-accent inline-flex shrink-0 items-center gap-0.5 text-sm font-semibold hover:underline"
            >
              See all
              <IconChevronRight width={14} height={14} />
            </Link>
          </div>
          <EventGrid events={past.items} />
        </section>
      )}

      <OrganiserCtaBanner />
    </>
  );
}

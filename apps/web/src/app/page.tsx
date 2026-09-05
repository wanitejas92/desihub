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
import { SectionHeader } from '@/components/section-header';
import { SeasonStrip } from '@/components/season-strip';
import { getRepository } from '@/lib/data';
import { getBannerRepository } from '@/lib/banners';
import { getCityImageRepository } from '@/lib/city-images';
import { currentSeason } from '@desihub/shared';

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

  // The season strip leads with whatever the festival calendar says is on.
  const season = currentSeason();
  const seasonEvents =
    season.key === 'offseason'
      ? []
      : allUpcoming.items.filter((e) => season.featuredCategories.includes(e.category)).slice(0, 4);

  return (
    <>
      <CategoryQuickNav />
      <CreateEventStrip />

      {/* A real <h1>. The page had none at all — the hero had been reduced
          to a one-line text link during an earlier pass, which left the
          homepage with no top-level heading for search engines or screen
          readers, and nothing on the page set at display size. */}
      <section className="max-w-content mx-auto px-4 pt-10 pb-6 sm:px-6 lg:pt-16 lg:pb-10">
        <h1 className="font-display text-fg max-w-[16ch] text-3xl font-bold lg:max-w-[20ch] lg:text-4xl">
          Every Desi night out in the Netherlands.
        </h1>
        <p className="text-fg-muted mt-5 max-w-prose text-base sm:text-lg">
          Concerts, Garba, Diwali, comedy and community nights — found, saved and booked in one
          place.
        </p>
      </section>

      {banners.length > 0 && (
        <div className="max-w-content mx-auto px-4 pb-4 sm:px-6">
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

      <section className="max-w-content mx-auto px-4 py-12 sm:px-6 lg:py-16">
        <SectionHeader
          eyebrow="Selling fast"
          title="Trending events"
          href={featured.length > 0 ? '/browse' : undefined}
        />
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

      <SeasonStrip events={seasonEvents} />

      <PopularCities cities={cities} cityImages={cityImages} />
      <FeaturedOrganisers />

      {past.items.length > 0 && (
        <section className="max-w-content mx-auto px-4 py-12 sm:px-6 lg:py-16">
          <SectionHeader
            eyebrow="Recently"
            title="Past events"
            href={`/browse?past=1&to=${today}`}
          />
          <EventGrid events={past.items} />
        </section>
      )}

      <OrganiserCtaBanner />
    </>
  );
}

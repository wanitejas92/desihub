import Link from 'next/link';
import { EventGrid } from '@/components/event-grid';
import { Hero } from '@/components/hero';
import { CategoryQuickNav } from '@/components/category-quick-nav';
import { PromoCarousel } from '@/components/promo-carousel';
import { QuickFilterRail } from '@/components/quick-filter-rail';
import { FeaturedOrganisers } from '@/components/featured-organisers';
import { PopularCities } from '@/components/popular-cities';
import { OrganiserCtaBanner } from '@/components/organiser-cta-banner';
import { EmptyState } from '@/components/empty-state';
import { IconFlame, IconChevronRight } from '@/components/ui/icons';
import { getRepository } from '@/lib/data';
import { getBannerRepository } from '@/lib/banners';

// Revalidate hourly — the season strip and quick filters are time-sensitive.
export const revalidate = 3600;

export default async function HomePage() {
  const [repo, bannerRepo] = await Promise.all([getRepository(), getBannerRepository()]);
  const banners = await bannerRepo.listActive();
  const [allUpcoming, thisWeek, thisWeekend, freeEvents, featured, cities] = await Promise.all([
    repo.listEvents({ limit: 12 }),
    repo.thisWeek(12),
    repo.thisWeekend(12),
    repo.listEvents({ price: 'free', limit: 12 }),
    repo.featured(8),
    repo.popularCities(6),
  ]);

  return (
    <>
      {/*
        Above-the-fold group: banner, search, buttons. Quick Filters sits
        immediately after with no gap of its own, so on a taller screen any
        leftover space has to come from *this* wrapper, not from the banner
        growing unboundedly or from luck. `lg:min-h` (desktop only — mobile
        scrolls naturally) floors this block at one viewport tall minus the
        header (h-16 + 1px border = 65px); it is NOT flexed or centered, so
        the box stacks top-down as normal and any slack lands as plain space
        *after* the search bar, pushing Quick Filters below the fold on any
        desktop height, not just the four this was tuned against
        (1366×768, 1440×900, 1536×864, 1920×1080). The banner itself
        (see PromoCarousel) still has a real, bounded size per breakpoint —
        this wrapper only closes the gap that size leaves open.
      */}
      <div className="lg:min-h-[calc(100vh-65px)]">
        <CategoryQuickNav />

        {banners.length > 0 && (
          <div className="max-w-content mx-auto px-4 py-2 sm:px-6 lg:py-2">
            <PromoCarousel banners={banners} />
          </div>
        )}

        <Hero />
      </div>

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

      <PopularCities cities={cities} />
      <FeaturedOrganisers />
      <OrganiserCtaBanner />
    </>
  );
}

import Link from 'next/link';
import Image from 'next/image';
import { SectionHeader } from './section-header';
import type { City, CityCount } from '@desihub/shared';
import { categoryHex } from '@/lib/category-tone';

/**
 * Cities as a horizontal rail of portrait cards.
 *
 * This was a six-across grid of short landscape tiles, and it was the
 * weakest block on the homepage: most cities have no cover photo yet, so a
 * row of near-empty boxes with ghost type read as unfinished rather than as
 * a section. Two changes fix that.
 *
 * It scrolls sideways, like every other "browse by" rail on a phone. A grid
 * has to fit every city on screen at once, which forces each tile small and
 * short; a rail lets them be tall portrait cards you actually want to look
 * at, and the row running past the edge is itself the signal that there are
 * more.
 *
 * And the no-photo state is designed rather than empty. The city name sits
 * at display size on a deep tint derived from the same palette the fallback
 * poster art uses, so a city without a photo looks deliberate next to one
 * with — which matters, because that is the common case today.
 */
export function PopularCities({
  cities,
  cityImages,
}: {
  cities: CityCount[];
  cityImages: Partial<Record<City, string>>;
}) {
  if (cities.length === 0) return null;

  return (
    <section id="cities" className="scroll-mt-20 py-12 lg:py-16">
      <div className="max-w-content mx-auto px-4 sm:px-6">
        <SectionHeader eyebrow="By city" title="Popular cities" href="/browse" />
      </div>

      {/* The rail bleeds to the viewport edge on mobile so a card is visibly
          cut off — that half-card is what tells you it scrolls. Inside
          `max-w-content` it would stop short of the edge and look like a
          grid that simply ran out of items. */}
      <ul
        role="list"
        className="scrollbar-hide max-w-content mx-auto flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-1 sm:gap-4 sm:px-6 lg:snap-none"
      >
        {cities.map(({ city, count }, i) => (
          <li key={city} className="w-[44vw] max-w-[190px] shrink-0 snap-start sm:w-[220px]">
            <CityCard city={city} count={count} image={cityImages[city]} index={i} />
          </li>
        ))}
      </ul>
    </section>
  );
}

/** Deep tints for the no-photo state, cycled so adjacent cards differ. */
const TINT_SOURCE = ['concert', 'party', 'garba_dandiya', 'diwali', 'food', 'comedy'] as const;

function CityCard({
  city,
  count,
  image,
  index,
}: {
  city: City;
  count: number;
  image?: string;
  index: number;
}) {
  const tint = categoryHex(TINT_SOURCE[index % TINT_SOURCE.length]!);

  return (
    <Link href={`/browse?city=${encodeURIComponent(city)}`} className="group block">
      <div className="card-media bg-bg-sunken relative aspect-[3/4] overflow-hidden rounded-md">
        {image ? (
          <>
            <Image
              src={image}
              alt=""
              fill
              sizes="(max-width: 640px) 44vw, 220px"
              className="object-cover"
            />
            <span
              aria-hidden
              className="card-scrim absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent"
            />
          </>
        ) : (
          <span
            aria-hidden
            className="absolute inset-0"
            style={{
              backgroundImage: `linear-gradient(160deg, ${tint}, color-mix(in srgb, ${tint} 30%, #0E0C0B))`,
            }}
          />
        )}

        {/* Name and count sit on the artwork in both states, so a card with a
            photo and one without are the same object, not two designs. */}
        <div className="absolute inset-x-0 bottom-0 p-3">
          <p className="font-display text-lg leading-tight font-bold text-white drop-shadow-sm">
            {city}
          </p>
          <p className="mt-0.5 text-xs font-medium text-white/75">
            {count} {count === 1 ? 'event' : 'events'}
          </p>
        </div>
      </div>
    </Link>
  );
}

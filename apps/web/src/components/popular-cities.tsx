import Link from 'next/link';
import { SectionHeader } from './section-header';
import Image from 'next/image';
import type { City, CityCount } from '@desihub/shared';

/** "Popular Cities" tiles — real event counts, photo-or-gradient tile. */
export function PopularCities({
  cities,
  cityImages,
}: {
  cities: CityCount[];
  cityImages: Partial<Record<City, string>>;
}) {
  if (cities.length === 0) return null;

  return (
    <section id="cities" className="max-w-content mx-auto scroll-mt-20 px-4 py-12 sm:px-6 lg:py-16">
      <SectionHeader eyebrow="By city" title="Popular cities" href="/browse" />

      <ul
        role="list"
        className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6"
      >
        {cities.map(({ city, count }) => (
          <li key={city}>
            <CityTile city={city} count={count} image={cityImages[city]} />
          </li>
        ))}
      </ul>
    </section>
  );
}

function CityTile({ city, count, image }: { city: City; count: number; image?: string }) {
  return (
    <Link href={`/browse?city=${encodeURIComponent(city)}`} className="group flex flex-col gap-2">
      <div className="card-media bg-bg-sunken border-border relative aspect-[4/3] overflow-hidden rounded-md border">
        {image ? (
          <Image
            src={image}
            alt=""
            fill
            sizes="(max-width: 640px) 45vw, 200px"
            className="object-cover transition-transform duration-300 ease-out group-hover:scale-[1.04]"
          />
        ) : (
          // No photo yet. Six saturated gradients was the loudest block on
          // the homepage and said nothing about the cities; six near-empty
          // 3:4 tiles with a faint letter replaced it with something that
          // read as unfinished instead. A shorter tile carrying the city
          // name at display size is neither — the type *is* the tile, so
          // there is nothing missing to notice.
          <div
            className="bg-bg-sunken flex h-full w-full items-center justify-center px-2"
            aria-hidden
          >
            <span className="font-display text-fg/25 text-xl leading-none font-bold text-balance">
              {city}
            </span>
          </div>
        )}
      </div>
      <div>
        <p className="font-display text-fg group-hover:text-accent text-base font-bold transition-colors">
          {city}
        </p>
        <p className="text-fg-muted text-sm">
          {count} {count === 1 ? 'event' : 'events'}
        </p>
      </div>
    </Link>
  );
}

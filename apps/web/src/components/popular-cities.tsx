import Link from 'next/link';
import Image from 'next/image';
import type { City, CityCount } from '@desihub/shared';
import { gradientByIndex } from '@/lib/gradient';
import { CITY_IMAGES } from '@/lib/city-images';

/** DesiPass-style "Popular Cities" tiles — real event counts, photo-or-gradient tile. */
export function PopularCities({ cities }: { cities: CityCount[] }) {
  if (cities.length === 0) return null;

  return (
    <section className="max-w-content mx-auto px-4 py-6 sm:px-6">
      <div className="mb-4 flex items-baseline justify-between gap-4">
        <h2 className="font-display text-xl font-semibold sm:text-2xl">Popular cities</h2>
        <Link href="/browse" className="text-accent shrink-0 text-sm font-semibold hover:underline">
          See all →
        </Link>
      </div>

      <ul
        role="list"
        className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6"
      >
        {cities.map(({ city, count }, i) => (
          <li key={city}>
            <CityTile city={city} count={count} index={i} />
          </li>
        ))}
      </ul>
    </section>
  );
}

function CityTile({ city, count, index }: { city: City; count: number; index: number }) {
  const image = CITY_IMAGES[city];
  const [from, to] = gradientByIndex(index);

  return (
    <Link href={`/browse?city=${encodeURIComponent(city)}`} className="group flex flex-col gap-2">
      <div className="bg-bg-sunken relative aspect-[3/4] overflow-hidden rounded-lg">
        {image ? (
          <Image
            src={image}
            alt=""
            fill
            sizes="(max-width: 640px) 45vw, 200px"
            className="object-cover transition-transform duration-300 ease-out group-hover:scale-[1.04]"
          />
        ) : (
          <div
            className="paper-texture h-full w-full transition-transform duration-300 ease-out group-hover:scale-[1.04]"
            style={{ background: `linear-gradient(150deg, ${from}, ${to})` }}
            aria-hidden
          />
        )}
      </div>
      <div>
        <p className="font-display text-fg group-hover:text-accent text-sm font-semibold">{city}</p>
        <p className="text-fg-muted text-xs">
          {count} {count === 1 ? 'event' : 'events'}
        </p>
      </div>
    </Link>
  );
}

import Link from 'next/link';
import { getRepository } from '@/lib/data';
import { monogramAvatar } from '@/lib/artist-avatar';

/**
 * Featured organisers — the people actually listing events on DesiHub.
 * Shows the 6 organisers with the most published events.
 *
 * Populated dynamically as events are listed and published; no fake data.
 */
export async function FeaturedOrganisers() {
  const repo = await getRepository();
  const organisers = await repo.listFeaturedOrganizers(6);

  if (!organisers || organisers.length === 0) return null;

  return (
    <section id="organisers" className="max-w-content mx-auto scroll-mt-20 px-4 py-8 sm:px-6">
      <h2 className="font-display text-fg mb-5 text-lg font-semibold sm:text-xl">
        Featured organisers
      </h2>

      <ul role="list" className="grid grid-cols-3 gap-5 sm:grid-cols-6">
        {organisers.map((org) => (
          <li key={org.id}>
            <Link
              href={`/o/${org.slug}`}
              className="group flex flex-col items-center gap-2.5 text-center"
            >
              <span className="ring-border group-hover:ring-accent relative block h-20 w-20 overflow-hidden rounded-full ring-1 transition-all duration-200 group-hover:ring-2 sm:h-24 sm:w-24">
                {org.logo_url ? (
                  // eslint-disable-next-line @next/next/no-img-element -- organiser-provided logo
                  <img
                    src={org.logo_url}
                    alt={org.name}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                ) : (
                  // Fallback: generated monogram avatar
                  // eslint-disable-next-line @next/next/no-img-element -- generated data-URI SVG
                  <img
                    src={monogramAvatar(org.name)}
                    alt=""
                    aria-hidden
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                )}
              </span>
              <span className="text-fg group-hover:text-accent text-sm font-semibold transition-colors">
                {org.name}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

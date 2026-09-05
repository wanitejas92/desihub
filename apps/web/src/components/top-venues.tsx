import { gradientByIndex } from '@/lib/gradient';
import type { VenueCount } from '@/lib/top-venues';
import { IconMapPin } from './ui/icons';

/** "Top Venues" — ranked by real upcoming-event count, gradient tile since we have no venue photos yet. */
export function TopVenues({ venues }: { venues: VenueCount[] }) {
  if (venues.length === 0) return null;

  return (
    <section id="venues" className="max-w-content mx-auto scroll-mt-20 px-4 py-8 sm:px-6">
      <h2 className="font-display text-lg font-semibold sm:text-xl">Top venues</h2>
      <ul role="list" className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {venues.map((venue, i) => {
          const [from, to] = gradientByIndex(i);
          return (
            <li key={venue.id}>
              <div className="border-border shadow-elevation flex h-full flex-col overflow-hidden rounded-lg border">
                <div
                  className="paper-texture relative flex aspect-[4/3] items-end p-3"
                  style={{ background: `linear-gradient(150deg, ${from}, ${to})` }}
                  aria-hidden
                >
                  <IconMapPin
                    className="text-fg/40 absolute top-3 right-3"
                    width={18}
                    height={18}
                  />
                </div>
                <div className="bg-surface p-3">
                  <p className="text-fg text-sm font-semibold">{venue.name}</p>
                  <p className="text-fg-muted text-xs">
                    {venue.city} · {venue.count} {venue.count === 1 ? 'event' : 'events'}
                  </p>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

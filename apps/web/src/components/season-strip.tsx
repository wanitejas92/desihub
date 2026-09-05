import { currentSeason } from '@desihub/shared';
import type { EventWithRelations } from '@/lib/data';
import { EventCard } from './event-card';
import { categoryColorVar } from '@/lib/category-tone';

/**
 * The season strip — the one module on the homepage that could not belong to
 * any other ticketing site.
 *
 * `packages/shared/src/season.ts` has known the NL Desi festival calendar all
 * along (Holi, Ganesh Chaturthi, Navratri, Diwali, with their real lunar
 * windows) and its own doc comment says it exists to power "the home Season
 * strip" — but nothing ever rendered it. The homepage was a generic
 * chronological feed, which is exactly the "culturally unspecific template"
 * problem: the Desi event year is spiky, and a site that doesn't know it's
 * Navratri week doesn't feel like it's for this audience.
 *
 * It gets its own visual treatment — a sunken full-bleed band with the
 * season's own hue on the rule — so it reads as a moment in the year rather
 * than another row of cards.
 *
 * It renders ONLY when real, submitted events back it. The first version
 * also had an off-season mode that printed the next festival's name over a
 * row of category links, and that was a mistake: a band headed "Ganesh
 * Chaturthi" reads as DesiHub announcing a Ganpati event, when in fact
 * nobody had listed one and the name came from a hard-coded calendar. A
 * listings site inventing entries it does not have is worse than a quiet
 * month, so the strip now disappears instead.
 */
/** Below this it is a handful of events, not a season — show nothing. */
const MIN_EVENTS = 2;

export function SeasonStrip({ events }: { events: EventWithRelations[] }) {
  const season = currentSeason();

  // Two independent reasons to render nothing, and both matter:
  //   - it is not festival season, so there is no season to name;
  //   - it is, but organisers have not listed enough for the band to hold.
  if (season.key === 'offseason' || events.length < MIN_EVENTS) return null;

  const hue = categoryColorVar(season.featuredCategories[0]!);

  return (
    <section className="bg-bg-subtle border-border border-y" aria-labelledby="season-heading">
      <div className="max-w-content mx-auto px-4 py-12 sm:px-6 lg:py-16">
        <div className="flex flex-col gap-2">
          <span className="flex items-center gap-3">
            <span aria-hidden className="h-px w-8" style={{ backgroundColor: hue }} />
            <span className="eyebrow" style={{ color: hue }}>
              Season
            </span>
          </span>
          <h2 id="season-heading" className="font-display text-fg text-2xl font-bold sm:text-3xl">
            {season.name}
          </h2>
          <p className="text-fg-muted max-w-prose text-base">{season.tagline}</p>
        </div>

        <ul
          role="list"
          className="mt-10 grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-4 lg:gap-x-6"
        >
          {events.slice(0, 4).map((event, i) => (
            <li key={event.id}>
              <EventCard event={event} priority={i < 2} />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

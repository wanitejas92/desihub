import Link from 'next/link';
import { currentSeason, nextSeason, EVENT_CATEGORY_LABELS } from '@desihub/shared';
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
 * season's own hue on the rule and the count — so it reads as a moment in
 * the year rather than another row of cards. In the quiet months it becomes
 * a countdown instead of disappearing, because empty months are precisely
 * when a listings site feels dead.
 */
export function SeasonStrip({ events }: { events: EventWithRelations[] }) {
  const season = currentSeason();
  const active = season.key !== 'offseason';
  const upcoming = active ? null : nextSeason();
  const headline = active ? season.name : upcoming!.season.name;
  const categories = (active ? season : upcoming!.season).featuredCategories;

  // A season with nothing on is worse than no strip: it advertises the
  // festival and then shows an empty shelf.
  if (active && events.length === 0) return null;

  const hue = categoryColorVar(categories[0]!);

  return (
    <section className="bg-bg-subtle border-border border-y" aria-labelledby="season-heading">
      <div className="max-w-content mx-auto px-4 py-12 sm:px-6 lg:py-16">
        <div className="flex flex-col gap-2">
          <span className="flex items-center gap-3">
            <span aria-hidden className="h-px w-8" style={{ backgroundColor: hue }} />
            <span className="eyebrow" style={{ color: hue }}>
              {active ? 'Season' : `In ${upcoming!.daysUntil} days`}
            </span>
          </span>
          <h2 id="season-heading" className="font-display text-fg text-2xl font-bold sm:text-3xl">
            {headline}
          </h2>
          <p className="text-fg-muted max-w-prose text-base">
            {active ? season.tagline : upcoming!.season.tagline}
          </p>
        </div>

        {active ? (
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
        ) : (
          // Off-season: no cards to show, so the strip points at the
          // categories that will fill it rather than rendering a hole.
          <ul role="list" className="mt-8 flex flex-wrap gap-2">
            {categories.map((category) => (
              <li key={category}>
                <Link
                  href={`/browse?category=${category}`}
                  className="border-border bg-surface text-fg hover:border-border-strong rounded-pill inline-flex items-center gap-2 border px-4 py-2 text-sm font-medium transition-colors"
                >
                  <span
                    aria-hidden
                    className="h-1.5 w-1.5 rounded-full"
                    style={{ backgroundColor: categoryColorVar(category) }}
                  />
                  {EVENT_CATEGORY_LABELS[category]}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}

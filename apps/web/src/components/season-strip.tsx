import Link from 'next/link';
import { currentSeason, nextSeason, type Season } from '@desihub/shared';

const MOOD_STYLE: Record<Season['mood'], { from: string; to: string; ink: string }> = {
  colour: { from: '#E8802A', to: '#C13C7A', ink: '#2A0F1C' },
  lights: { from: '#E0A82E', to: '#C96A1E', ink: '#2A1A05' },
  devotional: { from: '#B5762E', to: '#7A4A0F', ink: '#241505' },
  calm: { from: '#3B3BE8', to: '#2E7FB5', ink: '#0B1024' },
};

/**
 * The home "Season" strip. Changes with the festival calendar so quiet months
 * still feel alive: an active festival gets a live banner; the off-season gets
 * a countdown to what's next.
 */
export function SeasonStrip({ now = new Date() }: { now?: Date }) {
  const season = currentSeason(now);
  const isOff = season.key === 'offseason';
  const upcoming = isOff ? nextSeason(now) : null;
  const style = MOOD_STYLE[season.key === 'offseason' ? 'calm' : season.mood];
  const primaryCategory = (upcoming?.season ?? season).featuredCategories[0];

  return (
    <section
      className="relative overflow-hidden"
      style={{
        background: `linear-gradient(120deg, ${style.from}, ${style.to})`,
        color: '#fff',
      }}
      aria-label="Festival season"
    >
      <div className="paper-texture absolute inset-0 opacity-60" aria-hidden />
      <div className="max-w-content relative mx-auto px-4 py-10 sm:px-6 sm:py-14">
        {isOff && upcoming ? (
          <>
            <p className="text-sm font-semibold tracking-[0.2em] uppercase opacity-90">Coming up</p>
            <h1 className="font-display mt-2 text-3xl font-semibold sm:text-[2.75rem] sm:leading-tight">
              {upcoming.season.name} is {upcoming.daysUntil} days away
            </h1>
            <p className="mt-2 max-w-xl text-base opacity-90">{upcoming.season.tagline}</p>
          </>
        ) : (
          <>
            <p className="text-sm font-semibold tracking-[0.2em] uppercase opacity-90">
              It&apos;s {season.name} season
            </p>
            <h1 className="font-display mt-2 text-3xl font-semibold sm:text-[2.75rem] sm:leading-tight">
              {season.tagline}
            </h1>
            <p className="mt-2 max-w-xl text-base opacity-90">
              Find every {season.name} event across the Netherlands.
            </p>
          </>
        )}

        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href={primaryCategory ? `/browse?category=${primaryCategory}` : '/browse'}
            className="inline-flex h-12 items-center rounded-md bg-white px-5 text-sm font-semibold transition-all duration-150 hover:-translate-y-0.5 active:scale-[0.98]"
            style={{ color: style.ink }}
          >
            Explore {(upcoming?.season ?? season).name}
          </Link>
          <Link
            href="/browse"
            className="inline-flex h-12 items-center rounded-md border border-white/70 px-5 text-sm font-semibold text-white transition-colors hover:bg-white/10 active:scale-[0.98]"
          >
            All events
          </Link>
        </div>
      </div>
    </section>
  );
}

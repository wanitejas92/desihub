import { currentSeason, nextSeason, type Season } from '@desihub/shared';
import { Button } from './ui/button';

/**
 * Soft pastel wash per mood — not a saturated full-bleed block. Navy text
 * throughout (the background is always light), one brand tone per mood for
 * the eyebrow label and primary CTA accent.
 */
const MOOD_STYLE: Record<Season['mood'], { from: string; to: string; accent: string }> = {
  colour: { from: '#FFF2E3', to: '#FFF0F3', accent: '#FF8A00' },
  lights: { from: '#FFF2E3', to: '#FDFBF8', accent: '#FF8A00' },
  devotional: { from: '#F3EEFF', to: '#FDFBF8', accent: '#7B35D6' },
  calm: { from: '#F3EEFF', to: '#FFF0F3', accent: '#7B35D6' },
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
      className="border-border relative overflow-hidden border-b"
      style={{ background: `linear-gradient(120deg, ${style.from}, ${style.to})` }}
      aria-label="Festival season"
    >
      <div className="paper-texture absolute inset-0 opacity-40" aria-hidden />
      <div className="max-w-content relative mx-auto px-4 py-10 sm:px-6 sm:py-14">
        {isOff && upcoming ? (
          <>
            <p
              className="text-sm font-semibold tracking-[0.2em] uppercase"
              style={{ color: style.accent }}
            >
              Coming up
            </p>
            <h1 className="font-display text-fg mt-2 text-3xl font-bold sm:text-[2.75rem] sm:leading-tight">
              {upcoming.season.name} is {upcoming.daysUntil} days away
            </h1>
            <p className="text-fg-muted mt-2 max-w-xl text-base">{upcoming.season.tagline}</p>
          </>
        ) : (
          <>
            <p
              className="text-sm font-semibold tracking-[0.2em] uppercase"
              style={{ color: style.accent }}
            >
              It&apos;s {season.name} season
            </p>
            <h1 className="font-display text-fg mt-2 text-3xl font-bold sm:text-[2.75rem] sm:leading-tight">
              {season.tagline}
            </h1>
            <p className="text-fg-muted mt-2 max-w-xl text-base">
              Find every {season.name} event across the Netherlands.
            </p>
          </>
        )}

        <div className="mt-6 flex flex-wrap gap-3">
          <Button href={primaryCategory ? `/browse?category=${primaryCategory}` : '/browse'}>
            Explore {(upcoming?.season ?? season).name}
          </Button>
          <Button href="/browse" variant="secondary">
            All events
          </Button>
        </div>
      </div>
    </section>
  );
}

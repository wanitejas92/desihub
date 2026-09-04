import { currentSeason, nextSeason } from '@desihub/shared';
import { Button } from './ui/button';
import { HeroSearchBar } from './hero-search-bar';
import { HeroIllustration } from './hero-illustration';
import { IconCalendar, IconShieldCheck, IconHeadset, IconUsers } from './ui/icons';

const TRUST_BADGES = [
  { Icon: IconCalendar, label: 'Thousands of Events' },
  { Icon: IconShieldCheck, label: 'Secure Ticketing' },
  { Icon: IconHeadset, label: '24/7 Customer Support' },
  { Icon: IconUsers, label: 'For the Community, By the Community' },
] as const;

/**
 * The homepage hero. Full-bleed on a soft cream ground with an original,
 * always-animated illustrated panel on the right — no stock photography, no
 * static banner. The headline stays evergreen; a season-aware pill (Diwali,
 * Garba season, etc.) rides above it so that dynamism isn't lost, just no
 * longer the thing the whole hero rewrites itself around.
 */
export function Hero({ now = new Date() }: { now?: Date }) {
  const season = currentSeason(now);
  const isOff = season.key === 'offseason';
  const upcoming = isOff ? nextSeason(now) : null;
  const pillLabel =
    isOff && upcoming ? `${upcoming.season.name} is coming up` : `It's ${season.name} season`;
  const pillHref = `/browse?category=${(upcoming?.season ?? season).featuredCategories[0]}`;

  return (
    <section className="bg-bg relative overflow-hidden" aria-label="DesiHub">
      <div className="max-w-content relative mx-auto grid gap-10 px-4 py-10 sm:px-6 sm:py-14 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:gap-8">
        <div className="hero-enter">
          <a
            href={pillHref}
            className="border-border bg-surface text-fg-muted hover:text-fg shadow-elevation rounded-pill inline-flex items-center gap-1.5 border px-3 py-1.5 text-xs font-semibold"
          >
            <span className="bg-accent inline-block h-1.5 w-1.5 rounded-full" aria-hidden />
            {pillLabel}
          </a>

          <h1 className="font-display text-fg mt-4 text-4xl leading-[1.05] font-extrabold text-balance sm:text-5xl lg:text-[3.4rem]">
            Discover the <span className="text-accent">Desi</span> Scene in{' '}
            <span
              className="bg-clip-text text-transparent"
              style={{ backgroundImage: 'linear-gradient(90deg, #F0146F, #7B35D6)' }}
            >
              the Netherlands
            </span>
          </h1>

          <p className="text-fg-muted mt-4 max-w-lg text-base sm:text-lg">
            Concerts, parties, dance, festivals &amp; entertainment — all in one place.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Button href="/browse" size="md">
              Explore Events
            </Button>
            <Button href="/submit" variant="secondary" size="md">
              List Your Event
            </Button>
          </div>

          <HeroSearchBar />

          <ul role="list" className="mt-8 flex flex-wrap gap-x-7 gap-y-4">
            {TRUST_BADGES.map(({ Icon, label }) => (
              <li key={label} className="text-fg-muted flex max-w-[11rem] items-center gap-2.5">
                <span
                  aria-hidden
                  className="bg-accent-subtle text-accent flex h-9 w-9 shrink-0 items-center justify-center rounded-full"
                >
                  <Icon width={17} height={17} />
                </span>
                <span className="text-fg text-sm leading-tight font-semibold">{label}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="hero-enter hero-enter-delay lg:h-[560px]">
          <HeroIllustration className="shadow-elevation-lg aspect-4/5 w-full overflow-hidden rounded-3xl lg:aspect-auto lg:h-full" />
        </div>
      </div>
    </section>
  );
}

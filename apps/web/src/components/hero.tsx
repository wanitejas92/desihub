import { Button } from './ui/button';
import { HeroSearchBar } from './hero-search-bar';
import { IconCalendar, IconShieldCheck, IconHeadset, IconUsers } from './ui/icons';

const TRUST_BADGES = [
  { Icon: IconCalendar, lines: ['Thousands of', 'Events'] },
  { Icon: IconShieldCheck, lines: ['Trusted', 'Organisers'] },
  { Icon: IconHeadset, lines: ['24/7 Customer', 'Support'] },
  { Icon: IconUsers, lines: ['For the Community,', 'By the Community'] },
] as const;

/**
 * Homepage hero: a compact centred block — headline, one line of copy,
 * search, two actions.
 *
 * Deliberately no artwork column. The homepage's picture is the rotating
 * promo strip directly below, which is filled from the banners table and a
 * storage bucket; putting a second, code-owned image up here both doubled
 * the height of the fold and gave artwork two different homes. One place to
 * upload, and the copy gets to the search bar in half the vertical space.
 */
export function Hero() {
  return (
    <section className="bg-bg relative overflow-hidden" aria-label="DesiHub">
      <div className="max-w-content relative mx-auto px-4 pt-10 pb-6 sm:px-6 lg:pt-14 lg:pb-8">
        <div className="hero-enter mx-auto max-w-3xl text-center">
          {/*
            No whitespace-nowrap around "the Netherlands": at 390px it pushed
            the gradient word clean off the viewport. "Netherlands" is a single
            word and cannot break on its own, so wrapping is safe and the line
            simply falls where it fits.
          */}
          <h1 className="font-display text-fg text-[1.75rem] leading-[1.12] font-extrabold text-balance sm:text-4xl lg:text-[2.75rem]">
            Discover the <span className="text-accent">Desi</span> Scene in the{' '}
            <span
              className="bg-clip-text text-transparent"
              style={{ backgroundImage: 'linear-gradient(90deg, #F0446F, #7B35D6)' }}
            >
              Netherlands
            </span>
          </h1>

          <p className="text-fg-muted mx-auto mt-4 max-w-xl text-base sm:text-lg">
            Concerts, parties, dance, festivals &amp; entertainment — all in one place.
          </p>
        </div>

        <div className="hero-enter hero-enter-delay mx-auto mt-7 max-w-4xl">
          <HeroSearchBar />
        </div>

        <div className="hero-enter hero-enter-delay mt-5 flex flex-wrap justify-center gap-3">
          <Button href="/browse">Explore Events</Button>
          <Button href="/submit" variant="outline">
            List Your Event
          </Button>
        </div>
      </div>
    </section>
  );
}

/**
 * The trust row, split out so it can sit *below* the promo strip: it is
 * reassurance, not a headline, and above the artwork it was just delaying
 * the thing people came for.
 */
export function HeroTrustBadges() {
  return (
    <ul
      role="list"
      className="max-w-content mx-auto grid grid-cols-2 gap-x-6 gap-y-5 px-4 pt-8 sm:grid-cols-4 sm:px-6 lg:justify-items-center"
    >
      {TRUST_BADGES.map(({ Icon, lines }) => (
        <li key={lines.join(' ')} className="flex items-center gap-2.5">
          <span
            aria-hidden
            className="bg-accent-subtle text-accent flex h-10 w-10 shrink-0 items-center justify-center rounded-lg"
          >
            <Icon width={19} height={19} />
          </span>
          <span className="text-fg text-sm leading-tight font-semibold">
            {lines[0]}
            <br />
            {lines[1]}
          </span>
        </li>
      ))}
    </ul>
  );
}

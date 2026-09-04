import { Button } from './ui/button';
import { HeroSearchBar } from './hero-search-bar';
import { HeroBannerImage } from './hero-banner-image';
import { IconCalendar, IconShieldCheck, IconHeadset, IconUsers } from './ui/icons';

const TRUST_BADGES = [
  { Icon: IconCalendar, lines: ['Thousands of', 'Events'] },
  { Icon: IconShieldCheck, lines: ['Secure', 'Ticketing'] },
  { Icon: IconHeadset, lines: ['24/7 Customer', 'Support'] },
  { Icon: IconUsers, lines: ['For the Community,', 'By the Community'] },
] as const;

/**
 * Homepage hero: copy left, artwork right, search bar and trust badges
 * beneath the pair.
 *
 * The search bar deliberately sits *below* the grid rather than overlapping
 * the artwork — an overlapping bar only works when the image was composed
 * with room for it, and against an arbitrary uploaded banner it just slices
 * the picture in half. Both columns are centred against each other so the
 * text block and the image share a visual midline instead of one hugging
 * the top.
 */
export function Hero() {
  return (
    <section className="bg-bg relative overflow-hidden" aria-label="DesiHub">
      <div className="max-w-content relative mx-auto px-4 py-10 sm:px-6 lg:py-14">
        <div className="grid items-center gap-8 lg:grid-cols-[minmax(0,47%)_minmax(0,1fr)] lg:gap-10">
          <div className="hero-enter">
            <h1 className="font-display text-fg text-4xl leading-[1.08] font-extrabold sm:text-5xl lg:text-[3.15rem]">
              Discover the
              <br />
              <span className="text-accent">Desi</span> Scene in
              <br />
              <span className="whitespace-nowrap">
                the{' '}
                <span
                  className="bg-clip-text text-transparent"
                  style={{ backgroundImage: 'linear-gradient(90deg, #F0446F, #7B35D6)' }}
                >
                  Netherlands
                </span>
              </span>
            </h1>

            <p className="text-fg-muted mt-5 max-w-md text-base sm:text-lg">
              Concerts, parties, dance, festivals &amp; entertainment — all in one place.
            </p>

            <div className="mt-7 flex flex-wrap gap-3">
              <Button href="/browse">Explore Events</Button>
              <Button href="/submit" variant="outline">
                List Your Event
              </Button>
            </div>
          </div>

          <div className="hero-enter hero-enter-delay">
            <HeroBannerImage className="aspect-[4/3] w-full rounded-2xl lg:aspect-[16/11]" />
          </div>
        </div>

        <div className="hero-enter hero-enter-delay mt-10">
          <HeroSearchBar />
        </div>

        <ul
          role="list"
          className="mt-8 grid grid-cols-2 gap-x-6 gap-y-5 sm:grid-cols-4 lg:justify-items-center"
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
      </div>
    </section>
  );
}

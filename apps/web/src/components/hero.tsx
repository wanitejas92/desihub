import Link from 'next/link';
import { HeroSearchBar } from './hero-search-bar';
import { IconCalendar, IconShieldCheck, IconHeadset, IconUsers } from './ui/icons';

const TRUST_BADGES = [
  { Icon: IconCalendar, lines: ['Thousands of', 'Events'] },
  { Icon: IconShieldCheck, lines: ['Trusted', 'Organisers'] },
  { Icon: IconHeadset, lines: ['24/7 Customer', 'Support'] },
  { Icon: IconUsers, lines: ['For the Community,', 'By the Community'] },
] as const;

/**
 * Homepage hero: search is the one primary action. "Explore Events" used to
 * sit right below it as a second button doing the same job the Search
 * button already does, and "List Your Event" repeated a CTA that also
 * appears in the header, the mid-page organiser banner, and the footer —
 * both were competing with search rather than supporting it. Organisers get
 * a quiet text link instead, still one tap away, not shouting.
 */
export function Hero() {
  return (
    <section className="bg-bg relative overflow-hidden" aria-label="DesiHub">
      <div className="max-w-content relative mx-auto px-4 py-2 sm:px-6 lg:py-3">
        <div className="hero-enter hero-enter-delay mx-auto max-w-4xl">
          <HeroSearchBar />
        </div>

        <p className="hero-enter hero-enter-delay text-fg-muted mt-3 text-center text-sm">
          Organising an event?{' '}
          <Link href="/submit" className="text-accent font-semibold hover:underline">
            List it on DesiHub
          </Link>
        </p>
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
      className="max-w-content mx-auto grid grid-cols-2 gap-x-6 gap-y-3 px-4 pt-3 pb-3 sm:grid-cols-4 sm:px-6 lg:justify-items-center"
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

import Link from 'next/link';
import { HeroSearchBar } from './hero-search-bar';

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

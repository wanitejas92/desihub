import Link from 'next/link';

/**
 * Homepage hero: one quiet line, not a second search box. Search used to
 * live here too, as a large centred bar — now that it's in the header (on
 * every page, not just this one), repeating it here just meant two search
 * boxes stacked on top of each other on the one page that had both.
 * "Explore Events" and "List Your Event" buttons used to sit here as well,
 * competing with search and repeating CTAs that already appear in the
 * header, the mid-page organiser banner, and the footer; a quiet text link
 * is still one tap away without shouting.
 */
export function Hero() {
  return (
    <section className="bg-bg relative overflow-hidden" aria-label="DesiHub">
      <div className="max-w-content relative mx-auto px-4 py-3 text-center sm:px-6">
        <p className="hero-enter hero-enter-delay text-fg-muted text-sm">
          Organising an event?{' '}
          <Link href="/submit" className="text-accent font-semibold hover:underline">
            List it on DesiHub
          </Link>
        </p>
      </div>
    </section>
  );
}

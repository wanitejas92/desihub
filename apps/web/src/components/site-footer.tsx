import Link from 'next/link';
import { EVENT_CATEGORIES, EVENT_CATEGORY_LABELS, CITIES } from '@desihub/shared';
import { Logo } from './logo';

export function SiteFooter() {
  return (
    <footer className="border-border bg-bg-subtle mt-20 border-t">
      <div className="max-w-content mx-auto grid gap-8 px-4 py-12 sm:grid-cols-2 sm:px-6 lg:grid-cols-4">
        <div>
          <Logo />
          <p className="text-fg-muted mt-3 max-w-xs text-sm">
            Every South Asian event in the Netherlands — and the ticket.
          </p>
        </div>

        <nav aria-label="Browse by category">
          <h2 className="text-sm font-semibold">By category</h2>
          <ul className="text-fg-muted mt-3 space-y-2 text-sm">
            {EVENT_CATEGORIES.slice(0, 6).map((c) => (
              <li key={c}>
                <Link href={`/browse?category=${c}`} className="hover:text-fg">
                  {EVENT_CATEGORY_LABELS[c]}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-label="Browse by city">
          <h2 className="text-sm font-semibold">By city</h2>
          <ul className="text-fg-muted mt-3 space-y-2 text-sm">
            {CITIES.slice(0, 6).map((c) => (
              <li key={c}>
                <Link href={`/browse?city=${encodeURIComponent(c)}`} className="hover:text-fg">
                  {c}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-label="About">
          <h2 className="text-sm font-semibold">DesiHub</h2>
          <ul className="text-fg-muted mt-3 space-y-2 text-sm">
            <li>
              <Link href="/submit" className="hover:text-fg">
                Submit an event
              </Link>
            </li>
            <li>
              <Link href="/browse" className="hover:text-fg">
                All events
              </Link>
            </li>
          </ul>
        </nav>
      </div>
      <div className="border-border border-t">
        <p className="max-w-content text-fg-subtle mx-auto px-4 py-6 text-xs sm:px-6">
          © {new Date().getFullYear()} DesiHub. Made for the Desi community in the Netherlands.
        </p>
      </div>
    </footer>
  );
}

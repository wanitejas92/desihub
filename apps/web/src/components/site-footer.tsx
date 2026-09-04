import Link from 'next/link';
import { EVENT_CATEGORIES, EVENT_CATEGORY_LABELS, CITIES } from '@desihub/shared';
import { Logo } from './logo';
import { EmailCapture } from './email-capture';

export function SiteFooter() {
  return (
    <footer className="border-border bg-bg-subtle mt-20 border-t">
      <div className="max-w-content mx-auto grid gap-10 px-4 py-12 sm:grid-cols-2 sm:px-6 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <h2 className="text-sm font-semibold">Stay updated</h2>
          <div className="mt-3 max-w-sm">
            <EmailCapture />
          </div>
        </div>

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

        <nav aria-label="DesiHub">
          <h2 className="text-sm font-semibold">DesiHub</h2>
          <ul className="text-fg-muted mt-3 space-y-2 text-sm">
            <li>
              <Link href="/browse" className="hover:text-fg">
                All events
              </Link>
            </li>
            <li>
              <Link href="/submit" className="hover:text-fg">
                List your event
              </Link>
            </li>
            <li>
              <Link href="/account" className="hover:text-fg">
                Your account
              </Link>
            </li>
          </ul>
        </nav>
      </div>
      <div className="border-border border-t">
        <div className="max-w-content mx-auto flex flex-col items-center gap-3 px-4 py-6 sm:flex-row sm:justify-between sm:px-6">
          <p className="text-fg-subtle text-xs">
            © {new Date().getFullYear()} DesiHub. Made for the Desi community in the Netherlands.
          </p>
        </div>
      </div>
    </footer>
  );
}

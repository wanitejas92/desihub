import Link from 'next/link';
import { EVENT_CATEGORIES, EVENT_CATEGORY_LABELS, CITIES } from '@desihub/shared';
import { Logo } from './logo';
import { EmailCapture } from './email-capture';

export function SiteFooter() {
  return (
    <footer className="border-border bg-bg-subtle mt-16 border-t">
      <div className="max-w-content mx-auto grid gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[1.3fr_1fr_0.8fr_0.8fr]">
        <div>
          <h2 className="text-fg text-sm font-bold">Stay Updated</h2>
          <div className="mt-3 max-w-sm">
            <EmailCapture />
          </div>
        </div>

        <div>
          <Logo />
          <p className="text-fg-muted mt-3 max-w-xs text-sm">
            Events. Concerts. Dance. Parties.
            <br />
            All in One Place.
          </p>
        </div>

        <nav aria-label="Quick links">
          <h2 className="text-fg text-sm font-bold">Quick Links</h2>
          <ul className="text-fg-muted mt-3 space-y-2 text-sm">
            <li>
              <Link href="/browse" className="hover:text-fg">
                Events
              </Link>
            </li>
            <li>
              <Link href="/submit" className="hover:text-fg">
                List your event
              </Link>
            </li>
            {EVENT_CATEGORIES.slice(0, 3).map((c) => (
              <li key={c}>
                <Link href={`/browse?category=${c}`} className="hover:text-fg">
                  {EVENT_CATEGORY_LABELS[c]}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-label="Browse by city">
          <h2 className="text-fg text-sm font-bold">Cities</h2>
          <ul className="text-fg-muted mt-3 space-y-2 text-sm">
            {CITIES.slice(0, 5).map((c) => (
              <li key={c}>
                <Link href={`/browse?city=${encodeURIComponent(c)}`} className="hover:text-fg">
                  {c}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      <div className="border-border border-t">
        <div className="max-w-content mx-auto flex flex-col items-center gap-2 px-4 py-5 text-xs sm:flex-row sm:justify-between sm:px-6">
          <p className="text-fg-subtle">
            © {new Date().getFullYear()} DesiHub. All Rights Reserved.
          </p>
          <p className="text-fg-subtle">
            Made with <span aria-hidden>❤️</span> for the Desi Community in the Netherlands
          </p>
        </div>
      </div>
    </footer>
  );
}

import Link from 'next/link';
import type { EventCategory } from '@desihub/shared';

/**
 * High-level categories only — the full 12-category taxonomy (still
 * filterable on /browse) reads as noise in a nav row. Shorter labels than
 * EVENT_CATEGORY_LABELS on purpose ("Parties" not "Bollywood / Desi
 * party") since these are compact tabs, not browse-page headings.
 *
 * Shared by the two places the same list is rendered: inline in the header
 * row from `lg` up, and as its own scrolling row under the header below
 * that — the same split the reference uses at those two sizes.
 */
export const QUICK_CATEGORIES: { category: EventCategory; label: string }[] = [
  { category: 'concert', label: 'Concerts' },
  { category: 'party', label: 'Parties' },
  { category: 'garba_dandiya', label: 'Garba' },
  { category: 'diwali', label: 'Diwali' },
  { category: 'cultural', label: 'Cultural' },
  { category: 'comedy', label: 'Comedy' },
  { category: 'food', label: 'Food' },
];

/**
 * Plain text tabs sitting in the header's own row — not icon-over-label
 * chips in a separate bar below it. Desktop only; the narrow-screen
 * version is `CategoryQuickNav`, which keeps its own row because there is
 * no room for seven tabs beside a logo and a city pill on a phone.
 */
export function HeaderNav() {
  return (
    <nav aria-label="Browse by category" className="hidden min-w-0 items-center lg:flex">
      <Link
        href="/browse"
        className="bg-accent-subtle text-accent rounded-pill shrink-0 px-4 py-2 text-sm font-semibold"
      >
        All events
      </Link>
      <ul role="list" className="flex min-w-0 items-center">
        {QUICK_CATEGORIES.map(({ category, label }) => (
          <li key={category} className="shrink-0">
            <Link
              href={`/browse?category=${category}`}
              className="text-fg hover:text-accent block px-3 py-2 text-sm font-medium transition-colors xl:px-4"
            >
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

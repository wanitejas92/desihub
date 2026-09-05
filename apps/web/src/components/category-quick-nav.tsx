import Link from 'next/link';
import type { EventCategory } from '@desihub/shared';
import { CATEGORY_ICON } from '@/lib/category-icons';
import { IconChevronRight } from './ui/icons';

/**
 * High-level categories only — the full 12-category taxonomy (still filterable
 * on /browse) reads as noise in a quick-nav row. Shorter labels than
 * EVENT_CATEGORY_LABELS on purpose ("Parties" not "Bollywood / Desi party")
 * since this is a compact chip, not a browse-page heading.
 */
const QUICK_CATEGORIES: { category: EventCategory; label: string }[] = [
  { category: 'concert', label: 'Concerts' },
  { category: 'party', label: 'Parties' },
  { category: 'garba_dandiya', label: 'Garba & Dandiya' },
  { category: 'diwali', label: 'Diwali' },
  { category: 'cultural', label: 'Cultural' },
  { category: 'comedy', label: 'Comedy' },
  { category: 'food', label: 'Food' },
];

/**
 * Icon-over-label quick nav, right below the header — the site's *only*
 * category-browsing entry point (a "Categories" tile grid and a "Celebrate
 * culture" festival-tile section used to duplicate this same job further
 * down the page; both were folded into this one row instead). Sticky
 * beneath the header (top-[65px] = header's h-16 + its 1px bottom border)
 * so category switching stays one tap away while scrolling, not just at
 * the very top of the page.
 */
export function CategoryQuickNav() {
  return (
    <nav
      id="categories"
      aria-label="Browse by category"
      className="bg-bg border-border sticky top-[65px] z-30 scroll-mt-20 border-b"
    >
      <ul
        role="list"
        className="scrollbar-hide max-w-content mx-auto flex snap-x gap-4 overflow-x-auto px-4 py-3 sm:gap-5 sm:px-6 lg:snap-none lg:justify-center lg:gap-10 lg:overflow-visible lg:py-4"
      >
        {QUICK_CATEGORIES.map(({ category, label }) => {
          const Icon = CATEGORY_ICON[category];
          return (
            <li key={category} className="shrink-0 snap-start">
              <Link
                href={`/browse?category=${category}`}
                className="group flex w-16 flex-col items-center gap-1.5 text-center lg:w-20"
              >
                <span
                  aria-hidden
                  className="text-fg-muted group-hover:text-accent flex h-7 w-7 shrink-0 items-center justify-center transition-transform duration-150 ease-out group-hover:scale-110 lg:h-8 lg:w-8"
                >
                  <Icon width={26} height={26} />
                </span>
                <span className="text-fg-muted group-hover:text-fg text-[11px] leading-tight font-semibold lg:text-xs">
                  {label}
                </span>
              </Link>
            </li>
          );
        })}
        <li className="shrink-0 snap-start">
          <Link
            href="/browse"
            className="group flex w-16 flex-col items-center gap-1.5 text-center lg:w-20"
          >
            <span className="text-fg-muted group-hover:text-accent flex h-7 w-7 shrink-0 items-center justify-center transition-transform duration-150 ease-out group-hover:scale-110 lg:h-8 lg:w-8">
              <IconChevronRight width={22} height={22} />
            </span>
            <span className="text-fg-muted group-hover:text-fg text-[11px] leading-tight font-semibold lg:text-xs">
              More
            </span>
          </Link>
        </li>
      </ul>
    </nav>
  );
}

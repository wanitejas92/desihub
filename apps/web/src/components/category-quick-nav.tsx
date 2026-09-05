import Link from 'next/link';
import type { EventCategory } from '@desihub/shared';
import { CATEGORY_ICON } from '@/lib/category-icons';
import { CATEGORY_TONE, TONE_ACCENT, TONE_SOFT } from '@/lib/category-tone';
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
 * down the page; both were folded into this one row instead).
 */
export function CategoryQuickNav() {
  return (
    <nav
      id="categories"
      aria-label="Browse by category"
      className="max-w-content mx-auto scroll-mt-20 px-4 sm:px-6"
    >
      <ul
        role="list"
        className="scrollbar-hide -mx-4 flex snap-x gap-4 overflow-x-auto px-4 py-3 sm:mx-0 sm:gap-5 sm:px-0"
      >
        {QUICK_CATEGORIES.map(({ category, label }) => {
          const Icon = CATEGORY_ICON[category];
          const tone = CATEGORY_TONE[category];
          return (
            <li key={category} className="shrink-0 snap-start">
              <Link
                href={`/browse?category=${category}`}
                className="group flex w-16 flex-col items-center gap-1.5 text-center"
              >
                <span
                  aria-hidden
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full transition-transform duration-150 ease-out group-hover:scale-105"
                  style={{ backgroundColor: TONE_SOFT[tone], color: TONE_ACCENT[tone] }}
                >
                  <Icon width={19} height={19} />
                </span>
                <span className="text-fg-muted group-hover:text-fg text-[11px] leading-tight font-semibold">
                  {label}
                </span>
              </Link>
            </li>
          );
        })}
        <li className="shrink-0 snap-start">
          <Link
            href="/browse"
            className="group flex w-16 flex-col items-center gap-1.5 text-center"
          >
            <span className="bg-bg-subtle text-fg-muted group-hover:text-accent flex h-11 w-11 shrink-0 items-center justify-center rounded-full transition-transform duration-150 ease-out group-hover:scale-105">
              <IconChevronRight width={18} height={18} />
            </span>
            <span className="text-fg-muted group-hover:text-fg text-[11px] leading-tight font-semibold">
              More
            </span>
          </Link>
        </li>
      </ul>
    </nav>
  );
}

import Link from 'next/link';
import { EVENT_CATEGORY_LABELS } from '@desihub/shared';
import { CATEGORY_ICON } from '@/lib/category-icons';
import { CATEGORY_TONE, TONE_ACCENT, TONE_SOFT } from '@/lib/category-tone';

/** Categories worth a one-tap jump from the homepage — not the full list. */
const QUICK_CATEGORIES = [
  'concert',
  'party',
  'garba_dandiya',
  'cultural',
  'comedy',
  'food',
  'family',
  'workshop',
] as const;

/**
 * Icon-over-label quick nav, right below the header. The fastest way into a
 * specific kind of night without a search or a scroll — one tap from the
 * homepage into that category's browse results.
 */
export function CategoryQuickNav() {
  return (
    <nav aria-label="Browse by category" className="max-w-content mx-auto px-4 sm:px-6">
      <ul
        role="list"
        className="-mx-4 flex snap-x gap-4 overflow-x-auto px-4 py-3 sm:mx-0 sm:gap-5 sm:px-0"
      >
        {QUICK_CATEGORIES.map((category) => {
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
                  {EVENT_CATEGORY_LABELS[category]}
                </span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

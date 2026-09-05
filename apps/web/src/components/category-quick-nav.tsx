import Link from 'next/link';
import type { EventCategory } from '@desihub/shared';
import { CATEGORY_ICON } from '@/lib/category-icons';
import type { ComponentType, SVGProps } from 'react';
import { IconChevronRight, IconSparkle } from './ui/icons';
import { cn } from '@/lib/cn';

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
      // Sticks directly under the header, which is two rows tall on mobile
      // (64px bar + 49px search row) and one row from `lg` up.
      className="bg-bg border-border relative sticky top-[113px] z-30 scroll-mt-20 border-b lg:top-[65px]"
    >
      {/* Fades the last chip out at the right edge instead of guillotining
          it, which is the cheapest honest "there is more this way" signal. */}
      <span
        aria-hidden
        className="from-bg pointer-events-none absolute inset-y-0 right-0 z-10 w-10 bg-gradient-to-l to-transparent lg:hidden"
      />
      <ul
        role="list"
        // `pr-10` on the scroller, plus the fade below: the row was ending
        // flush with the viewport edge, so the last category was sliced
        // clean in half with nothing to say it could be scrolled — it just
        // looked like a clipped layout.
        className="scrollbar-hide max-w-content mx-auto flex snap-x gap-4 overflow-x-auto px-4 py-3 pr-10 sm:gap-5 sm:px-6 lg:snap-none lg:justify-center lg:gap-10 lg:overflow-visible lg:py-4 lg:pr-6"
      >
        {/* "For You" is the homepage itself, and this nav only renders on
            the homepage — so it is always the active entry here and needs no
            client-side route matching. When the row appears on another page,
            that page passes the active category in rather than this
            component reaching for `useSearchParams`, which would force the
            homepage out of static rendering for one highlight. */}
        <li className="shrink-0 snap-start">
          <NavItem href="/" label="For You" Icon={IconSparkle} active />
        </li>

        {QUICK_CATEGORIES.map(({ category, label }) => (
          <li key={category} className="shrink-0 snap-start">
            <NavItem
              href={`/browse?category=${category}`}
              label={label}
              Icon={CATEGORY_ICON[category]}
            />
          </li>
        ))}
        <li className="shrink-0 snap-start">
          <NavItem href="/browse" label="More" Icon={IconChevronRight} />
        </li>
      </ul>
    </nav>
  );
}

/**
 * One entry. The active state is a tinted rounded container rather than a
 * colour change alone — at 11px a label that is merely a different colour is
 * not a state anyone notices on a phone, and the whole point of the row is
 * knowing where you are in it.
 */
function NavItem({
  href,
  label,
  Icon,
  active,
}: {
  href: string;
  label: string;
  Icon: ComponentType<SVGProps<SVGSVGElement>>;
  active?: boolean;
}) {
  return (
    <Link
      href={href}
      aria-current={active ? 'page' : undefined}
      className={cn(
        'group flex w-[4.5rem] flex-col items-center gap-1.5 rounded-md px-1 py-2 text-center transition-colors lg:w-20',
        active ? 'bg-accent-subtle' : 'hover:bg-bg-subtle',
      )}
    >
      <span
        aria-hidden
        className={cn(
          'flex h-7 w-7 shrink-0 items-center justify-center transition-transform duration-150 ease-out group-hover:scale-110 lg:h-8 lg:w-8',
          active ? 'text-accent' : 'text-fg-muted group-hover:text-accent',
        )}
      >
        <Icon width={24} height={24} />
      </span>
      <span
        className={cn(
          'text-[11px] leading-tight lg:text-xs',
          active ? 'text-accent font-bold' : 'text-fg-muted group-hover:text-fg font-semibold',
        )}
      >
        {label}
      </span>
    </Link>
  );
}

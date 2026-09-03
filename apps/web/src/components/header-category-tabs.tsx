import Link from 'next/link';
import type { EventCategory } from '@desihub/shared';
import { IconChevronRight } from './ui/icons';

/** Short labels for the header's tab row — the full label runs long ("Bollywood / Desi party"). */
const NAV_CATEGORIES: { category: EventCategory; label: string }[] = [
  { category: 'concert', label: 'Concerts' },
  { category: 'party', label: 'Parties' },
  { category: 'garba_dandiya', label: 'Garba' },
  { category: 'cultural', label: 'Cultural' },
  { category: 'comedy', label: 'Comedy' },
  { category: 'food', label: 'Food' },
];

/** DesiPass-style header nav: a row of category tabs plus a link into the full list. */
export function HeaderCategoryTabs() {
  return (
    <nav
      aria-label="Categories"
      className="hidden max-w-full items-center gap-1 overflow-x-auto lg:flex"
    >
      {NAV_CATEGORIES.map(({ category, label }) => (
        <Link
          key={category}
          href={`/browse?category=${category}`}
          className="text-fg-muted hover:bg-surface-hover hover:text-fg rounded-pill shrink-0 px-3 py-2 text-sm font-medium whitespace-nowrap transition-colors"
        >
          {label}
        </Link>
      ))}
      <Link
        href="/browse"
        className="text-accent inline-flex shrink-0 items-center gap-0.5 px-3 py-2 text-sm font-semibold whitespace-nowrap hover:underline"
      >
        More
        <IconChevronRight width={14} height={14} />
      </Link>
    </nav>
  );
}

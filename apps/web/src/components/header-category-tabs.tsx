'use client';

import Link from 'next/link';
import { useSearchParams, usePathname } from 'next/navigation';
import type { EventCategory } from '@desihub/shared';
import { CATEGORY_ICON } from '@/lib/category-icons';
import { CATEGORY_TONE, TONE_ACCENT, TONE_SOFT } from '@/lib/category-tone';
import { IconChevronRight } from './ui/icons';
import { cn } from '@/lib/cn';

/**
 * Real category names, not truncated to the point of losing what they are
 * — "Garba" alone reads as a dance style; "Garba & Dandiya" reads as an
 * event category, which is what this row is for.
 */
const NAV_CATEGORIES: { category: EventCategory; label: string }[] = [
  { category: 'concert', label: 'Concerts' },
  { category: 'party', label: 'Parties' },
  { category: 'garba_dandiya', label: 'Garba & Dandiya' },
  { category: 'cultural', label: 'Cultural Nights' },
  { category: 'comedy', label: 'Comedy Shows' },
  { category: 'food', label: 'Food Festivals' },
];

/** DesiPass-style header nav: a row of category tabs plus a link into the full list. */
export function HeaderCategoryTabs() {
  const pathname = usePathname();
  const params = useSearchParams();
  const activeCategory = pathname === '/browse' ? params.get('category') : null;

  return (
    <nav
      aria-label="Categories"
      className="hidden max-w-full items-center gap-1 overflow-x-auto lg:flex"
    >
      {NAV_CATEGORIES.map(({ category, label }) => {
        const Icon = CATEGORY_ICON[category];
        const tone = CATEGORY_TONE[category];
        const isActive = category === activeCategory;
        return (
          <Link
            key={category}
            href={`/browse?category=${category}`}
            aria-current={isActive ? 'page' : undefined}
            className={cn(
              'rounded-pill inline-flex shrink-0 items-center gap-1.5 px-3 py-2 text-sm font-semibold whitespace-nowrap transition-colors',
              isActive ? '' : 'text-fg-muted hover:bg-surface-hover hover:text-fg',
            )}
            style={
              isActive ? { backgroundColor: TONE_SOFT[tone], color: TONE_ACCENT[tone] } : undefined
            }
          >
            <Icon
              width={15}
              height={15}
              style={{ color: isActive ? TONE_ACCENT[tone] : undefined }}
              className={isActive ? '' : 'text-fg-subtle'}
            />
            {label}
          </Link>
        );
      })}
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

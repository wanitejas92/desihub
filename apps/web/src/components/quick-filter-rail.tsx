'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import type { EventWithRelations } from '@/lib/data';
import { EventCard } from './event-card';
import { EmptyState } from './empty-state';
import {
  IconTicket,
  IconCalendar,
  IconDisco,
  IconSparkle,
  IconChevronLeft,
  IconChevronRight,
} from './ui/icons';
import { cn } from '@/lib/cn';

type FilterId = 'all' | 'week' | 'weekend' | 'free';

const FILTERS: { id: FilterId; label: string; href: string; Icon: typeof IconTicket }[] = [
  { id: 'all', label: 'All events', href: '/browse', Icon: IconTicket },
  { id: 'week', label: 'This week', href: '/browse?when=week', Icon: IconCalendar },
  { id: 'weekend', label: 'This weekend', href: '/browse?when=weekend', Icon: IconDisco },
  { id: 'free', label: 'Free entry', href: '/browse?price=free', Icon: IconSparkle },
];

/**
 * Quick filters + the "below" rail, as one interactive unit: clicking a
 * pill swaps in that filter's already-fetched event set directly beneath
 * it, in place — no navigation, and the active pill stays put rather than
 * disappearing. Each filter gets its own server-fetched set (rather than
 * filtering one shared pool client-side) so "this weekend" is never
 * empty just because those events happened to sort past a client-side
 * truncation point — the same repository methods the old dedicated
 * sections used, just switched between instead of stacked.
 */
export function QuickFilterRail({
  eventsByFilter,
}: {
  eventsByFilter: Record<FilterId, EventWithRelations[]>;
}) {
  const [active, setActive] = useState<FilterId>('all');
  const listRef = useRef<HTMLUListElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const filtered = eventsByFilter[active];

  const updateScrollState = () => {
    const el = listRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  };

  useEffect(() => {
    listRef.current?.scrollTo({ left: 0 });
    updateScrollState();
    // Re-measure once layout settles (image loads, filter swap).
    const id = requestAnimationFrame(updateScrollState);
    return () => cancelAnimationFrame(id);
  }, [filtered]);

  function scrollByPage(direction: 1 | -1) {
    const el = listRef.current;
    if (!el) return;
    el.scrollBy({ left: direction * el.clientWidth * 0.85, behavior: 'smooth' });
  }

  const activeFilter = FILTERS.find((f) => f.id === active)!;

  return (
    <section className="max-w-content mx-auto px-4 py-8 sm:px-6">
      <nav
        aria-label="Quick filters"
        className="scrollbar-hide -mx-4 mb-4 overflow-x-auto px-4 sm:mx-0 sm:px-0"
      >
        <ul role="list" className="flex flex-nowrap gap-2 sm:gap-3">
          {FILTERS.map(({ id, label, Icon }) => {
            const isActive = id === active;
            return (
              <li key={id} className="shrink-0">
                <button
                  type="button"
                  aria-pressed={isActive}
                  onClick={() => setActive(id)}
                  className={cn(
                    'rounded-pill inline-flex items-center gap-2 border px-4 py-2 text-sm font-semibold transition-all duration-200',
                    isActive
                      ? 'shadow-elevation border-transparent text-white'
                      : 'border-border bg-surface text-fg hover:border-accent hover:bg-bg-subtle',
                  )}
                  style={
                    isActive
                      ? { backgroundImage: 'linear-gradient(90deg, #FF8A00, #F0446F, #7B35D6)' }
                      : undefined
                  }
                >
                  <Icon
                    className={isActive ? 'text-white' : 'text-fg-muted'}
                    width={16}
                    height={16}
                  />
                  {label}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="mb-4 flex items-baseline justify-between gap-4">
        <h2 className="font-display text-lg font-semibold sm:text-xl">{activeFilter.label}</h2>
        {filtered.length > 0 && (
          <Link
            href={activeFilter.href}
            className="text-accent inline-flex shrink-0 items-center gap-0.5 text-sm font-semibold hover:underline"
          >
            See all
            <IconChevronRight width={14} height={14} />
          </Link>
        )}
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          title="Nothing matches this filter — yet"
          description="Try a different filter, or check what's coming up across the Netherlands."
          action={{ href: '/browse', label: 'Browse all events' }}
        />
      ) : (
        <div className="relative">
          <ul
            ref={listRef}
            onScroll={updateScrollState}
            className="scrollbar-hide -mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2 sm:mx-0 sm:px-0"
            role="list"
          >
            {filtered.map((event, i) => (
              <li key={event.id} className="w-[68vw] shrink-0 snap-start sm:w-64">
                <EventCard event={event} priority={i === 0} />
              </li>
            ))}
          </ul>

          {canScrollLeft && (
            <button
              type="button"
              onClick={() => scrollByPage(-1)}
              aria-label="Scroll left"
              className="border-border bg-surface text-fg shadow-elevation hover:bg-bg-subtle absolute top-1/2 -left-3 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border sm:flex"
            >
              <IconChevronLeft width={18} height={18} />
            </button>
          )}
          {canScrollRight && (
            <button
              type="button"
              onClick={() => scrollByPage(1)}
              aria-label="Scroll right"
              className="border-border bg-surface text-fg shadow-elevation hover:bg-bg-subtle absolute top-1/2 -right-3 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border sm:flex"
            >
              <IconChevronRight width={18} height={18} />
            </button>
          )}
        </div>
      )}
    </section>
  );
}

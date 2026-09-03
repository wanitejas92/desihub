import Link from 'next/link';
import { IconTicket, IconCalendar, IconSparkle, IconDisco } from './ui/icons';

const FILTERS = [
  { href: '/browse', label: 'All events', Icon: IconTicket },
  { href: '/browse?when=week', label: 'This week', Icon: IconCalendar },
  { href: '/browse?when=weekend', label: 'This weekend', Icon: IconDisco },
  { href: '/browse?price=free', label: 'Free entry', Icon: IconSparkle },
] as const;

/** Quick-jump chips: one tap from the homepage into a pre-filtered browse view. */
export function QuickFilters() {
  return (
    <nav aria-label="Quick filters" className="max-w-content mx-auto px-4 py-4 sm:px-6">
      <ul role="list" className="flex flex-wrap gap-2 sm:gap-3">
        {FILTERS.map(({ href, label, Icon }) => (
          <li key={href}>
            <Link
              href={href}
              className="rounded-pill border-border bg-surface text-fg hover:border-accent hover:bg-bg-subtle inline-flex items-center gap-2 border px-4 py-2 text-sm font-semibold transition-colors"
            >
              <Icon className="text-fg-muted" width={16} height={16} />
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

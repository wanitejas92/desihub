import Link from 'next/link';

const FILTERS = [
  { href: '/browse', label: 'All events', emoji: '🎟️' },
  { href: '/browse?when=week', label: 'This week', emoji: '📅' },
  { href: '/browse?when=weekend', label: 'This weekend', emoji: '🎉' },
  { href: '/browse?price=free', label: 'Free entry', emoji: '✨' },
] as const;

/** DesiPass-style quick-jump pills: one tap from the homepage into a pre-filtered browse view. */
export function QuickFilters() {
  return (
    <nav aria-label="Quick filters" className="max-w-content mx-auto px-4 py-4 sm:px-6">
      <ul role="list" className="flex flex-wrap gap-2 sm:gap-3">
        {FILTERS.map((f) => (
          <li key={f.href}>
            <Link
              href={f.href}
              className="rounded-pill border-border bg-surface text-fg hover:border-accent hover:bg-surface-hover inline-flex items-center gap-2 border px-4 py-2 text-sm font-semibold transition-colors"
            >
              <span aria-hidden>{f.emoji}</span>
              {f.label}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}

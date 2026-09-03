import Link from 'next/link';
import { ThemeToggle } from './theme-toggle';

export function SiteHeader() {
  return (
    <header className="border-border bg-bg/85 sticky top-0 z-40 border-b backdrop-blur">
      <div className="max-w-content mx-auto flex h-16 items-center justify-between gap-4 px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2" aria-label="DesiHub home">
          <span className="bg-accent inline-block h-7 w-7 rounded-md" aria-hidden />
          <span className="font-display text-lg font-semibold tracking-tight">DesiHub</span>
        </Link>

        <nav className="flex items-center gap-1 sm:gap-2" aria-label="Primary">
          <Link
            href="/browse"
            className="rounded-pill text-fg-muted hover:bg-surface-hover hover:text-fg hidden px-3 py-2 text-sm font-medium transition-colors sm:inline-block"
          >
            Browse
          </Link>
          <Link
            href="/browse?price=free"
            className="rounded-pill text-fg-muted hover:bg-surface-hover hover:text-fg hidden px-3 py-2 text-sm font-medium transition-colors sm:inline-block"
          >
            Free events
          </Link>
          <Link
            href="/submit"
            className="rounded-pill bg-accent text-accent-fg hover:bg-accent-hover px-4 py-2 text-sm font-semibold transition-colors"
          >
            Submit event
          </Link>
          <ThemeToggle />
        </nav>
      </div>
    </header>
  );
}

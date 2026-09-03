import Link from 'next/link';
import { ThemeToggle } from './theme-toggle';
import { HeaderCitySelect } from './header-city-select';
import { HeaderCategoryTabs } from './header-category-tabs';
import { AnnouncementRibbon } from './announcement-ribbon';

export function SiteHeader() {
  return (
    <header className="border-border border-b">
      {/* Scrolls away with the page — only the nav row below stays pinned. */}
      <AnnouncementRibbon />

      <div className="bg-bg/85 sticky top-0 z-40 backdrop-blur">
        <div className="max-w-content mx-auto flex h-16 items-center gap-3 px-4 sm:px-6">
          <Link href="/" className="flex shrink-0 items-center gap-2" aria-label="DesiHub home">
            <span className="bg-accent inline-block h-7 w-7 rounded-md" aria-hidden />
            <span className="font-display text-lg font-semibold tracking-tight">DesiHub</span>
          </Link>

          <HeaderCitySelect />

          <div className="flex flex-1 justify-center overflow-hidden">
            <HeaderCategoryTabs />
          </div>

          <nav className="flex shrink-0 items-center gap-1 sm:gap-2" aria-label="Primary">
            <Link
              href="/browse"
              className="rounded-pill text-fg-muted hover:bg-surface-hover hover:text-fg hidden px-3 py-2 text-sm font-medium transition-colors sm:inline-block lg:hidden"
            >
              Browse
            </Link>
            <Link
              href="/browse"
              aria-label="Search events"
              className="hover:bg-surface-hover hidden h-9 w-9 items-center justify-center rounded-full transition-colors sm:inline-flex"
            >
              <span aria-hidden>🔍</span>
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
      </div>
    </header>
  );
}

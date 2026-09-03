import Link from 'next/link';
import { HeaderCitySelect } from './header-city-select';
import { HeaderCategoryTabs } from './header-category-tabs';
import { AnnouncementRibbon } from './announcement-ribbon';
import { Logo } from './logo';
import { Button } from './ui/button';
import { IconSearch } from './ui/icons';

export function SiteHeader() {
  return (
    <header className="border-border border-b">
      {/* Scrolls away with the page — only the nav row below stays pinned. */}
      <AnnouncementRibbon />

      <div className="bg-bg/90 sticky top-0 z-40 backdrop-blur">
        <div className="max-w-content mx-auto flex h-16 items-center gap-3 px-4 sm:px-6">
          <Link href="/" className="shrink-0" aria-label="DesiHub home">
            <Logo />
          </Link>

          <HeaderCitySelect />

          <div className="flex flex-1 justify-center overflow-hidden">
            <HeaderCategoryTabs />
          </div>

          <nav className="flex shrink-0 items-center gap-1 sm:gap-2" aria-label="Primary">
            <Link
              href="/browse"
              className="text-fg-muted hover:bg-bg-subtle hover:text-fg hidden rounded-md px-3 py-2 text-sm font-medium transition-colors sm:inline-block lg:hidden"
            >
              Browse
            </Link>
            <Link
              href="/browse"
              aria-label="Search events"
              className="text-fg-muted hover:bg-bg-subtle hover:text-fg hidden h-10 w-10 items-center justify-center rounded-full transition-colors sm:inline-flex"
            >
              <IconSearch />
            </Link>
            <Button href="/submit" size="sm">
              Submit event
            </Button>
          </nav>
        </div>
      </div>
    </header>
  );
}

import Link from 'next/link';
import type { AccountUser } from '@desihub/shared';
import { HeaderCitySelect } from './header-city-select';
import { HeaderAccount } from './header-account';
import { AnnouncementRibbon } from './announcement-ribbon';
import { Logo } from './logo';
import { Button } from './ui/button';
import { IconSearch } from './ui/icons';

/**
 * Every nav item points somewhere real: the three discovery links are
 * homepage sections, so they scroll rather than 404. Nothing here is a
 * placeholder link.
 */
const NAV = [
  { href: '/browse', label: 'Events' },
  { href: '/#categories', label: 'Categories' },
  { href: '/#venues', label: 'Venues' },
  { href: '/#artists', label: 'Artists' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
] as const;

export function SiteHeader({ user }: { user: AccountUser | null }) {
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

          <nav
            className="hidden flex-1 items-center justify-center gap-1 lg:flex"
            aria-label="Primary"
          >
            {NAV.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className="text-fg-muted hover:bg-bg-subtle hover:text-fg rounded-md px-3 py-2 text-sm font-semibold transition-colors"
              >
                {label}
              </Link>
            ))}
          </nav>

          <div className="ml-auto flex shrink-0 items-center gap-1 sm:gap-2 lg:ml-0">
            <Link
              href="/browse"
              aria-label="Search events"
              className="text-fg-muted hover:bg-bg-subtle hover:text-fg hidden h-10 w-10 items-center justify-center rounded-full transition-colors sm:inline-flex"
            >
              <IconSearch />
            </Link>
            <Button href="/submit" size="sm">
              List Your Event
            </Button>
            <HeaderAccount user={user} />
          </div>
        </div>
      </div>
    </header>
  );
}

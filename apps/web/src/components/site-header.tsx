import Link from 'next/link';
import type { AccountUser } from '@desihub/shared';
import { HeaderCitySelect } from './header-city-select';
import { HeaderSearch } from './header-search';
import { HeaderAccount } from './header-account';
import { Logo } from './logo';
import { IconSearch } from './ui/icons';

/**
 * Logo, city, search, account — one line. Search used to live only in a
 * large box inside the homepage hero, reachable from nowhere else; it's
 * here now (an inline box from `lg` up, a plain icon into /browse below
 * that — a compact box has no room next to the city pill on a phone
 * screen) so it's one tap away on every page, not just the homepage.
 *
 * Full site navigation (Events, Categories, Organisers, About, Contact,
 * Support) lives in the footer, which every page carries; category
 * browsing itself happens through the homepage's category row and the
 * /browse page's own filters, not a header nav bar.
 */
export function SiteHeader({ user }: { user: AccountUser | null }) {
  return (
    <header className="bg-bg/90 border-border sticky top-0 z-40 border-b backdrop-blur">
      <div className="flex h-16 items-center gap-3 px-4 sm:px-6 lg:px-10">
        <Link href="/" className="shrink-0" aria-label="DesiHub home">
          <Logo />
        </Link>

        <HeaderCitySelect />

        <HeaderSearch className="hidden max-w-sm flex-1 lg:flex" />

        <div className="ml-auto flex shrink-0 items-center gap-1 sm:gap-2">
          <Link
            href="/browse"
            aria-label="Search events"
            className="text-fg-muted hover:text-accent hover:bg-bg-subtle flex h-9 w-9 items-center justify-center rounded-full transition-colors lg:hidden"
          >
            <IconSearch width={18} height={18} />
          </Link>
          <HeaderAccount user={user} />
        </div>
      </div>
    </header>
  );
}

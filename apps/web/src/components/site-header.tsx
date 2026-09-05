import Link from 'next/link';
import type { AccountUser } from '@desihub/shared';
import { HeaderCitySelect } from './header-city-select';
import { HeaderSearch } from './header-search';
import { HeaderAccount } from './header-account';
import { Logo } from './logo';

/**
 * Logo, city, search, account.
 *
 * The layout splits by breakpoint because the two sizes want different
 * things. From `lg` up everything sits on one line with search inline
 * between the city pill and the account corner.
 *
 * Below that the header is two rows, matching the reference: brand on the
 * left, the city pill, the account avatar hard right — then search as its
 * own full-width row underneath. Search used to be an icon here that simply
 * linked to /browse, so "search" cost a page load before you could type a
 * single character. It is a real input now: you type where you tapped, and
 * Enter takes you to the results.
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
          <HeaderAccount user={user} />
        </div>
      </div>

      {/* Mobile search row. Full width because it is the only thing on its
          line — a compact box squeezed next to the city pill is what forced
          the old icon-link compromise in the first place. */}
      <div className="border-border/70 border-t px-4 py-2.5 sm:px-6 lg:hidden">
        <HeaderSearch className="flex w-full" />
      </div>
    </header>
  );
}

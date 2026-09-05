import Link from 'next/link';
import type { AccountUser } from '@desihub/shared';
import { HeaderCitySelect } from './header-city-select';
import { HeaderAccount } from './header-account';
import { Logo } from './logo';

/**
 * Logo, city, account — nothing else. Full site navigation (Events,
 * Categories, Organisers, About, Contact, Support) lives in the footer,
 * which every page carries; category browsing itself happens through the
 * homepage's category row and the /browse page's own filters, not a header
 * nav bar.
 */
export function SiteHeader({ user }: { user: AccountUser | null }) {
  return (
    <header className="border-border border-b">
      <div className="bg-bg/90 sticky top-0 z-40 backdrop-blur">
        <div className="max-w-content mx-auto flex h-16 items-center gap-3 px-4 sm:px-6">
          <Link href="/" className="shrink-0" aria-label="DesiHub home">
            <Logo />
          </Link>

          <HeaderCitySelect />

          <div className="ml-auto flex shrink-0 items-center gap-1 sm:gap-2">
            <HeaderAccount user={user} />
          </div>
        </div>
      </div>
    </header>
  );
}

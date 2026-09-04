'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { IconHeart, IconUsers, IconCheckCircle, IconTicket } from './ui/icons';
import { cn } from '@/lib/cn';

const TABS = [
  { href: '/account', label: 'Profile', Icon: IconCheckCircle },
  { href: '/account/tickets', label: 'My tickets', Icon: IconTicket },
  { href: '/account/saved', label: 'Saved events', Icon: IconHeart },
  { href: '/account/following', label: 'Following', Icon: IconUsers },
] as const;

export function AccountTabs() {
  const pathname = usePathname();

  return (
    <nav aria-label="Account sections" className="border-border mt-6 flex gap-1 border-b">
      {TABS.map(({ href, label, Icon }) => {
        const active = pathname === href;
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? 'page' : undefined}
            className={cn(
              '-mb-px inline-flex items-center gap-1.5 border-b-2 px-3 py-2.5 text-sm font-semibold transition-colors',
              active
                ? 'border-accent text-accent'
                : 'text-fg-muted hover:text-fg border-transparent',
            )}
          >
            <Icon width={15} height={15} />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}

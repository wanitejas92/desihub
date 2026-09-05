'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  IconShieldCheck,
  IconCheckCircle,
  IconCalendarPlus,
  IconUsers,
  IconSparkle,
  IconPalette,
  IconMapPin,
} from '../ui/icons';
import { cn } from '@/lib/cn';

const TABS = [
  { href: '/admin', label: 'Overview', Icon: IconShieldCheck },
  { href: '/admin/events', label: 'Review queue', Icon: IconCheckCircle },
  { href: '/admin/events/new', label: 'Add event', Icon: IconCalendarPlus },
  { href: '/admin/users', label: 'People', Icon: IconUsers },
  { href: '/admin/banners', label: 'Banners', Icon: IconPalette },
  { href: '/admin/cities', label: 'Cities', Icon: IconMapPin },
  { href: '/admin/import', label: 'Import', Icon: IconSparkle },
] as const;

export function AdminTabs({ pendingCount }: { pendingCount: number }) {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Admin sections"
      className="border-border mt-6 flex gap-1 overflow-x-auto border-b"
    >
      {TABS.map(({ href, label, Icon }) => {
        // `/admin` is the index, so it matches exactly; the rest match their
        // subtree, minus the more specific sibling (`/admin/events/new`).
        const active =
          href === '/admin'
            ? pathname === '/admin'
            : href === '/admin/events'
              ? pathname === '/admin/events'
              : pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? 'page' : undefined}
            className={cn(
              '-mb-px inline-flex shrink-0 items-center gap-1.5 border-b-2 px-3 py-2.5 text-sm font-semibold transition-colors',
              active
                ? 'border-accent text-accent'
                : 'text-fg-muted hover:text-fg border-transparent',
            )}
          >
            <Icon width={15} height={15} />
            {label}
            {href === '/admin/events' && pendingCount > 0 && (
              <span className="bg-accent text-bg ml-0.5 rounded-full px-1.5 py-0.5 text-[10px] leading-none font-bold">
                {pendingCount}
              </span>
            )}
          </Link>
        );
      })}
    </nav>
  );
}

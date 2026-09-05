'use client';

import { usePathname } from 'next/navigation';
import { SiteFooter } from './site-footer';

/**
 * A client boundary rather than a `headers()` check in the root layout:
 * `headers()`/`cookies()` in a server component opts that route out of
 * static rendering, and the root layout wraps every page — using it there
 * to skip the footer on one route would have made the whole site render
 * dynamically instead of statically. `usePathname()` costs nothing at the
 * page level since it only runs client-side after hydration.
 */
export function ConditionalFooter() {
  const pathname = usePathname();
  if (pathname.startsWith('/e/')) return null;
  return <SiteFooter />;
}

import type { ReactNode } from 'react';
import type { Metadata } from 'next';
import { requireAdmin } from '@/lib/account/guards';
import { getAdminRepository } from '@/lib/admin';
import { AdminTabs } from '@/components/admin/admin-tabs';

export const metadata: Metadata = {
  title: 'Admin',
  robots: { index: false, follow: false },
};

// Moderation state changes under you; nothing here may be cached.
export const dynamic = 'force-dynamic';

/**
 * The gate for everything under `/admin`. A layout is the right place for it:
 * it runs before any nested page, so a new admin route is protected the
 * moment it is added rather than when someone remembers to add a check.
 */
export default async function AdminLayout({ children }: { children: ReactNode }) {
  const admin = await requireAdmin();
  const repo = await getAdminRepository();
  const stats = repo ? await repo.stats() : null;

  return (
    <div className="max-w-content mx-auto px-4 py-8 sm:px-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-accent text-xs font-bold tracking-widest uppercase">Admin</p>
          <h1 className="font-display text-2xl leading-tight font-semibold sm:text-3xl">
            Moderation &amp; people
          </h1>
          <p className="text-fg-muted text-sm">Signed in as {admin.email}</p>
        </div>
      </div>

      <AdminTabs pendingCount={stats?.pending ?? 0} />

      {!repo && (
        <p className="border-border bg-warning-bg text-fg-muted mt-6 rounded-lg border p-4 text-sm">
          Supabase is not configured in this environment, so there is nothing to moderate. The admin
          tools work against real rows only — set{' '}
          <code className="text-fg font-mono text-xs">NEXT_PUBLIC_SUPABASE_URL</code> and{' '}
          <code className="text-fg font-mono text-xs">NEXT_PUBLIC_SUPABASE_ANON_KEY</code> to use
          them.
        </p>
      )}

      <div className="mt-6">{children}</div>
    </div>
  );
}

import Link from 'next/link';
import { getAdminRepository } from '@/lib/admin';
import { ReviewCard } from '@/components/admin/review-card';
import { cn } from '@/lib/cn';

const FILTERS = [
  { key: 'draft', label: 'Awaiting review' },
  { key: 'published', label: 'Published' },
  { key: 'rejected', label: 'Turned down' },
] as const;

type FilterKey = (typeof FILTERS)[number]['key'];

export default async function AdminEventsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const active: FilterKey = FILTERS.some((f) => f.key === status) ? (status as FilterKey) : 'draft';

  const repo = await getAdminRepository();
  if (!repo) return null;
  const events = await repo.listByStatus(active);

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <Link
            key={f.key}
            href={`/admin/events?status=${f.key}`}
            aria-current={f.key === active ? 'page' : undefined}
            className={cn(
              'rounded-pill border px-3 py-1.5 text-xs font-semibold transition-colors',
              f.key === active
                ? 'border-accent bg-accent-subtle text-accent'
                : 'border-border text-fg-muted hover:text-fg',
            )}
          >
            {f.label}
          </Link>
        ))}
      </div>

      {events.length === 0 ? (
        <p className="border-border text-fg-muted mt-5 rounded-lg border border-dashed p-8 text-center text-sm">
          {active === 'draft'
            ? 'Nothing waiting. Every submission has been reviewed.'
            : `No ${active} events.`}
        </p>
      ) : (
        <ul role="list" className="mt-5 space-y-3">
          {events.map((e) => (
            <ReviewCard key={e.id} event={e} />
          ))}
        </ul>
      )}
    </div>
  );
}

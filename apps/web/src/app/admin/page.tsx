import Link from 'next/link';
import { getAdminRepository } from '@/lib/admin';
import {
  IconCheckCircle,
  IconCalendarPlus,
  IconUsers,
  IconArrowRight,
} from '@/components/ui/icons';

export default async function AdminOverviewPage() {
  const repo = await getAdminRepository();
  if (!repo) return null;

  const [stats, queue] = await Promise.all([repo.stats(), repo.listByStatus('draft', 5)]);

  return (
    <div className="space-y-8">
      <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Stat label="Awaiting review" value={stats.pending} accent={stats.pending > 0} />
        <Stat label="Published" value={stats.published} />
        <Stat label="Organisers" value={stats.organisers} />
        <Stat label="People" value={stats.users} />
      </dl>

      <section>
        <div className="flex items-baseline justify-between gap-4">
          <h2 className="font-display text-lg font-semibold">Next in the queue</h2>
          <Link
            href="/admin/events"
            className="text-accent inline-flex items-center gap-1 text-sm font-semibold hover:underline"
          >
            Review all <IconArrowRight width={14} height={14} />
          </Link>
        </div>

        {queue.length === 0 ? (
          <p className="border-border text-fg-muted mt-3 rounded-lg border border-dashed p-6 text-center text-sm">
            Nothing waiting. Every submission has been reviewed.
          </p>
        ) : (
          <ul role="list" className="border-border mt-3 divide-y rounded-lg border">
            {queue.map((e) => (
              <li key={e.id} className="flex items-center justify-between gap-4 px-4 py-3">
                <div className="min-w-0">
                  <p className="text-fg truncate text-sm font-semibold">{e.title}</p>
                  <p className="text-fg-muted truncate text-xs">
                    {e.organiser_name}
                    {e.city ? ` · ${e.city}` : ''}
                  </p>
                </div>
                <Link
                  href="/admin/events"
                  className="text-accent shrink-0 text-xs font-semibold hover:underline"
                >
                  Review
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section>
        <h2 className="font-display text-lg font-semibold">Shortcuts</h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-3">
          <Shortcut
            href="/admin/events"
            Icon={IconCheckCircle}
            title="Review queue"
            body="Approve or turn down what organisers have submitted."
          />
          <Shortcut
            href="/admin/events/new"
            Icon={IconCalendarPlus}
            title="Add an event"
            body="One short form, straight to the live site — no review step."
          />
          <Shortcut
            href="/admin/users"
            Icon={IconUsers}
            title="People"
            body="Change who is an attendee, organiser or admin."
          />
        </div>
      </section>
    </div>
  );
}

function Stat({
  label,
  value,
  accent = false,
}: {
  label: string;
  value: number;
  accent?: boolean;
}) {
  return (
    <div className="border-border rounded-lg border p-4">
      <dt className="text-fg-muted text-xs font-semibold tracking-wide uppercase">{label}</dt>
      <dd
        className={`font-display mt-1 text-2xl font-semibold tabular-nums ${
          accent ? 'text-accent' : 'text-fg'
        }`}
      >
        {value}
      </dd>
    </div>
  );
}

function Shortcut({
  href,
  Icon,
  title,
  body,
}: {
  href: string;
  Icon: (p: { width?: number; height?: number; className?: string }) => React.ReactElement;
  title: string;
  body: string;
}) {
  return (
    <Link
      href={href}
      className="border-border hover:border-accent group rounded-lg border p-4 transition-colors"
    >
      <Icon width={18} height={18} className="text-accent" />
      <p className="text-fg group-hover:text-accent mt-2 text-sm font-semibold transition-colors">
        {title}
      </p>
      <p className="text-fg-muted mt-1 text-xs">{body}</p>
    </Link>
  );
}

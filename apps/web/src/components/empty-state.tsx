import Link from 'next/link';
import { cn } from '@/lib/cn';

interface EmptyStateProps {
  title: string;
  description?: string;
  action?: { href: string; label: string };
  icon?: string;
  className?: string;
}

/** Designed empty state — every list uses one when it has no items. */
export function EmptyState({ title, description, action, icon = '✦', className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        'border-border bg-bg-subtle flex flex-col items-center justify-center rounded-md border border-dashed px-6 py-16 text-center',
        className,
      )}
    >
      <span aria-hidden className="text-accent text-3xl">
        {icon}
      </span>
      <h3 className="font-display text-fg mt-3 text-xl font-semibold">{title}</h3>
      {description && <p className="text-fg-muted mt-2 max-w-sm text-sm">{description}</p>}
      {action && (
        <Link
          href={action.href}
          className="rounded-pill bg-accent text-accent-fg hover:bg-accent-hover mt-5 px-5 py-2.5 text-sm font-semibold transition-colors"
        >
          {action.label}
        </Link>
      )}
    </div>
  );
}

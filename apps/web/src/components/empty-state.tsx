import { cn } from '@/lib/cn';
import { Button } from './ui/button';
import { IconSparkle } from './ui/icons';

interface EmptyStateProps {
  title: string;
  description?: string;
  action?: { href: string; label: string };
  className?: string;
}

/** Designed empty state — every list uses one when it has no items. */
export function EmptyState({ title, description, action, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        'border-border bg-bg-subtle flex flex-col items-center justify-center rounded-lg border border-dashed px-6 py-16 text-center',
        className,
      )}
    >
      <IconSparkle className="text-accent" width={28} height={28} />
      <h3 className="font-display text-fg mt-3 text-xl font-semibold">{title}</h3>
      {description && <p className="text-fg-muted mt-2 max-w-sm text-sm">{description}</p>}
      {action && (
        <Button href={action.href} className="mt-5">
          {action.label}
        </Button>
      )}
    </div>
  );
}

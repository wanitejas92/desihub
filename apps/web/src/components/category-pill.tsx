import { EVENT_CATEGORY_LABELS, type EventCategory } from '@desihub/shared';
import { cn } from '@/lib/cn';

export function CategoryPill({
  category,
  className,
}: {
  category: EventCategory;
  className?: string;
}) {
  return (
    <span
      className={cn(
        'rounded-pill bg-bg/85 text-fg inline-flex items-center px-2.5 py-1 text-xs font-semibold backdrop-blur',
        className,
      )}
    >
      {EVENT_CATEGORY_LABELS[category]}
    </span>
  );
}

import { dateChip } from '@desihub/shared';
import { cn } from '@/lib/cn';

/** The floating date chip used on event cards and the event hero. */
export function DateChip({ startsAt, className }: { startsAt: string; className?: string }) {
  const chip = dateChip(startsAt);
  return (
    <span
      className={cn(
        'bg-surface border-border shadow-elevation inline-flex flex-col items-center rounded-md border px-2.5 py-1.5 text-center leading-none',
        className,
      )}
    >
      <span className="text-fg text-lg font-bold tabular-nums">{chip.day}</span>
      <span className="text-accent mt-0.5 text-[10px] font-bold tracking-widest">{chip.month}</span>
    </span>
  );
}

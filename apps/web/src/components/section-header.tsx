import Link from 'next/link';
import { IconChevronRight } from './ui/icons';

/**
 * One section heading, used by every section on every page.
 *
 * Section headings were being written inline at each call site, so they had
 * drifted: some carried an icon, some didn't, and all of them sat at 18–20px
 * — small enough that a page of six sections read as one undifferentiated
 * list with bold text sprinkled through it. A single component means the
 * rhythm of the page is decided once.
 *
 * The optional `eyebrow` is where a section says *why* it exists ("Happening
 * this month", "Near you"). It carries the small-caps label; the heading
 * itself stays a plain noun phrase.
 */
export function SectionHeader({
  title,
  eyebrow,
  description,
  href,
  linkLabel = 'See all',
}: {
  title: string;
  eyebrow?: string;
  description?: string;
  href?: string;
  linkLabel?: string;
}) {
  return (
    <div className="mb-6 flex items-end justify-between gap-6 sm:mb-8">
      <div className="min-w-0">
        {eyebrow && <p className="eyebrow mb-2">{eyebrow}</p>}
        <h2 className="font-display text-fg text-xl font-bold sm:text-2xl">{title}</h2>
        {description && (
          <p className="text-fg-muted mt-2 max-w-prose text-sm sm:text-base">{description}</p>
        )}
      </div>
      {href && (
        <Link
          href={href}
          className="text-fg-muted hover:text-accent group inline-flex shrink-0 items-center gap-1 pb-1 text-sm font-semibold transition-colors"
        >
          {linkLabel}
          <IconChevronRight
            width={14}
            height={14}
            className="transition-transform duration-150 ease-out group-hover:translate-x-0.5"
          />
        </Link>
      )}
    </div>
  );
}

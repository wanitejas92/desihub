import Link from 'next/link';
import { EVENT_CATEGORIES, EVENT_CATEGORY_LABELS } from '@desihub/shared';
import { CATEGORY_ICON } from '@/lib/category-icons';

const TONE_BG = [
  'bg-accent-subtle text-accent',
  'bg-accent-pink-subtle text-accent-pink',
  'bg-accent-purple-subtle text-accent-purple',
];

export function CategoryTiles() {
  return (
    <section className="max-w-content mx-auto px-4 py-6 sm:px-6">
      <h2 className="font-display mb-4 text-lg font-semibold sm:text-xl">Browse by category</h2>
      <ul role="list" className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {EVENT_CATEGORIES.map((c, i) => {
          const Icon = CATEGORY_ICON[c];
          return (
            <li key={c}>
              <Link
                href={`/browse?category=${c}`}
                className="border-border bg-surface hover:border-accent shadow-elevation flex items-center gap-3 rounded-lg border px-4 py-3 transition-colors"
              >
                <span
                  aria-hidden
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-md ${TONE_BG[i % TONE_BG.length]}`}
                >
                  <Icon width={18} height={18} />
                </span>
                <span className="text-fg text-sm font-semibold">{EVENT_CATEGORY_LABELS[c]}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

import Link from 'next/link';
import { EVENT_CATEGORIES, EVENT_CATEGORY_LABELS } from '@desihub/shared';

const CATEGORY_EMOJI: Record<string, string> = {
  concert: '🎤',
  party: '🪩',
  garba_dandiya: '🩰',
  diwali: '🪔',
  holi: '🎨',
  temple: '🛕',
  cultural: '🎭',
  comedy: '😂',
  food: '🍛',
  family: '🧒',
  workshop: '🥁',
  networking: '🤝',
};

export function CategoryTiles() {
  return (
    <section className="max-w-content mx-auto px-4 py-6 sm:px-6">
      <h2 className="font-display mb-4 text-xl font-semibold sm:text-2xl">Browse by category</h2>
      <ul role="list" className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {EVENT_CATEGORIES.map((c) => (
          <li key={c}>
            <Link
              href={`/browse?category=${c}`}
              className="border-border bg-surface hover:border-accent hover:bg-surface-hover flex items-center gap-3 rounded-md border px-4 py-3 transition-colors"
            >
              <span aria-hidden className="text-xl">
                {CATEGORY_EMOJI[c]}
              </span>
              <span className="text-fg text-sm font-semibold">{EVENT_CATEGORY_LABELS[c]}</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

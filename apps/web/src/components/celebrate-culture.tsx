import Link from 'next/link';
import { IconDiya, IconDance, IconPalette, IconTemple, IconDrum } from './ui/icons';

/**
 * "Celebrate Culture" — warmer and more elegant than the nightlife rails,
 * but built from the same tokens so it still reads as one site. Each tile
 * is a real filter into /browse, not decoration.
 */
const CELEBRATIONS = [
  {
    label: 'Diwali',
    href: '/browse?category=diwali',
    Icon: IconDiya,
    from: '#FFB35C',
    to: '#F0446F',
  },
  {
    label: 'Garba & Dandiya',
    href: '/browse?category=garba_dandiya',
    Icon: IconDance,
    from: '#FF8A00',
    to: '#E0345C',
  },
  {
    label: 'Holi',
    href: '/browse?category=holi',
    Icon: IconPalette,
    from: '#F0446F',
    to: '#7B35D6',
  },
  {
    label: 'Pooja & Temple',
    href: '/browse?category=temple',
    Icon: IconTemple,
    from: '#7B35D6',
    to: '#4C6FE0',
  },
  {
    label: 'Cultural nights',
    href: '/browse?category=cultural',
    Icon: IconDrum,
    from: '#9B5CE0',
    to: '#F0446F',
  },
] as const;

export function CelebrateCulture() {
  return (
    <section className="max-w-content mx-auto px-4 py-8 sm:px-6">
      <h2 className="font-display text-fg text-lg font-semibold sm:text-xl">Celebrate culture</h2>
      <p className="text-fg-muted mt-1 text-sm">
        The festivals the community actually turns out for, all year round.
      </p>

      <ul role="list" className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {CELEBRATIONS.map(({ label, href, Icon, from, to }) => (
          <li key={label}>
            <Link
              href={href}
              className="group relative flex aspect-[4/5] flex-col justify-end overflow-hidden rounded-2xl p-4 sm:aspect-[3/4]"
              style={{ backgroundImage: `linear-gradient(150deg, ${from}, ${to})` }}
            >
              <span
                aria-hidden
                className="absolute -top-3 -right-3 text-white/15 transition-transform duration-300 group-hover:scale-110"
              >
                <Icon width={104} height={104} />
              </span>
              <span
                aria-hidden
                className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"
              />
              <span className="relative text-[0.95rem] leading-tight font-bold text-white">
                {label}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

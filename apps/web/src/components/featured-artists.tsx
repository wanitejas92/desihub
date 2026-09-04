import Link from 'next/link';
import { artistAvatarDataUri } from '@/lib/artist-avatar';

/**
 * Featured artists. There is no artist entity in the schema yet, so each
 * name links into a search for their events rather than a profile route
 * that doesn't exist — the promise ("see their upcoming events") is kept,
 * the fiction (a full artist profile) isn't invented.
 *
 * Avatars are generated monogram art for the same reason event cards carry
 * generated posters: no scraped press photos, and never a broken image.
 */
const ARTISTS = [
  'Armaan Malik',
  'Diljit Dosanjh',
  'Badshah',
  'DJ Chetas',
  'Sunidhi Chauhan',
  'Kavita Seth',
] as const;

export function FeaturedArtists() {
  return (
    <section id="artists" className="max-w-content mx-auto px-4 py-8 sm:px-6">
      <h2 className="font-display text-fg mb-5 text-lg font-semibold sm:text-xl">
        Featured artists
      </h2>

      <ul role="list" className="grid grid-cols-3 gap-5 sm:grid-cols-6">
        {ARTISTS.map((name, i) => (
          <li key={name}>
            <Link
              href={`/browse?q=${encodeURIComponent(name)}`}
              className="group flex flex-col items-center gap-2.5 text-center"
            >
              <span className="ring-border group-hover:ring-accent relative block h-20 w-20 overflow-hidden rounded-full ring-1 transition-all duration-200 group-hover:ring-2 sm:h-24 sm:w-24">
                {/* eslint-disable-next-line @next/next/no-img-element -- generated data-URI SVG, not a remote asset */}
                <img
                  src={artistAvatarDataUri(name, i)}
                  alt=""
                  aria-hidden
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
              </span>
              <span className="text-fg group-hover:text-accent text-sm font-semibold transition-colors">
                {name}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

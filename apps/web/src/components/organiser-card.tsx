import Link from 'next/link';

interface OrganiserCardProps {
  name: string;
  slug: string;
  verified: boolean;
  city?: string | null;
  bio?: string | null;
}

export function OrganiserCard({ name, slug, verified, city, bio }: OrganiserCardProps) {
  return (
    <div className="border-border bg-surface rounded-md border p-4">
      <p className="text-fg-subtle text-xs font-semibold tracking-wide uppercase">Organised by</p>
      <div className="mt-2 flex items-start gap-3">
        <span
          aria-hidden
          className="rounded-pill bg-accent-subtle font-display text-accent flex h-11 w-11 shrink-0 items-center justify-center text-lg font-semibold"
        >
          {name.charAt(0)}
        </span>
        <div className="min-w-0">
          <Link href={`/o/${slug}`} className="text-fg hover:text-accent font-semibold">
            {name}
            {verified && (
              <span className="text-accent ml-1" title="Verified organiser" aria-label="Verified">
                ✓
              </span>
            )}
          </Link>
          {city && <p className="text-fg-muted text-sm">{city}</p>}
          {bio && <p className="text-fg-muted mt-1 line-clamp-2 text-sm">{bio}</p>}
        </div>
      </div>
    </div>
  );
}

import Link from 'next/link';
import { FollowButton } from './follow-button';
import { IconCheckCircle } from './ui/icons';

interface OrganiserCardProps {
  name: string;
  slug: string;
  verified: boolean;
  city?: string | null;
  bio?: string | null;
  showFollow?: boolean;
}

export function OrganiserCard({ name, slug, verified, city, bio, showFollow }: OrganiserCardProps) {
  return (
    <div className="border-border bg-surface shadow-elevation rounded-lg border p-4">
      <p className="text-fg-subtle text-xs font-semibold tracking-wide uppercase">Organised by</p>
      <div className="mt-2 flex items-start gap-3">
        <span
          aria-hidden
          className="rounded-pill bg-accent-subtle font-display text-accent flex h-11 w-11 shrink-0 items-center justify-center text-lg font-semibold"
        >
          {name.charAt(0)}
        </span>
        <div className="min-w-0 flex-1">
          <Link href={`/o/${slug}`} className="text-fg hover:text-accent font-semibold">
            {name}
            {verified && (
              <span
                className="text-accent ml-1 inline-flex align-middle"
                title="Verified organiser"
                aria-label="Verified"
              >
                <IconCheckCircle width={14} height={14} />
              </span>
            )}
          </Link>
          {city && <p className="text-fg-muted text-sm">{city}</p>}
          {bio && <p className="text-fg-muted mt-1 line-clamp-2 text-sm">{bio}</p>}
        </div>
      </div>
      {showFollow && (
        <div className="mt-3">
          <FollowButton organiserSlug={slug} organiserName={name} />
        </div>
      )}
    </div>
  );
}

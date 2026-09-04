import Link from 'next/link';
import Image from 'next/image';
import { FollowButton } from '@/components/follow-button';
import { IconCheckCircle } from '@/components/ui/icons';

export function EventOrganiserCard({
  id,
  name,
  slug,
  verified,
  logoUrl,
  followerCount,
}: {
  id: string;
  name: string;
  slug: string;
  verified: boolean;
  logoUrl: string | null;
  followerCount: number;
}) {
  return (
    <div className="border-border bg-accent-subtle/40 flex items-center gap-3 rounded-2xl border p-4">
      <span className="bg-surface shadow-elevation relative h-12 w-12 shrink-0 overflow-hidden rounded-xl">
        {logoUrl ? (
          <Image src={logoUrl} alt="" fill sizes="48px" className="object-cover" />
        ) : (
          <span className="font-display text-accent flex h-full w-full items-center justify-center text-lg font-semibold">
            {name.charAt(0)}
          </span>
        )}
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
              <IconCheckCircle width={13} height={13} />
            </span>
          )}
        </Link>
        <p className="text-fg-muted text-sm">
          {followerCount} {followerCount === 1 ? 'Follower' : 'Followers'}
        </p>
      </div>

      <FollowButton organiserId={id} organiserName={name} size="sm" />
    </div>
  );
}

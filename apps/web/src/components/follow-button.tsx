'use client';

import { useEffect, useState } from 'react';

/**
 * Phase 1 follow: persisted per-device in localStorage so it works with no
 * account. Phase 2 migrates these into the `follows` table on sign-in.
 */
export function FollowButton({
  organiserSlug,
  organiserName,
}: {
  organiserSlug: string;
  organiserName: string;
}) {
  const key = 'desihub-follows';
  const [following, setFollowing] = useState(false);

  useEffect(() => {
    try {
      const set = new Set<string>(JSON.parse(localStorage.getItem(key) || '[]'));
      setFollowing(set.has(organiserSlug));
    } catch {
      /* storage blocked */
    }
  }, [organiserSlug]);

  function toggle() {
    const next = !following;
    setFollowing(next);
    try {
      const set = new Set<string>(JSON.parse(localStorage.getItem(key) || '[]'));
      if (next) set.add(organiserSlug);
      else set.delete(organiserSlug);
      localStorage.setItem(key, JSON.stringify([...set]));
    } catch {
      /* storage blocked */
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-pressed={following}
      className={
        following
          ? 'rounded-pill border-accent bg-accent-subtle text-fg inline-flex h-11 items-center gap-2 border px-5 text-sm font-semibold'
          : 'rounded-pill bg-accent text-accent-fg hover:bg-accent-hover inline-flex h-11 items-center gap-2 px-5 text-sm font-semibold transition-colors'
      }
    >
      {following ? '✓ Following' : `Follow ${organiserName.split(' ')[0]}`}
    </button>
  );
}

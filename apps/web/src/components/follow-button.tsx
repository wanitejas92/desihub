'use client';

import { useEffect, useState } from 'react';
import { Button } from './ui/button';
import { IconCheckCircle } from './ui/icons';

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
    <Button
      type="button"
      onClick={toggle}
      aria-pressed={following}
      variant={following ? 'soft' : 'primary'}
      pill
    >
      {following ? (
        <>
          <IconCheckCircle width={16} height={16} />
          Following
        </>
      ) : (
        `Follow ${organiserName.split(' ')[0]}`
      )}
    </Button>
  );
}

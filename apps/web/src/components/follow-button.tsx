'use client';

import { useAccount } from './account-provider';
import { Button } from './ui/button';
import { IconCheckCircle } from './ui/icons';

/**
 * Follow an organiser. Persisted to the `follows` table when signed in, to
 * this device when not — and the device's follows are folded into the
 * account on sign-in, so following before you have an account is never
 * wasted effort.
 */
export function FollowButton({
  organiserId,
  organiserName,
}: {
  organiserId: string;
  organiserName: string;
}) {
  const { isFollowing, toggleFollowing } = useAccount();
  const following = isFollowing(organiserId);

  return (
    <Button
      type="button"
      onClick={() => toggleFollowing(organiserId)}
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

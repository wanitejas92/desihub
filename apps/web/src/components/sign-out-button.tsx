'use client';

import { useRouter } from 'next/navigation';
import { useTransition } from 'react';
import { signOutAction } from '@/lib/account/actions';
import { Button } from './ui/button';

export function SignOutButton() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <Button
      type="button"
      variant="secondary"
      size="sm"
      disabled={pending}
      onClick={() =>
        startTransition(async () => {
          await signOutAction();
          router.replace('/' as never);
          router.refresh();
        })
      }
    >
      {pending ? 'Signing out…' : 'Sign out'}
    </Button>
  );
}

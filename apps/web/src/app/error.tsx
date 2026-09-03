'use client';

import { Button } from '@/components/ui/button';
import { IconAlertCircle } from '@/components/ui/icons';

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="max-w-content mx-auto flex flex-col items-center px-4 py-24 text-center sm:px-6">
      <IconAlertCircle className="text-error" width={40} height={40} />
      <h1 className="font-display mt-4 text-2xl font-semibold">Something went wrong</h1>
      <p className="text-fg-muted mt-2 max-w-sm">
        We hit a snag loading this page. Please try again.
      </p>
      <Button type="button" onClick={reset} className="mt-6">
        Try again
      </Button>
    </div>
  );
}

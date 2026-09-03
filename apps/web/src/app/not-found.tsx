import { Button } from '@/components/ui/button';
import { IconSparkle } from '@/components/ui/icons';

export default function NotFound() {
  return (
    <div className="max-w-content mx-auto flex flex-col items-center px-4 py-24 text-center sm:px-6">
      <IconSparkle className="text-accent" width={40} height={40} />
      <h1 className="font-display mt-4 text-3xl font-semibold">We couldn&apos;t find that page</h1>
      <p className="text-fg-muted mt-2 max-w-sm">
        The event or organiser may have moved, or the link is out of date.
      </p>
      <div className="mt-6 flex gap-3">
        <Button href="/">Go home</Button>
        <Button href="/browse" variant="secondary">
          Browse events
        </Button>
      </div>
    </div>
  );
}

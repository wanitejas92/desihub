import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="max-w-content mx-auto flex flex-col items-center px-4 py-24 text-center sm:px-6">
      <span aria-hidden className="font-display text-accent text-6xl">
        ✦
      </span>
      <h1 className="font-display mt-4 text-3xl font-semibold">We couldn&apos;t find that page</h1>
      <p className="text-fg-muted mt-2 max-w-sm">
        The event or organiser may have moved, or the link is out of date.
      </p>
      <div className="mt-6 flex gap-3">
        <Link
          href="/"
          className="rounded-pill bg-accent text-accent-fg hover:bg-accent-hover px-5 py-2.5 text-sm font-semibold"
        >
          Go home
        </Link>
        <Link
          href="/browse"
          className="rounded-pill border-border text-fg hover:bg-surface-hover border px-5 py-2.5 text-sm font-semibold"
        >
          Browse events
        </Link>
      </div>
    </div>
  );
}

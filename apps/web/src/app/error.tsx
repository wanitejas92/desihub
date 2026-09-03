'use client';

export default function Error({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="max-w-content mx-auto flex flex-col items-center px-4 py-24 text-center sm:px-6">
      <span aria-hidden className="text-5xl">
        😕
      </span>
      <h1 className="font-display mt-4 text-2xl font-semibold">Something went wrong</h1>
      <p className="text-fg-muted mt-2 max-w-sm">
        We hit a snag loading this page. Please try again.
      </p>
      <button
        type="button"
        onClick={reset}
        className="rounded-pill bg-accent text-accent-fg hover:bg-accent-hover mt-6 px-5 py-2.5 text-sm font-semibold"
      >
        Try again
      </button>
    </div>
  );
}

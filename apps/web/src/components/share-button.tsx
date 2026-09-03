'use client';

import { useState } from 'react';

export function ShareButton({ title, path }: { title: string; path: string }) {
  const [copied, setCopied] = useState(false);

  async function share() {
    const url = typeof window !== 'undefined' ? `${window.location.origin}${path}` : path;
    if (navigator.share) {
      try {
        await navigator.share({ title, url });
        return;
      } catch {
        /* user cancelled — fall through to copy */
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard blocked */
    }
  }

  return (
    <button
      type="button"
      onClick={share}
      className="rounded-pill border-border text-fg hover:bg-surface-hover inline-flex h-11 items-center gap-2 border px-4 text-sm font-semibold transition-colors"
    >
      <span aria-hidden>↗</span>
      {copied ? 'Link copied!' : 'Share'}
    </button>
  );
}

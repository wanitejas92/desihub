'use client';

import { useState } from 'react';
import { Button } from './ui/button';
import { IconShare, IconCheckCircle } from './ui/icons';

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
    <Button type="button" onClick={share} variant="secondary" pill>
      {copied ? <IconCheckCircle width={16} height={16} /> : <IconShare width={16} height={16} />}
      {copied ? 'Link copied!' : 'Share'}
    </Button>
  );
}

'use client';

import { useState, type MouseEvent } from 'react';
import { Button } from './ui/button';
import { IconShare, IconCheckCircle } from './ui/icons';
import { cn } from '@/lib/cn';

interface ShareButtonProps {
  title: string;
  path: string;
  /** 'pill' — full labelled button (event page). 'overlay' — small translucent
   *  circle for sitting on a card image, matching FavouriteButton's overlay. */
  variant?: 'pill' | 'overlay';
  className?: string;
}

export function ShareButton({ title, path, variant = 'pill', className }: ShareButtonProps) {
  const [copied, setCopied] = useState(false);

  async function share(e: MouseEvent) {
    // Cards wrap this in their own outer link — never let the share tap
    // double as a navigation.
    e.preventDefault();
    e.stopPropagation();

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

  if (variant === 'overlay') {
    return (
      <button
        type="button"
        onClick={share}
        aria-label={copied ? 'Link copied' : 'Share this event'}
        className={cn(
          'bg-surface/95 shadow-elevation text-fg-muted hover:text-fg inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full backdrop-blur transition-colors',
          copied && 'text-success',
          className,
        )}
      >
        {copied ? <IconCheckCircle width={15} height={15} /> : <IconShare width={15} height={15} />}
      </button>
    );
  }

  return (
    <Button type="button" onClick={share} variant="secondary" pill className={className}>
      {copied ? <IconCheckCircle width={16} height={16} /> : <IconShare width={16} height={16} />}
      {copied ? 'Link copied!' : 'Share'}
    </Button>
  );
}

'use client';

import type { MouseEvent } from 'react';
import { useFavourites } from '@/lib/use-favourites';
import { Button } from './ui/button';
import { IconHeart } from './ui/icons';
import { cn } from '@/lib/cn';

interface FavouriteButtonProps {
  eventId: string;
  /** 'overlay' — small translucent circle for sitting on an image (cards, hero).
   *  'inline' — a full Button, sized to match Share/AddToCalendar in a button row. */
  variant?: 'overlay' | 'inline';
  className?: string;
}

/** Save/unsave toggle — the one real per-browser "favourites" feature (no login system exists yet). */
export function FavouriteButton({ eventId, variant = 'overlay', className }: FavouriteButtonProps) {
  const { isFavourite, toggle } = useFavourites();
  const active = isFavourite(eventId);

  function handleClick(e: MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    toggle(eventId);
  }

  if (variant === 'inline') {
    return (
      <Button type="button" onClick={handleClick} variant="secondary" pill className={className}>
        <IconHeart
          width={16}
          height={16}
          className={active ? 'text-accent-pink' : undefined}
          fill={active ? 'currentColor' : 'none'}
        />
        {active ? 'Saved' : 'Save'}
      </Button>
    );
  }

  return (
    <button
      type="button"
      aria-pressed={active}
      aria-label={active ? 'Remove from favourites' : 'Save to favourites'}
      onClick={handleClick}
      className={cn(
        'bg-surface/95 shadow-elevation inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full backdrop-blur transition-colors',
        active ? 'text-accent-pink' : 'text-fg-muted hover:text-accent-pink',
        className,
      )}
    >
      <IconHeart width={16} height={16} fill={active ? 'currentColor' : 'none'} />
    </button>
  );
}

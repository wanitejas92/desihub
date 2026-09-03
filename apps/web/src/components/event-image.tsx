import Image from 'next/image';
import type { EventCategory } from '@desihub/shared';
import { fallbackCardDataUri } from '@/lib/fallback-card';
import { cn } from '@/lib/cn';

interface EventImageProps {
  imageUrl: string | null;
  title: string;
  category: EventCategory;
  startsAt: string;
  organiserName?: string;
  priority?: boolean;
  className?: string;
  sizes?: string;
  /** Fallback card dimensions — match the container aspect to avoid cropping. */
  fallbackWidth?: number;
  fallbackHeight?: number;
}

/**
 * Renders an event's image, or a branded fallback card when there is none. A
 * broken or empty image never renders — the fallback is always designed.
 */
export function EventImage({
  imageUrl,
  title,
  category,
  startsAt,
  organiserName,
  priority,
  className,
  sizes = '(max-width: 640px) 100vw, 400px',
  fallbackWidth,
  fallbackHeight,
}: EventImageProps) {
  if (imageUrl) {
    return (
      <Image
        src={imageUrl}
        alt={title}
        fill
        sizes={sizes}
        priority={priority}
        className={cn('object-cover', className)}
      />
    );
  }

  const src = fallbackCardDataUri({
    title,
    category,
    startsAt,
    organiserName,
    width: fallbackWidth,
    height: fallbackHeight,
  });
  return (
    // eslint-disable-next-line @next/next/no-img-element -- generated data-URI SVG, not a remote asset
    <img
      src={src}
      alt={title}
      // Fallback cards are inline data URIs (no network), so eager-loading them
      // avoids blank cards on fast scroll without any bandwidth cost. Real
      // uploaded images above use next/image and stay lazy by default.
      loading="eager"
      decoding="async"
      className={cn('absolute inset-0 h-full w-full object-cover', className)}
    />
  );
}

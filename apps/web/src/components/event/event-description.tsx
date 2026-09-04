'use client';

import { useState } from 'react';
import { IconChevronDown } from '@/components/ui/icons';

/**
 * Organiser copy varies from one line to a thousand words. Short descriptions
 * render whole; long ones clamp with a fade and a Read more.
 *
 * The full text is always in the DOM — clipped with CSS, not truncated in JS —
 * so search engines and screen readers get all of it regardless of state.
 */
const CLAMP_THRESHOLD = 420;

export function EventDescription({ text }: { text: string }) {
  const long = text.length > CLAMP_THRESHOLD;
  const [expanded, setExpanded] = useState(false);
  const clamped = long && !expanded;

  return (
    <div>
      <div className="relative">
        <p
          className="text-fg-muted max-w-prose leading-[1.75] whitespace-pre-line"
          style={
            clamped
              ? {
                  display: '-webkit-box',
                  WebkitLineClamp: 6,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                }
              : undefined
          }
        >
          {text}
        </p>
        {clamped && (
          <div
            aria-hidden
            className="from-bg pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t to-transparent"
          />
        )}
      </div>

      {long && (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          aria-expanded={expanded}
          className="text-accent mt-3 inline-flex items-center gap-1 text-sm font-semibold hover:underline"
        >
          {expanded ? 'Read less' : 'Read more'}
          <IconChevronDown
            width={14}
            height={14}
            className={expanded ? 'rotate-180 transition-transform' : 'transition-transform'}
          />
        </button>
      )}
    </div>
  );
}

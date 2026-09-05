'use client';

import { useState } from 'react';
import { buildIcs, googleCalendarUrl, type CalendarEventInput } from '@desihub/shared';
import { Button } from './ui/button';
import { IconCalendarPlus } from './ui/icons';

export type CalendarEvent = CalendarEventInput;

/** Add-to-calendar: Google link + a client-generated .ics download (no backend). */
export function AddToCalendar({
  event,
  label = 'Add to calendar',
  /** Full-width primary treatment, for when this *is* the booking CTA. */
  full,
  /** Same primary colour as `full`, but sized for the sticky pill, not stretched. */
  compact,
}: {
  event: CalendarEventInput;
  label?: string;
  full?: boolean;
  compact?: boolean;
}) {
  const [open, setOpen] = useState(false);

  function downloadIcs() {
    const blob = new Blob([buildIcs(event)], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${event.title.replace(/[^a-z0-9]+/gi, '-').toLowerCase()}.ics`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    setOpen(false);
  }

  return (
    <div className={full ? 'relative' : 'relative inline-block'}>
      <Button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="menu"
        variant={full || compact ? 'primary' : 'secondary'}
        pill={!full}
        className={full ? 'w-full' : undefined}
      >
        <IconCalendarPlus width={16} height={16} />
        {label}
      </Button>
      {open && (
        <div
          role="menu"
          className="border-border bg-surface shadow-elevation-lg absolute z-10 mt-2 w-48 overflow-hidden rounded-lg border"
        >
          <a
            role="menuitem"
            href={googleCalendarUrl(event)}
            target="_blank"
            rel="noopener noreferrer"
            className="text-fg hover:bg-bg-subtle block px-4 py-3 text-sm"
            onClick={() => setOpen(false)}
          >
            Google Calendar
          </a>
          <button
            role="menuitem"
            type="button"
            onClick={downloadIcs}
            className="text-fg hover:bg-bg-subtle block w-full px-4 py-3 text-left text-sm"
          >
            Apple / Outlook (.ics)
          </button>
        </div>
      )}
    </div>
  );
}

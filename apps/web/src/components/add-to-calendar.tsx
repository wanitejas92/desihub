'use client';

import { useState } from 'react';
import { buildIcs, googleCalendarUrl, type CalendarEventInput } from '@desihub/shared';
import { Button } from './ui/button';
import { IconCalendarPlus } from './ui/icons';

/** Add-to-calendar: Google link + a client-generated .ics download (no backend). */
export function AddToCalendar({ event }: { event: CalendarEventInput }) {
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
    <div className="relative">
      <Button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="menu"
        variant="secondary"
        pill
      >
        <IconCalendarPlus width={16} height={16} />
        Add to calendar
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

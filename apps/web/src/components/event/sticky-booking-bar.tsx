import type { BookingOption } from '@desihub/shared';
import { BookingCta } from './booking-card';
import type { CalendarEvent } from '@/components/add-to-calendar';

/**
 * The one place price and the primary CTA live — visible on every screen
 * size, pinned to the bottom regardless of scroll position. There used to
 * also be a full booking card inline in the page repeating the same price
 * and button; removed, so this is the only copy rather than a second one a
 * few centimetres away.
 *
 * A floating pill with visible page behind it on every side, not an
 * edge-to-edge gradient band — the colour now lives in the CTA button
 * alone, which is also why `BookingCta`'s compact variants below switched
 * from a white "stands out on a gradient" treatment to the brand gradient
 * itself: it needs to stand out on this white pill instead.
 */
export function StickyBookingBar({
  booking,
  calendarEvent,
}: {
  booking: BookingOption;
  calendarEvent: CalendarEvent;
}) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-30 px-4 pb-4 sm:px-6">
      <div className="max-w-content border-border bg-surface shadow-elevation-lg mx-auto flex items-center justify-between gap-4 rounded-2xl border px-5 py-3">
        <div className="min-w-0">
          <p className="text-fg-subtle text-xs font-semibold">{booking.label}</p>
          <p className="font-display text-fg truncate text-lg font-bold">
            {booking.priceLine || booking.compactLabel}
          </p>
        </div>
        <div className="shrink-0">
          <BookingCta option={booking} calendarEvent={calendarEvent} compact />
        </div>
      </div>
    </div>
  );
}

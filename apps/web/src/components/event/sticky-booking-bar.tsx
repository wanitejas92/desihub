import type { BookingOption } from '@desihub/shared';
import { BookingCta } from './booking-card';
import type { CalendarEvent } from '@/components/add-to-calendar';

/**
 * The one place price and the primary CTA live — visible on every screen
 * size, pinned to the bottom regardless of scroll position. There used to
 * also be a full booking card inline in the page repeating the same price
 * and button; removed, so this is the only copy rather than a second one a
 * few centimetres away.
 */
export function StickyBookingBar({
  booking,
  calendarEvent,
}: {
  booking: BookingOption;
  calendarEvent: CalendarEvent;
}) {
  return (
    <div
      className="shadow-elevation-lg fixed inset-x-0 bottom-0 z-30 flex items-center justify-between gap-4 px-4 py-3 sm:px-6"
      style={{ backgroundImage: 'linear-gradient(90deg, #FF8A00, #F0446F, #7B35D6)' }}
    >
      <div className="min-w-0">
        <p className="text-xs text-white/80">{booking.label}</p>
        <p className="font-display truncate text-lg font-semibold text-white">
          {booking.priceLine || booking.compactLabel}
        </p>
      </div>
      <div className="shrink-0">
        <BookingCta option={booking} calendarEvent={calendarEvent} compact />
      </div>
    </div>
  );
}

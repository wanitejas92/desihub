import type { BookingOption } from '@desihub/shared';
import { cn } from '@/lib/cn';
import { Button } from '@/components/ui/button';
import { AddToCalendar, type CalendarEvent } from '@/components/add-to-calendar';
import { ExternalBookingButton } from './external-booking-button';

/**
 * Renders a `BookingOption` and nothing else.
 *
 * This component has no idea whether the event is ticketed on DesiHub, sold on
 * the organiser's own site, free, or pay-at-the-door — it renders the four CTA
 * kinds the booking service can produce. That is the whole point of the
 * abstraction: adding Eventbrite later touches a provider, not this file.
 */
export function BookingCard({
  option,
  calendarEvent,
  children,
}: {
  option: BookingOption;
  calendarEvent: CalendarEvent;
  /** Native ticket selector, slotted in when the DesiHub provider is active. */
  children?: React.ReactNode;
}) {
  return (
    <div className="border-border/70 bg-surface shadow-elevation rounded-2xl border p-6">
      <p className="text-fg-subtle text-xs font-semibold tracking-[0.08em] uppercase">
        {option.label}
      </p>

      {option.priceLine && (
        <p
          className={cn(
            'font-display mt-1 font-bold tracking-tight whitespace-nowrap',
            option.available ? 'text-fg' : 'text-fg-muted',
            // A range ("€15.00 – €25.00") is twice the width of a single
            // price and must not wrap — a broken price line reads as a bug.
            option.priceLine.length > 14 ? 'text-xl' : 'text-2xl',
          )}
        >
          {option.priceLine}
        </p>
      )}

      <div className="mt-5">
        <BookingCta option={option} calendarEvent={calendarEvent} />
      </div>

      {option.note && (
        <p className="text-fg-subtle mt-3 text-center text-xs leading-relaxed">{option.note}</p>
      )}

      {/*
        The calendar is a secondary action wherever booking is the primary one —
        inside the card, not floating under it, so the aside reads as one object.
      */}
      {option.cta.kind !== 'calendar' && (
        <div className="border-border/70 mt-5 flex justify-center border-t pt-4">
          <AddToCalendar event={calendarEvent} />
        </div>
      )}

      {children}
    </div>
  );
}

export function BookingCta({
  option,
  calendarEvent,
  compact,
}: {
  option: BookingOption;
  calendarEvent: CalendarEvent;
  compact?: boolean;
}) {
  const { cta } = option;

  switch (cta.kind) {
    case 'external':
      return (
        <ExternalBookingButton
          url={cta.url}
          label={cta.label}
          destination={cta.destination}
          compact={compact}
        />
      );

    case 'internal':
      return (
        <Button
          href={cta.href}
          // Compact lives on the gradient sticky bar — the default gradient
          // button would disappear into it, so it switches to the white
          // "secondary" treatment the calendar CTA already uses there.
          variant={compact ? 'secondary' : 'primary'}
          className={compact ? 'h-11' : 'w-full'}
        >
          {cta.label}
        </Button>
      );

    case 'calendar':
      return <AddToCalendar event={calendarEvent} label={cta.label} full={!compact} />;

    case 'disabled':
      return (
        <div
          className={cn(
            'bg-bg-subtle text-fg-muted flex items-center justify-center rounded-md text-center font-semibold',
            compact ? 'h-11 px-5 text-sm whitespace-nowrap' : 'h-12 w-full',
          )}
        >
          {cta.label}
        </div>
      );
  }
}

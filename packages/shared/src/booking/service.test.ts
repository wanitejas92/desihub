import { afterEach, describe, expect, it } from 'vitest';
import { getBookingOptions, defaultBookingConfiguration } from './service';
import type { BookingConfiguration } from './types';

/**
 * These tests are the contract the event detail page relies on: whatever the
 * channel, it gets back one option it can render without branching.
 */

const base = {
  id: 'ev-1',
  slug: 'test-event',
  entry_type: 'paid' as const,
  is_free: false,
  min_price_cents: 1500,
  max_price_cents: 3500,
  currency: 'EUR',
  status: 'published' as const,
};

function config(over: Partial<BookingConfiguration> = {}): BookingConfiguration {
  return { ...defaultBookingConfiguration('ev-1', 'paid'), ...over };
}

afterEach(() => {
  delete process.env.DESIHUB_TICKETING;
});

describe('getBookingOptions', () => {
  it('sends a paid external event to the organiser, and says so', () => {
    const opt = getBookingOptions({
      ...base,
      booking: config({
        booking_type: 'external_url',
        provider: 'DesiBeats Events',
        booking_url: 'https://desibeats.example.org/tickets',
      }),
    });
    expect(opt.cta).toEqual({
      kind: 'external',
      label: 'Book now',
      url: 'https://desibeats.example.org/tickets',
      destination: 'DesiBeats Events',
    });
    expect(opt.priceLine).toBe('€15.00 – €35.00');
    // The disclosure is not optional — the visitor must know who takes payment.
    expect(opt.note).toContain('DesiBeats Events');
  });

  it('offers the calendar, not a ticket CTA, for a free walk-in event', () => {
    const opt = getBookingOptions({
      ...base,
      entry_type: 'free',
      is_free: true,
      min_price_cents: 0,
      max_price_cents: null,
      booking: null,
    });
    expect(opt.cta.kind).toBe('calendar');
    expect(opt.priceLine).toBe('Free');
  });

  it('asks for registration when the organiser wants names', () => {
    const opt = getBookingOptions({
      ...base,
      entry_type: 'registration',
      is_free: true,
      booking: config({
        booking_type: 'free_registration',
        provider: 'Temple committee',
        booking_url: 'https://temple.example.org/rsvp',
      }),
    });
    expect(opt.cta).toMatchObject({ kind: 'external', label: 'Register' });
    expect(opt.priceLine).toBe('Free');
  });

  it('shows the door price without a booking step', () => {
    const opt = getBookingOptions({
      ...base,
      entry_type: 'door',
      min_price_cents: 1000,
      max_price_cents: null,
      booking: null,
    });
    expect(opt.priceLine).toBe('€10.00 at the door');
    expect(opt.cta.kind).toBe('calendar');
  });

  it('offers a waitlist rather than a dead button when sold out', () => {
    const opt = getBookingOptions({
      ...base,
      booking: config({
        booking_type: 'external_url',
        booking_url: 'https://x.example.org',
        status: 'sold_out',
      }),
    });
    expect(opt.available).toBe(false);
    expect(opt.cta).toEqual({ kind: 'disabled', label: 'Join the waitlist' });
  });

  it('overrides every channel for a cancelled event', () => {
    const opt = getBookingOptions({
      ...base,
      status: 'cancelled',
      booking: config({
        booking_type: 'external_url',
        booking_url: 'https://x.example.org',
      }),
    });
    expect(opt.available).toBe(false);
    expect(opt.cta.kind).toBe('disabled');
  });

  it('falls back to the organiser link when DesiHub ticketing is off', () => {
    const withNative = config({
      booking_type: 'desihub',
      provider: 'DesiHub',
      booking_url: 'https://organiser.example.org/tickets',
    });

    const off = getBookingOptions({ ...base, booking: withNative });
    expect(off.providerId).toBe('external_url');
    expect(off.cta).toMatchObject({ kind: 'external' });

    process.env.DESIHUB_TICKETING = '1';
    const on = getBookingOptions({ ...base, booking: withNative });
    expect(on.providerId).toBe('desihub');
    expect(on.cta).toMatchObject({ kind: 'internal', href: '/e/test-event#tickets' });
  });

  it('never invents a link when a paid event has no channel configured', () => {
    const opt = getBookingOptions({ ...base, booking: null });
    expect(opt.available).toBe(false);
    expect(opt.priceLine).toBe('€15.00 – €35.00');
    expect(opt.cta).toEqual({ kind: 'disabled', label: 'Booking opens soon' });
  });
});

import { describe, it, expect } from 'vitest';
import {
  dateChip,
  isThisWeek,
  isThisWeekend,
  weekDateRange,
  weekendDateRange,
  formatEventDateShort,
  isSameLocalDay,
  countdownLabel,
  isPast,
  buildIcs,
  googleCalendarUrl,
  formatEventTime,
} from './datetime';

describe('dateChip', () => {
  it('renders day/month/weekday in Amsterdam time', () => {
    // 2026-10-17T18:30:00Z is a Saturday evening in NL.
    const chip = dateChip('2026-10-17T18:30:00Z');
    expect(chip.day).toBe('17');
    expect(chip.month).toBe('OCT');
    expect(chip.weekday).toBe('SAT');
  });

  it('respects the venue timezone across the UTC day boundary', () => {
    // 2026-03-14T23:30:00Z is already 00:30 on the 15th in Amsterdam (CET).
    const chip = dateChip('2026-03-14T23:30:00Z');
    expect(chip.day).toBe('15');
  });
});

describe('formatEventTime', () => {
  it('formats 24h Amsterdam time', () => {
    // Winter: UTC+1. 18:30Z -> 19:30.
    expect(formatEventTime('2026-01-10T18:30:00Z')).toBe('19:30');
  });
});

describe('isThisWeekend', () => {
  const friday = new Date('2026-10-16T10:00:00Z'); // a Friday
  it('is true for the coming Saturday', () => {
    expect(isThisWeekend('2026-10-17T18:00:00Z', friday)).toBe(true);
  });
  it('is true for the coming Sunday', () => {
    expect(isThisWeekend('2026-10-18T14:00:00Z', friday)).toBe(true);
  });
  it('is false for the following Tuesday', () => {
    expect(isThisWeekend('2026-10-20T18:00:00Z', friday)).toBe(false);
  });
});

describe('isThisWeek', () => {
  const friday = new Date('2026-10-16T10:00:00Z'); // a Friday
  it('is true for today and for six days out', () => {
    expect(isThisWeek('2026-10-16T20:00:00Z', friday)).toBe(true);
    expect(isThisWeek('2026-10-22T09:00:00Z', friday)).toBe(true);
  });
  it('is false eight days out', () => {
    expect(isThisWeek('2026-10-24T09:00:00Z', friday)).toBe(false);
  });
  it('is false for yesterday', () => {
    expect(isThisWeek('2026-10-15T09:00:00Z', friday)).toBe(false);
  });
});

describe('weekendDateRange / weekDateRange', () => {
  const friday = new Date('2026-10-16T10:00:00Z');
  it('bounds the upcoming Sat–Sun', () => {
    expect(weekendDateRange(friday)).toEqual({ from: '2026-10-17', to: '2026-10-18' });
  });
  it('stays on the current weekend when today is already Sat/Sun', () => {
    const saturday = new Date('2026-10-17T10:00:00Z');
    expect(weekendDateRange(saturday)).toEqual({ from: '2026-10-17', to: '2026-10-18' });
  });
  it('bounds the next 7 days from today', () => {
    expect(weekDateRange(friday)).toEqual({ from: '2026-10-16', to: '2026-10-22' });
  });
});

describe('formatEventDateShort / isSameLocalDay', () => {
  it('formats a compact day + month', () => {
    expect(formatEventDateShort('2026-10-17T18:30:00Z')).toBe('17 Oct');
  });
  it('detects same vs different local days', () => {
    // Amsterdam is CEST (+2) in October: 20:00Z and 21:00Z are both still the 17th locally.
    expect(isSameLocalDay('2026-10-17T20:00:00Z', '2026-10-17T21:00:00Z')).toBe(true);
    expect(isSameLocalDay('2026-10-17T20:00:00Z', '2026-10-18T15:00:00Z')).toBe(false);
  });
});

describe('countdownLabel', () => {
  const now = new Date('2026-10-01T12:00:00Z');
  it('labels today/tomorrow/weeks/months', () => {
    expect(countdownLabel('2026-10-01T20:00:00Z', now)).toBe('Today');
    expect(countdownLabel('2026-10-02T20:00:00Z', now)).toBe('Tomorrow');
    expect(countdownLabel('2026-10-05T20:00:00Z', now)).toMatch(/In \d days/);
    expect(countdownLabel('2026-11-15T20:00:00Z', now)).toMatch(/months/);
    expect(countdownLabel('2026-09-01T20:00:00Z', now)).toBe('Past');
  });
});

describe('isPast', () => {
  it('detects past events', () => {
    const now = new Date('2026-10-01T12:00:00Z');
    expect(isPast('2026-09-30T12:00:00Z', now)).toBe(true);
    expect(isPast('2026-10-02T12:00:00Z', now)).toBe(false);
  });
});

describe('calendar exports', () => {
  const input = {
    title: 'Diwali Night, Amsterdam',
    startsAt: '2026-11-08T18:00:00Z',
    endsAt: '2026-11-08T23:00:00Z',
    location: 'Amsterdam',
    url: 'https://desihub.nl/e/diwali-night',
  };
  it('builds a valid ICS body', () => {
    const ics = buildIcs(input);
    expect(ics).toContain('BEGIN:VCALENDAR');
    expect(ics).toContain('SUMMARY:Diwali Night\\, Amsterdam');
    expect(ics).toContain('DTSTART:20261108T180000Z');
    expect(ics).toContain('END:VCALENDAR');
  });
  it('builds a Google Calendar URL', () => {
    const url = googleCalendarUrl(input);
    expect(url).toContain('calendar.google.com');
    expect(url).toContain('20261108T180000Z%2F20261108T230000Z');
  });
});

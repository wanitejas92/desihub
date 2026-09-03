import { DEFAULT_TIMEZONE } from './constants';

/**
 * Timezone-correct date handling. Events happen in Europe/Amsterdam; we store
 * timestamps as UTC ISO strings and always render in the venue timezone so a
 * user in another timezone still sees the local door time.
 */

interface ZonedParts {
  year: number;
  month: number; // 1-12
  day: number;
  weekday: number; // 0 = Sunday .. 6 = Saturday
  hour: number;
  minute: number;
}

const partsFmtCache = new Map<string, Intl.DateTimeFormat>();

function zonedParts(date: Date, timeZone: string): ZonedParts {
  let fmt = partsFmtCache.get(timeZone);
  if (!fmt) {
    fmt = new Intl.DateTimeFormat('en-US', {
      timeZone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      weekday: 'short',
      hour12: false,
    });
    partsFmtCache.set(timeZone, fmt);
  }
  const map: Record<string, string> = {};
  for (const p of fmt.formatToParts(date)) map[p.type] = p.value;
  const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  return {
    year: Number(map.year),
    month: Number(map.month),
    day: Number(map.day),
    weekday: weekdays.indexOf(map.weekday ?? 'Sun'),
    hour: Number(map.hour === '24' ? '0' : map.hour),
    minute: Number(map.minute),
  };
}

function toDate(input: string | Date): Date {
  return input instanceof Date ? input : new Date(input);
}

export function formatEventDate(
  input: string | Date,
  timeZone: string = DEFAULT_TIMEZONE,
  locale = 'en-NL',
): string {
  return new Intl.DateTimeFormat(locale, {
    timeZone,
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(toDate(input));
}

/** Card meta-row date, e.g. "Sat, 17 Oct" — short weekday, no year. */
export function formatEventDateCompact(
  input: string | Date,
  timeZone: string = DEFAULT_TIMEZONE,
  locale = 'en-NL',
): string {
  return new Intl.DateTimeFormat(locale, {
    timeZone,
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  }).format(toDate(input));
}

/** Compact date for a range's end, e.g. "18 Oct" — no year, no weekday. */
export function formatEventDateShort(
  input: string | Date,
  timeZone: string = DEFAULT_TIMEZONE,
  locale = 'en-NL',
): string {
  return new Intl.DateTimeFormat(locale, { timeZone, day: 'numeric', month: 'short' }).format(
    toDate(input),
  );
}

/** True if both instants fall on the same calendar day in the given timezone. */
export function isSameLocalDay(
  a: string | Date,
  b: string | Date,
  timeZone: string = DEFAULT_TIMEZONE,
): boolean {
  const pa = zonedParts(toDate(a), timeZone);
  const pb = zonedParts(toDate(b), timeZone);
  return ordinal(pa) === ordinal(pb);
}

export function formatEventTime(
  input: string | Date,
  timeZone: string = DEFAULT_TIMEZONE,
  locale = 'en-NL',
): string {
  return new Intl.DateTimeFormat(locale, {
    timeZone,
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(toDate(input));
}

/** The floating date chip on event cards: e.g. { day: "18", month: "OCT" }. */
export function dateChip(
  input: string | Date,
  timeZone: string = DEFAULT_TIMEZONE,
): { day: string; month: string; weekday: string } {
  const d = toDate(input);
  const day = new Intl.DateTimeFormat('en-US', { timeZone, day: 'numeric' }).format(d);
  const month = new Intl.DateTimeFormat('en-US', { timeZone, month: 'short' })
    .format(d)
    .toUpperCase();
  const weekday = new Intl.DateTimeFormat('en-US', { timeZone, weekday: 'short' })
    .format(d)
    .toUpperCase();
  return { day, month, weekday };
}

/** True if the event's local date falls on the upcoming (or current) Sat/Sun. */
export function isThisWeekend(
  input: string | Date,
  now: Date = new Date(),
  timeZone: string = DEFAULT_TIMEZONE,
): boolean {
  const event = zonedParts(toDate(input), timeZone);
  const today = zonedParts(now, timeZone);

  // Days until Saturday (weekday 6) from today.
  const daysToSat = (6 - today.weekday + 7) % 7;
  const satOrdinal = ordinal(today) + daysToSat;
  const sunOrdinal = satOrdinal + 1;
  const eventOrdinal = ordinal(event);
  // Also count "today" if today is already the weekend.
  const todayOrdinal = ordinal(today);
  const weekendOrdinals = new Set([satOrdinal, sunOrdinal]);
  if (today.weekday === 6 || today.weekday === 0) weekendOrdinals.add(todayOrdinal);
  return weekendOrdinals.has(eventOrdinal);
}

/** A monotonically increasing day number for same-year comparisons. */
function ordinal(p: ZonedParts): number {
  return Date.UTC(p.year, p.month - 1, p.day) / 86_400_000;
}

/** True if the event's local date falls within the next 7 days (today included). */
export function isThisWeek(
  input: string | Date,
  now: Date = new Date(),
  timeZone: string = DEFAULT_TIMEZONE,
): boolean {
  const event = zonedParts(toDate(input), timeZone);
  const today = zonedParts(now, timeZone);
  const delta = ordinal(event) - ordinal(today);
  return delta >= 0 && delta <= 6;
}

function ordinalToISODate(ord: number): string {
  return new Date(ord * 86_400_000).toISOString().slice(0, 10);
}

/** `{ from, to }` (YYYY-MM-DD) bounding the upcoming Sat–Sun, for date-range filters. */
export function weekendDateRange(
  now: Date = new Date(),
  timeZone: string = DEFAULT_TIMEZONE,
): { from: string; to: string } {
  const today = zonedParts(now, timeZone);
  const daysToSat = (6 - today.weekday + 7) % 7;
  const isWeekendNow = today.weekday === 6 || today.weekday === 0;
  const satOrdinal = isWeekendNow ? ordinal(today) : ordinal(today) + daysToSat;
  return { from: ordinalToISODate(satOrdinal), to: ordinalToISODate(satOrdinal + 1) };
}

/** `{ from, to }` (YYYY-MM-DD) bounding the next 7 days (today included). */
export function weekDateRange(
  now: Date = new Date(),
  timeZone: string = DEFAULT_TIMEZONE,
): { from: string; to: string } {
  const today = zonedParts(now, timeZone);
  return { from: ordinalToISODate(ordinal(today)), to: ordinalToISODate(ordinal(today) + 6) };
}

/**
 * Whole-day countdown label used in quiet-season UI. Compares calendar days
 * in the venue timezone, so an event later *today* reads "Today", not by a
 * rolling 24h window.
 */
export function countdownLabel(
  input: string | Date,
  now: Date = new Date(),
  timeZone: string = DEFAULT_TIMEZONE,
): string {
  const days = ordinal(zonedParts(toDate(input), timeZone)) - ordinal(zonedParts(now, timeZone));
  if (days < 0) return 'Past';
  if (days === 0) return 'Today';
  if (days === 1) return 'Tomorrow';
  if (days < 7) return `In ${days} days`;
  if (days < 30) return `In ${Math.round(days / 7)} weeks`;
  return `In ${Math.round(days / 30)} months`;
}

export function isPast(input: string | Date, now: Date = new Date()): boolean {
  return toDate(input).getTime() < now.getTime();
}

/** RFC 5545 timestamp (UTC) for .ics files. */
function icsStamp(input: string | Date): string {
  return toDate(input)
    .toISOString()
    .replace(/[-:]/g, '')
    .replace(/\.\d{3}/, '');
}

export interface CalendarEventInput {
  title: string;
  description?: string;
  location?: string;
  startsAt: string | Date;
  endsAt?: string | Date | null;
  url?: string;
}

/** Google Calendar "add event" URL. */
export function googleCalendarUrl(e: CalendarEventInput): string {
  const end = e.endsAt ?? new Date(toDate(e.startsAt).getTime() + 2 * 3600_000);
  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: e.title,
    dates: `${icsStamp(e.startsAt)}/${icsStamp(end)}`,
    details: [e.description, e.url].filter(Boolean).join('\n\n'),
    location: e.location ?? '',
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

/** A downloadable .ics document (Apple Calendar, Outlook). */
export function buildIcs(e: CalendarEventInput): string {
  const end = e.endsAt ?? new Date(toDate(e.startsAt).getTime() + 2 * 3600_000);
  const uid = `${icsStamp(e.startsAt)}-${slugForUid(e.title)}@desihub.nl`;
  const escape = (s: string) => s.replace(/([,;\\])/g, '\\$1').replace(/\n/g, '\\n');
  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//DesiHub//NL//EN',
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${icsStamp(new Date())}`,
    `DTSTART:${icsStamp(e.startsAt)}`,
    `DTEND:${icsStamp(end)}`,
    `SUMMARY:${escape(e.title)}`,
    e.description ? `DESCRIPTION:${escape(e.description)}` : '',
    e.location ? `LOCATION:${escape(e.location)}` : '',
    e.url ? `URL:${e.url}` : '',
    'END:VEVENT',
    'END:VCALENDAR',
  ]
    .filter(Boolean)
    .join('\r\n');
}

function slugForUid(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 40);
}

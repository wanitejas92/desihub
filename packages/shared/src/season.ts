import type { EventCategory } from './constants';

/**
 * The festival calendar that powers the home "Season" strip. The NL Desi event
 * year is spiky — Holi, Navratri/Garba, Diwali, Ganesh Chaturthi — with quiet
 * summers. This module tells the UI which season we're in (or counting down to)
 * so quiet months still feel alive.
 *
 * Festival dates are lunar and shift yearly, so we carry curated windows for
 * known years and fall back to broad month windows otherwise. Windows are
 * intentionally wider than the festival day itself, because events cluster in
 * the weeks around it.
 */

export type SeasonKey = 'holi' | 'ganesh' | 'navratri' | 'diwali' | 'offseason';

export interface Season {
  key: SeasonKey;
  name: string;
  tagline: string;
  /** Categories to surface first while this season is active. */
  featuredCategories: EventCategory[];
  /** Accent treatment hint for the strip (kept subtle, never gaudy). */
  mood: 'colour' | 'lights' | 'devotional' | 'calm';
}

const SEASONS: Record<Exclude<SeasonKey, 'offseason'>, Season> = {
  holi: {
    key: 'holi',
    name: 'Holi',
    tagline: 'The festival of colour is coming.',
    featuredCategories: ['holi', 'party', 'concert'],
    mood: 'colour',
  },
  ganesh: {
    key: 'ganesh',
    name: 'Ganesh Chaturthi',
    tagline: 'Welcoming Bappa — aartis and cultural nights.',
    featuredCategories: ['temple', 'cultural', 'family'],
    mood: 'devotional',
  },
  navratri: {
    key: 'navratri',
    name: 'Navratri & Garba',
    tagline: 'Nine nights of Garba and Dandiya.',
    featuredCategories: ['garba_dandiya', 'cultural', 'temple'],
    mood: 'colour',
  },
  diwali: {
    key: 'diwali',
    name: 'Diwali',
    tagline: 'The festival of lights.',
    featuredCategories: ['diwali', 'concert', 'family'],
    mood: 'lights',
  },
};

export const OFFSEASON: Season = {
  key: 'offseason',
  name: 'Off-season',
  tagline: 'Quieter months — parties, comedy and concerts keep the calendar warm.',
  featuredCategories: ['party', 'comedy', 'concert', 'networking'],
  mood: 'calm',
};

interface Window {
  key: Exclude<SeasonKey, 'offseason'>;
  start: string; // MM-DD
  end: string; // MM-DD
}

/**
 * Curated season windows by year. Widened around the festival to catch the
 * clustering of events. Add new years here as the real dates are confirmed.
 */
const WINDOWS_BY_YEAR: Record<number, Window[]> = {
  2025: [
    { key: 'holi', start: '02-25', end: '03-16' },
    { key: 'ganesh', start: '08-20', end: '09-07' },
    { key: 'navratri', start: '09-18', end: '10-05' },
    { key: 'diwali', start: '10-13', end: '11-02' },
  ],
  2026: [
    { key: 'holi', start: '02-24', end: '03-15' },
    { key: 'ganesh', start: '09-07', end: '09-24' },
    { key: 'navratri', start: '10-04', end: '10-22' },
    { key: 'diwali', start: '10-30', end: '11-18' },
  ],
};

/** Broad fallback windows used when a year has no curated data. */
const FALLBACK_WINDOWS: Window[] = [
  { key: 'holi', start: '02-20', end: '03-20' },
  { key: 'ganesh', start: '08-20', end: '09-15' },
  { key: 'navratri', start: '09-20', end: '10-15' },
  { key: 'diwali', start: '10-15', end: '11-15' },
];

function windowsFor(year: number): Window[] {
  return WINDOWS_BY_YEAR[year] ?? FALLBACK_WINDOWS;
}

function mmdd(date: Date, timeZone = 'Europe/Amsterdam'): string {
  const fmt = new Intl.DateTimeFormat('en-CA', {
    timeZone,
    month: '2-digit',
    day: '2-digit',
  });
  const parts: Record<string, string> = {};
  for (const p of fmt.formatToParts(date)) parts[p.type] = p.value;
  return `${parts.month}-${parts.day}`;
}

function yearIn(date: Date, timeZone = 'Europe/Amsterdam'): number {
  return Number(new Intl.DateTimeFormat('en-CA', { timeZone, year: 'numeric' }).format(date));
}

/** The active season for a given date, or off-season. */
export function currentSeason(now: Date = new Date()): Season {
  const year = yearIn(now);
  const today = mmdd(now);
  for (const w of windowsFor(year)) {
    if (today >= w.start && today <= w.end) return SEASONS[w.key];
  }
  return OFFSEASON;
}

export interface UpcomingSeason {
  season: Season;
  /** Whole days until the season window opens. */
  daysUntil: number;
  startsOn: string; // MM-DD
}

/** The next season to look forward to, for the quiet-month countdown. */
export function nextSeason(now: Date = new Date()): UpcomingSeason {
  const year = yearIn(now);
  const today = mmdd(now);
  const thisYear = windowsFor(year)
    .filter((w) => w.start > today)
    .sort((a, b) => a.start.localeCompare(b.start));

  const chosen = thisYear[0];
  if (chosen) {
    return {
      season: SEASONS[chosen.key],
      daysUntil: daysBetweenMmdd(year, today, chosen.start),
      startsOn: chosen.start,
    };
  }
  // Wrap to the first season of next year.
  const next = windowsFor(year + 1)
    .slice()
    .sort((a, b) => a.start.localeCompare(b.start))[0]!;
  return {
    season: SEASONS[next.key],
    daysUntil: daysUntilNextYear(year, today, next.start),
    startsOn: next.start,
  };
}

function toOrdinal(year: number, mmddStr: string): number {
  const [m, d] = mmddStr.split('-').map(Number);
  return Date.UTC(year, (m ?? 1) - 1, d ?? 1) / 86_400_000;
}

function daysBetweenMmdd(year: number, from: string, to: string): number {
  return toOrdinal(year, to) - toOrdinal(year, from);
}

function daysUntilNextYear(year: number, from: string, to: string): number {
  return toOrdinal(year + 1, to) - toOrdinal(year, from);
}

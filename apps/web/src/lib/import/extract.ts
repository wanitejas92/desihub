import { CITIES, EVENT_CATEGORIES, type ImportExtraction } from '@desihub/shared';

/**
 * Extracts event fields from pasted text (a Facebook event, an Instagram
 * caption, an Eventbrite page). TEXT ONLY — it never fetches or copies images
 * (copyright rule). It is a deterministic heuristic, not an LLM call, so it is
 * fully testable and produces per-field confidence for the review UI.
 */

const MONTHS: Record<string, number> = {
  jan: 1,
  feb: 2,
  mar: 3,
  apr: 4,
  may: 5,
  jun: 6,
  jul: 7,
  aug: 8,
  sep: 9,
  sept: 9,
  oct: 10,
  nov: 11,
  dec: 12,
};

const CATEGORY_KEYWORDS: Record<string, (typeof EVENT_CATEGORIES)[number]> = {
  garba: 'garba_dandiya',
  dandiya: 'garba_dandiya',
  navratri: 'garba_dandiya',
  diwali: 'diwali',
  deepavali: 'diwali',
  holi: 'holi',
  aarti: 'temple',
  puja: 'temple',
  pooja: 'temple',
  temple: 'temple',
  mandir: 'temple',
  comedy: 'comedy',
  standup: 'comedy',
  'stand-up': 'comedy',
  concert: 'concert',
  live: 'concert',
  party: 'party',
  dj: 'party',
  bollywood: 'party',
  workshop: 'workshop',
  food: 'food',
  mela: 'food',
  networking: 'networking',
  meetup: 'networking',
  kids: 'family',
  family: 'family',
};

function detectCity(text: string): { city: string | null; conf: number } {
  const lower = text.toLowerCase();
  for (const c of CITIES) {
    if (lower.includes(c.toLowerCase())) return { city: c, conf: 0.9 };
  }
  return { city: null, conf: 0 };
}

function detectCategory(text: string): { category: string | null; conf: number } {
  const lower = text.toLowerCase();
  for (const [kw, cat] of Object.entries(CATEGORY_KEYWORDS)) {
    if (new RegExp(`\\b${kw}\\b`).test(lower)) return { category: cat, conf: 0.7 };
  }
  return { category: null, conf: 0 };
}

/** Detects a price in cents, or free. */
function detectPrice(text: string): {
  min: number | null;
  max: number | null;
  free: boolean | null;
  conf: number;
} {
  const lower = text.toLowerCase();
  if (/\b(free entry|gratis|free admission|entry free|no charge)\b/.test(lower)) {
    return { min: 0, max: 0, free: true, conf: 0.85 };
  }
  const matches = [...text.matchAll(/(?:€|eur\s?|euro\s?)\s?(\d{1,4})(?:[.,](\d{2}))?/gi)];
  const values = matches
    .map((m) => Number(m[1]) * 100 + (m[2] ? Number(m[2]) : 0))
    .filter((v) => v > 0 && v < 100000);
  if (values.length === 0) return { min: null, max: null, free: null, conf: 0 };
  return {
    min: Math.min(...values),
    max: Math.max(...values),
    free: false,
    conf: 0.7,
  };
}

/** Detects a start datetime, returned as a UTC ISO string. */
function detectDate(text: string): { iso: string | null; conf: number } {
  // ISO 8601 first.
  const iso = text.match(/\b(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(?::\d{2})?(?:Z|[+-]\d{2}:?\d{2})?)\b/);
  if (iso) {
    const d = new Date(iso[1]!);
    if (!isNaN(d.getTime())) return { iso: d.toISOString(), conf: 0.95 };
  }

  const time = text.match(/\b(\d{1,2})[:.](\d{2})\s?(am|pm)?\b/i);
  const hourFromMeridiem = text.match(/\b(\d{1,2})\s?(am|pm)\b/i);

  // "10 October 2026" / "Oct 10, 2026" / "10 Oct 2026".
  const dmY = text.match(/\b(\d{1,2})\s+([a-z]{3,9})\.?\s+(\d{4})\b/i);
  const mdY = text.match(/\b([a-z]{3,9})\.?\s+(\d{1,2}),?\s+(\d{4})\b/i);
  // Numeric dd/mm/yyyy (European order).
  const numeric = text.match(/\b(\d{1,2})[/\-.](\d{1,2})[/\-.](\d{4})\b/);

  let year: number | null = null;
  let month: number | null = null;
  let day: number | null = null;

  if (dmY) {
    day = Number(dmY[1]);
    month =
      MONTHS[dmY[2]!.toLowerCase().slice(0, dmY[2]!.length >= 4 ? 4 : 3)] ??
      MONTHS[dmY[2]!.toLowerCase().slice(0, 3)] ??
      null;
    year = Number(dmY[3]);
  } else if (mdY) {
    month = MONTHS[mdY[1]!.toLowerCase().slice(0, 3)] ?? null;
    day = Number(mdY[2]);
    year = Number(mdY[3]);
  } else if (numeric) {
    day = Number(numeric[1]);
    month = Number(numeric[2]);
    year = Number(numeric[3]);
  }

  if (
    year == null ||
    month == null ||
    day == null ||
    month < 1 ||
    month > 12 ||
    day < 1 ||
    day > 31
  ) {
    return { iso: null, conf: 0 };
  }

  let hour = 20; // sensible default for evening events
  let minute = 0;
  let hasTime = false;
  if (time) {
    hour = Number(time[1]);
    minute = Number(time[2]);
    if (/pm/i.test(time[3] ?? '') && hour < 12) hour += 12;
    if (/am/i.test(time[3] ?? '') && hour === 12) hour = 0;
    hasTime = true;
  } else if (hourFromMeridiem) {
    hour = Number(hourFromMeridiem[1]);
    if (/pm/i.test(hourFromMeridiem[2]!) && hour < 12) hour += 12;
    if (/am/i.test(hourFromMeridiem[2]!) && hour === 12) hour = 0;
    hasTime = true;
  }

  // Interpret as Europe/Amsterdam local time -> UTC. NL is UTC+1 (CET) or
  // UTC+2 (CEST, late Mar–late Oct). Approximate DST by month.
  const cest = month > 3 && month < 11;
  const offset = cest ? 2 : 1;
  const utc = new Date(Date.UTC(year, month - 1, day, hour - offset, minute));
  return { iso: utc.toISOString(), conf: hasTime ? 0.8 : 0.55 };
}

function detectTitle(text: string): { title: string | null; conf: number } {
  const lines = text
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean);
  if (lines.length === 0) return { title: null, conf: 0 };
  // Prefer the first line that isn't obviously a URL or a date.
  for (const line of lines) {
    if (/^https?:\/\//i.test(line)) continue;
    if (/^\d{1,2}[/\-.]\d/.test(line)) continue;
    if (line.length >= 3 && line.length <= 120) return { title: line, conf: 0.6 };
  }
  return { title: lines[0]!.slice(0, 120), conf: 0.4 };
}

function detectSourceUrl(text: string): string | null {
  const m = text.match(/\bhttps?:\/\/[^\s]+/i);
  return m ? m[0] : null;
}

export function extractEventFromText(input: string): ImportExtraction {
  const text = input.trim();
  const { title, conf: titleConf } = detectTitle(text);
  const { iso, conf: dateConf } = detectDate(text);
  const { city, conf: cityConf } = detectCity(text);
  const { category, conf: catConf } = detectCategory(text);
  const price = detectPrice(text);

  return {
    title,
    starts_at: iso,
    ends_at: null,
    venue_name: null,
    city: city as ImportExtraction['city'],
    category: category as ImportExtraction['category'],
    min_price_cents: price.min,
    max_price_cents: price.max,
    is_free: price.free,
    description: text.length > 0 ? text.slice(0, 4000) : null,
    source_url: detectSourceUrl(text),
    confidence: {
      title: titleConf,
      starts_at: dateConf,
      city: cityConf,
      category: catConf,
      price: price.conf,
    },
  };
}

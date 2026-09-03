import { describe, it, expect } from 'vitest';
import { extractEventFromText } from './extract';

describe('extractEventFromText', () => {
  it('extracts a Facebook-style event blob', () => {
    const text = `Navratri Garba Night 2026
Saturday, 11 October 2026 at 18:30
De Meervaart, Amsterdam
Tickets €12 - €20. Live dhol!
https://facebook.com/events/123`;
    const r = extractEventFromText(text);
    expect(r.title).toBe('Navratri Garba Night 2026');
    expect(r.category).toBe('garba_dandiya');
    expect(r.city).toBe('Amsterdam');
    expect(r.min_price_cents).toBe(1200);
    expect(r.max_price_cents).toBe(2000);
    expect(r.is_free).toBe(false);
    expect(r.starts_at).not.toBeNull();
    // 18:30 Amsterdam in October (CEST, +2) -> 16:30 UTC.
    expect(r.starts_at).toBe('2026-10-11T16:30:00.000Z');
    expect(r.source_url).toContain('facebook.com');
  });

  it('detects free events', () => {
    const r = extractEventFromText('Diwali Mela\n1 November 2026, Utrecht\nFree entry for all!');
    expect(r.is_free).toBe(true);
    expect(r.min_price_cents).toBe(0);
    expect(r.city).toBe('Utrecht');
  });

  it('parses ISO timestamps with high confidence', () => {
    const r = extractEventFromText('Comedy Night\n2026-09-13T19:00:00Z in Amsterdam');
    expect(r.starts_at).toBe('2026-09-13T19:00:00.000Z');
    expect(r.category).toBe('comedy');
    expect(r.confidence.starts_at).toBeGreaterThan(0.9);
  });

  it('handles Month DD, YYYY order', () => {
    const r = extractEventFromText('Holi Festival\nMarch 6, 2027 12:00\nRotterdam');
    expect(r.city).toBe('Rotterdam');
    expect(r.category).toBe('holi');
    // March 6 is before DST -> CET (+1) -> 11:00 UTC.
    expect(r.starts_at).toBe('2027-03-06T11:00:00.000Z');
  });

  it('never returns an image field (text-only)', () => {
    const r = extractEventFromText('Some event 10 Oct 2026 Amsterdam');
    expect(Object.keys(r)).not.toContain('image_url');
    expect(Object.keys(r)).not.toContain('image');
  });

  it('degrades gracefully on junk', () => {
    const r = extractEventFromText('asdf');
    expect(r.starts_at).toBeNull();
    expect(r.city).toBeNull();
    expect(r.title).toBe('asdf');
  });
});

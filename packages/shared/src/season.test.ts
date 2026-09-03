import { describe, it, expect } from 'vitest';
import { currentSeason, nextSeason } from './season';

describe('currentSeason', () => {
  it('is Diwali in early November 2026', () => {
    expect(currentSeason(new Date('2026-11-05T12:00:00Z')).key).toBe('diwali');
  });
  it('is Navratri in mid-October 2026', () => {
    expect(currentSeason(new Date('2026-10-10T12:00:00Z')).key).toBe('navratri');
  });
  it('is Holi in early March 2026', () => {
    expect(currentSeason(new Date('2026-03-01T12:00:00Z')).key).toBe('holi');
  });
  it('is off-season in the quiet summer', () => {
    expect(currentSeason(new Date('2026-06-15T12:00:00Z')).key).toBe('offseason');
  });
});

describe('nextSeason', () => {
  it('counts down to the next festival from a quiet month', () => {
    const next = nextSeason(new Date('2026-06-15T12:00:00Z'));
    expect(next.season.key).toBe('ganesh');
    expect(next.daysUntil).toBeGreaterThan(0);
  });
  it('wraps to next year after the last festival', () => {
    const next = nextSeason(new Date('2026-12-20T12:00:00Z'));
    expect(next.season.key).toBe('holi');
    expect(next.daysUntil).toBeGreaterThan(0);
  });
});

import { describe, it, expect } from 'vitest';
import { cityCounts } from './filter';
import type { EventWithRelations } from './types';

function eventIn(city: string): EventWithRelations {
  return { venue: { city } } as unknown as EventWithRelations;
}

describe('cityCounts', () => {
  it('counts events per city and sorts descending', () => {
    const events = [
      eventIn('Amsterdam'),
      eventIn('Amsterdam'),
      eventIn('Rotterdam'),
      eventIn('Amsterdam'),
      eventIn('Utrecht'),
      eventIn('Rotterdam'),
    ];
    expect(cityCounts(events)).toEqual([
      { city: 'Amsterdam', count: 3 },
      { city: 'Rotterdam', count: 2 },
      { city: 'Utrecht', count: 1 },
    ]);
  });

  it('respects the limit', () => {
    const events = [eventIn('Amsterdam'), eventIn('Rotterdam'), eventIn('Utrecht')];
    expect(cityCounts(events, 2)).toHaveLength(2);
  });

  it('skips events with no venue', () => {
    const events = [eventIn('Amsterdam'), { venue: null } as unknown as EventWithRelations];
    expect(cityCounts(events)).toEqual([{ city: 'Amsterdam', count: 1 }]);
  });

  it('returns an empty list for no events', () => {
    expect(cityCounts([])).toEqual([]);
  });
});

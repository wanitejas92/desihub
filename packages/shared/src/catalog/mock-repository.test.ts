import { describe, it, expect, beforeEach } from 'vitest';
import { MockEventRepository } from './mock-repository';
import { mockSubmissions, mockFindSubmission, resetMockSubmissions } from './mock-submissions';
import type { SubmitEventInput } from '../schemas';

const input: SubmitEventInput = {
  title: 'Diwali Night Amsterdam',
  starts_at: new Date(Date.now() + 86_400_000 * 30).toISOString(),
  city: 'Amsterdam',
  organiser_name: 'Desi Events NL',
  description: 'A big Diwali celebration.',
  highlights: 'Live music, food stalls',
  terms: 'No refunds.',
  category: 'diwali',
  venue_name: 'Ziggo Dome',
  entry_type: 'free',
};

describe('MockEventRepository.submitEvent', () => {
  beforeEach(() => resetMockSubmissions());

  it('records the submission instead of dropping it', async () => {
    const repo = new MockEventRepository();
    const result = await repo.submitEvent(input);

    expect(result.ok).toBe(true);
    const stored = mockFindSubmission(result.slug);
    expect(stored).toBeDefined();
    expect(stored?.title).toBe('Diwali Night Amsterdam');
    expect(stored?.organiser_name).toBe('Desi Events NL');
    expect(stored?.venue_name).toBe('Ziggo Dome');
  });

  it('lands it as a draft, never published — the review queue is the only way in', async () => {
    const repo = new MockEventRepository();
    const { slug } = await repo.submitEvent(input);
    expect(mockFindSubmission(slug)?.status).toBe('draft');
  });

  it('keeps a draft out of the public listings', async () => {
    const repo = new MockEventRepository();
    await repo.submitEvent(input);

    const { items } = await repo.listEvents({});
    expect(items.some((e) => e.title === 'Diwali Night Amsterdam')).toBe(false);
  });

  it('gives two events with the same title distinct slugs', async () => {
    const repo = new MockEventRepository();
    const a = await repo.submitEvent(input);
    const b = await repo.submitEvent(input);

    expect(a.slug).not.toBe(b.slug);
    expect(mockSubmissions()).toHaveLength(2);
  });
});

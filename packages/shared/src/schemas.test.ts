import { describe, it, expect } from 'vitest';
import { submitEventSchema, ticketTypeSchema, subscribeSchema, draftSlug } from './schemas';

const validSubmission = {
  title: 'Garba Night',
  starts_at: '2026-10-10T18:00:00Z',
  city: 'Amsterdam',
  organiser_name: 'Desi Nights Amsterdam',
  description: 'A night of Garba and Dandiya for everyone.',
  highlights: 'Live DJ\nFree entry before 10pm',
  terms: 'No refunds after purchase.',
};

describe('submitEventSchema', () => {
  it('accepts a submission with every required field', () => {
    const parsed = submitEventSchema.safeParse(validSubmission);
    expect(parsed.success).toBe(true);
  });
  it('rejects a too-short title', () => {
    const parsed = submitEventSchema.safeParse({ ...validSubmission, title: 'Hi' });
    expect(parsed.success).toBe(false);
  });
  it('accepts a city outside the fixed list — the "Other" option', () => {
    const parsed = submitEventSchema.safeParse({ ...validSubmission, city: 'Groningen' });
    expect(parsed.success).toBe(true);
  });
  it('rejects a missing organiser name', () => {
    const parsed = submitEventSchema.safeParse({ ...validSubmission, organiser_name: '' });
    expect(parsed.success).toBe(false);
  });
  it('rejects a missing description', () => {
    const parsed = submitEventSchema.safeParse({ ...validSubmission, description: '' });
    expect(parsed.success).toBe(false);
  });
  it('rejects missing highlights', () => {
    const parsed = submitEventSchema.safeParse({ ...validSubmission, highlights: '' });
    expect(parsed.success).toBe(false);
  });
  it('rejects missing terms', () => {
    const parsed = submitEventSchema.safeParse({ ...validSubmission, terms: '' });
    expect(parsed.success).toBe(false);
  });
});

describe('ticketTypeSchema', () => {
  it('rejects overselling (sold > quantity)', () => {
    const base = {
      id: '00000000-0000-0000-0000-000000000000',
      event_id: '00000000-0000-0000-0000-000000000001',
      name: 'Early bird',
      description: null,
      price_cents: 2500,
      fee_mode: 'pass_on' as const,
      quantity: 100,
      sold: 101,
      min_per_order: 1,
      max_per_order: 6,
      sales_start: null,
      sales_end: null,
      is_group: false,
      group_size: null,
      meal_option_required: false,
    };
    expect(ticketTypeSchema.safeParse(base).success).toBe(false);
    expect(ticketTypeSchema.safeParse({ ...base, sold: 99 }).success).toBe(true);
  });
});

describe('subscribeSchema', () => {
  it('requires a valid email', () => {
    expect(subscribeSchema.safeParse({ email: 'not-an-email' }).success).toBe(false);
    expect(subscribeSchema.safeParse({ email: 'a@b.nl', interests: [] }).success).toBe(true);
  });
});

describe('draftSlug', () => {
  it('slugifies titles with diacritics and symbols', () => {
    expect(draftSlug('Diwali Night — Amsterdam! 2026')).toBe('diwali-night-amsterdam-2026');
  });
});

import { describe, it, expect } from 'vitest';
import { submitEventSchema, ticketTypeSchema, subscribeSchema, draftSlug } from './schemas.js';

describe('submitEventSchema', () => {
  it('accepts the three required fields', () => {
    const parsed = submitEventSchema.safeParse({
      title: 'Garba Night',
      starts_at: '2026-10-10T18:00:00Z',
      city: 'Amsterdam',
    });
    expect(parsed.success).toBe(true);
  });
  it('rejects a too-short title', () => {
    const parsed = submitEventSchema.safeParse({
      title: 'Hi',
      starts_at: '2026-10-10T18:00:00Z',
      city: 'Amsterdam',
    });
    expect(parsed.success).toBe(false);
  });
  it('rejects an unknown city', () => {
    const parsed = submitEventSchema.safeParse({
      title: 'Garba Night',
      starts_at: '2026-10-10T18:00:00Z',
      city: 'Paris',
    });
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

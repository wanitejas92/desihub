import { describe, it, expect } from 'vitest';
import {
  ticketFeeCents,
  priceLine,
  sumOrder,
  formatMoney,
  formatPriceRange,
  isValidPriceCents,
} from './money';

describe('ticketFeeCents', () => {
  it('is zero for free tickets', () => {
    expect(ticketFeeCents(0)).toBe(0);
  });
  it('is 5% + €0.60 flat', () => {
    // €25.00 -> 5% = 125c + 60c = 185c
    expect(ticketFeeCents(2500)).toBe(185);
  });
  it('rounds the percentage to the nearest cent', () => {
    // €19.99 -> 5% = 99.95c -> 100c + 60c = 160c
    expect(ticketFeeCents(1999)).toBe(160);
  });
  it('rejects invalid values', () => {
    expect(() => ticketFeeCents(-1)).toThrow();
    expect(() => ticketFeeCents(1.5)).toThrow();
  });
});

describe('priceLine', () => {
  it('pass_on adds the fee on top', () => {
    const line = priceLine(2500, 2, 'pass_on');
    expect(line.faceValueCents).toBe(5000);
    expect(line.feeCents).toBe(370);
    expect(line.buyerPaysCents).toBe(5370);
  });
  it('absorb keeps the buyer price at face value', () => {
    const line = priceLine(2500, 2, 'absorb');
    expect(line.faceValueCents).toBe(5000);
    expect(line.feeCents).toBe(370);
    expect(line.buyerPaysCents).toBe(5000);
  });
  it('free line has no fee', () => {
    const line = priceLine(0, 3, 'pass_on');
    expect(line.buyerPaysCents).toBe(0);
    expect(line.feeCents).toBe(0);
  });
  it('rejects negative quantity', () => {
    expect(() => priceLine(1000, -1, 'absorb')).toThrow();
  });
});

describe('sumOrder', () => {
  it('totals passed-on fees into the buyer total and flags Klarna over €60', () => {
    const lines = [priceLine(4000, 2, 'pass_on')]; // face 8000, fee per ticket 260 -> 520
    const totals = sumOrder(lines);
    expect(totals.subtotalCents).toBe(8000);
    expect(totals.feesCents).toBe(520);
    expect(totals.totalCents).toBe(8520);
    expect(totals.klarnaEligible).toBe(true);
  });
  it('absorbed fees do not inflate the buyer total', () => {
    const totals = sumOrder([priceLine(2000, 1, 'absorb')]);
    expect(totals.totalCents).toBe(2000);
    expect(totals.klarnaEligible).toBe(false);
  });
});

describe('formatMoney / formatPriceRange', () => {
  it('formats EUR', () => {
    expect(formatMoney(2500)).toMatch(/25/);
    expect(formatMoney(2500)).toMatch(/€/);
  });
  it('renders Free / single / range', () => {
    expect(formatPriceRange(0, 0, true)).toBe('Free');
    expect(formatPriceRange(2500, 2500, false)).toMatch(/€\s?25/);
    expect(formatPriceRange(2500, 8000, false)).toMatch(/–/);
    expect(formatPriceRange(null, null, false)).toBe('Price TBA');
  });
});

describe('isValidPriceCents', () => {
  it('accepts non-negative integers only', () => {
    expect(isValidPriceCents(0)).toBe(true);
    expect(isValidPriceCents(100)).toBe(true);
    expect(isValidPriceCents(-1)).toBe(false);
    expect(isValidPriceCents(1.2)).toBe(false);
  });
});

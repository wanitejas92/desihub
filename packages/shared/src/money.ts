import { DEFAULT_CURRENCY, KLARNA_MIN_TOTAL_CENTS, type FeeMode } from './constants.js';

/**
 * All money in DesiHub is stored and computed as integer cents. Never use
 * floats for money. Formatting happens only at the display edge.
 */

/** DesiHub service fee model. Deliberately simple and transparent. */
export const SERVICE_FEE = {
  /** Percentage of face value, in basis points (500 = 5.0%). */
  bps: 500,
  /** Flat fee per ticket, in cents. */
  flatCents: 60,
} as const;

export function isValidPriceCents(cents: number): boolean {
  return Number.isInteger(cents) && cents >= 0;
}

/** Fee for a single ticket at a given face value, before absorb/pass_on. */
export function ticketFeeCents(faceValueCents: number): number {
  if (!isValidPriceCents(faceValueCents)) {
    throw new Error(`Invalid face value: ${faceValueCents}`);
  }
  if (faceValueCents === 0) return 0; // free tickets are never charged a fee
  return Math.round((faceValueCents * SERVICE_FEE.bps) / 10_000) + SERVICE_FEE.flatCents;
}

export interface LineItemPricing {
  /** What the buyer pays for this line (subtotal + any passed-on fees). */
  buyerPaysCents: number;
  /** Face value portion (what the organiser is owed before platform cut). */
  faceValueCents: number;
  /** Fee portion for this line. */
  feeCents: number;
}

/**
 * Prices a line of `quantity` identical tickets.
 *
 * - `absorb`: the fee is taken out of the face value; the buyer pays face value.
 * - `pass_on`: the fee is added on top; the buyer pays face value + fee.
 */
export function priceLine(
  faceValueCents: number,
  quantity: number,
  feeMode: FeeMode,
): LineItemPricing {
  if (!Number.isInteger(quantity) || quantity < 0) {
    throw new Error(`Invalid quantity: ${quantity}`);
  }
  if (!isValidPriceCents(faceValueCents)) {
    throw new Error(`Invalid face value: ${faceValueCents}`);
  }
  const feePerTicket = ticketFeeCents(faceValueCents);
  const feeCents = feePerTicket * quantity;
  const faceTotal = faceValueCents * quantity;

  if (feeMode === 'pass_on') {
    return { buyerPaysCents: faceTotal + feeCents, faceValueCents: faceTotal, feeCents };
  }
  // absorb: buyer pays face value; fee comes out of the organiser's share.
  return { buyerPaysCents: faceTotal, faceValueCents: faceTotal, feeCents };
}

export interface OrderTotals {
  subtotalCents: number;
  feesCents: number;
  totalCents: number;
  klarnaEligible: boolean;
}

export function sumOrder(lines: LineItemPricing[]): OrderTotals {
  const subtotalCents = lines.reduce((acc, l) => acc + l.faceValueCents, 0);
  const feesCents = lines.reduce((acc, l) => acc + l.feeCents, 0);
  const passedOn = lines.reduce((acc, l) => acc + (l.buyerPaysCents - l.faceValueCents), 0);
  const totalCents = subtotalCents + passedOn;
  return {
    subtotalCents,
    feesCents,
    totalCents,
    klarnaEligible: totalCents >= KLARNA_MIN_TOTAL_CENTS,
  };
}

const formatterCache = new Map<string, Intl.NumberFormat>();

export function formatMoney(
  cents: number,
  currency: string = DEFAULT_CURRENCY,
  locale = 'en-NL',
): string {
  const key = `${locale}:${currency}`;
  let fmt = formatterCache.get(key);
  if (!fmt) {
    fmt = new Intl.NumberFormat(locale, { style: 'currency', currency });
    formatterCache.set(key, fmt);
  }
  return fmt.format(cents / 100);
}

/** Renders a price range like "Free", "€25", or "€25 – €80". */
export function formatPriceRange(
  minCents: number | null,
  maxCents: number | null,
  isFree: boolean,
  currency: string = DEFAULT_CURRENCY,
): string {
  if (isFree || (minCents === 0 && (maxCents === 0 || maxCents === null))) return 'Free';
  if (minCents === null) return 'Price TBA';
  if (maxCents === null || maxCents === minCents) return formatMoney(minCents, currency);
  return `${formatMoney(minCents, currency)} – ${formatMoney(maxCents, currency)}`;
}

import Stripe from 'stripe';

/**
 * Real payment collection is opt-in, the same rule Supabase itself follows:
 * absent env, the app falls back to an honest, working alternative (here,
 * free/zero-cost tickets can still be "bought" with no payment step; a
 * priced ticket surfaces a clear "not yet configured" error instead of
 * silently pretending to charge someone).
 */
export function hasStripe(): boolean {
  return Boolean(process.env.STRIPE_SECRET_KEY);
}

let cached: Stripe | null = null;

export function getStripe(): Stripe {
  if (cached) return cached;
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error('STRIPE_SECRET_KEY is not configured');
  cached = new Stripe(key, { apiVersion: '2026-08-26.dahlia' });
  return cached;
}

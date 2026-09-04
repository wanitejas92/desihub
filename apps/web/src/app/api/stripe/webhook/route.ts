import { NextResponse } from 'next/server';
import type Stripe from 'stripe';
import { hasStripe, getStripe } from '@/lib/stripe/client';
import { createAdminClient } from '@/lib/supabase/admin';

/**
 * Confirms payment once Stripe actually reports it, independent of whether
 * the buyer's browser makes it back to `success_url` (they might close the
 * tab). Verified by signature, not by trusting the request body — anyone
 * can POST to this URL, only Stripe can sign it correctly.
 */
export async function POST(req: Request): Promise<NextResponse> {
  if (!hasStripe()) return NextResponse.json({ error: 'Stripe not configured' }, { status: 404 });

  const signature = req.headers.get('stripe-signature');
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!signature || !webhookSecret) {
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
  }

  const body = await req.text();
  const stripe = getStripe();
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    const orderId = session.metadata?.orderId;
    if (orderId) {
      const admin = createAdminClient();
      const { SupabaseOrderRepository } = await import('@/lib/checkout/supabase-order-repository');
      const repo = new SupabaseOrderRepository(admin, null);
      await repo.confirmPayment(orderId, session.id);
    }
  }

  return NextResponse.json({ received: true });
}

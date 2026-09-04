import { headers } from 'next/headers';
import type { SupabaseClient } from '@supabase/supabase-js';
import {
  priceLine,
  sumOrder,
  type CreateOrderInput,
  type CreateOrderResult,
  type FeeMode,
  type OrderRepository,
  type OrderWithTickets,
  type Ticket,
} from '@desihub/shared';
import { hasStripe, getStripe } from '@/lib/stripe/client';
import { createAdminClient } from '@/lib/supabase/admin';

interface TicketTypeRow {
  id: string;
  name: string;
  price_cents: number;
  fee_mode: FeeMode;
  min_per_order: number;
  max_per_order: number;
}

async function siteOrigin(): Promise<string> {
  if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL;
  const h = await headers();
  const host = h.get('host') ?? 'localhost:3000';
  const proto = h.get('x-forwarded-proto') ?? (host.startsWith('localhost') ? 'http' : 'https');
  return `${proto}://${host}`;
}

/**
 * Supabase-backed checkout. `ticket_types` and `orders` are readable/insertable
 * under RLS (0003_rls.sql) with the caller's own session; `tickets` has no
 * client-facing insert policy at all — issuing a ticket is a privileged
 * operation on purpose, so it always goes through the service-role client
 * (`issueTickets`), never the session-bound one.
 */
export class SupabaseOrderRepository implements OrderRepository {
  constructor(
    private readonly db: SupabaseClient,
    private readonly userId: string | null,
  ) {}

  private async issueTickets(
    orderId: string,
    lines: CreateOrderInput['lines'],
    buyerEmail: string,
  ): Promise<Ticket[]> {
    const rows = lines.flatMap((line) =>
      Array.from({ length: line.quantity }, () => ({
        order_id: orderId,
        ticket_type_id: line.ticketTypeId,
        holder_email: buyerEmail,
        status: 'valid' as const,
      })),
    );
    const admin = createAdminClient();
    const { data, error } = await admin.from('tickets').insert(rows).select('*');
    if (error) throw error;
    return (data ?? []) as Ticket[];
  }

  async createOrder(input: CreateOrderInput): Promise<CreateOrderResult> {
    const ids = input.lines.map((l) => l.ticketTypeId);
    const { data: tierRows, error: tierErr } = await this.db
      .from('ticket_types')
      .select('id,name,price_cents,fee_mode,min_per_order,max_per_order')
      .eq('event_id', input.eventId)
      .in('id', ids);
    if (tierErr) return { ok: false, error: 'Could not load ticket types' };
    const tiers = new Map((tierRows ?? []).map((t) => [t.id, t as TicketTypeRow]));

    const reserved: { id: string; qty: number }[] = [];
    const rollback = async () => {
      for (const r of reserved) {
        await this.db.rpc('release_tickets', { p_ticket_type_id: r.id, p_qty: r.qty });
      }
    };

    const priced = [];
    for (const line of input.lines) {
      const tier = tiers.get(line.ticketTypeId);
      if (!tier) {
        await rollback();
        return { ok: false, error: 'Ticket type not found' };
      }
      if (line.quantity < tier.min_per_order || line.quantity > tier.max_per_order) {
        await rollback();
        return {
          ok: false,
          error: `${tier.name}: choose between ${tier.min_per_order} and ${tier.max_per_order} tickets`,
        };
      }
      const { data: reservedOk, error: rpcErr } = await this.db.rpc('reserve_tickets', {
        p_ticket_type_id: tier.id,
        p_qty: line.quantity,
      });
      if (rpcErr || !reservedOk) {
        await rollback();
        return { ok: false, error: `${tier.name}: not enough left` };
      }
      reserved.push({ id: tier.id, qty: line.quantity });
      priced.push(priceLine(tier.price_cents, line.quantity, tier.fee_mode));
    }

    const totals = sumOrder(priced);
    const buyerEmail = input.buyerEmail.trim().toLowerCase();
    const { data: orderRow, error: orderErr } = await this.db
      .from('orders')
      .insert({
        user_id: this.userId,
        event_id: input.eventId,
        status: totals.totalCents === 0 ? 'paid' : 'pending',
        subtotal_cents: totals.subtotalCents,
        fees_cents: totals.feesCents,
        total_cents: totals.totalCents,
        payment_method: totals.totalCents === 0 ? 'free' : null,
        buyer_email: buyerEmail,
      })
      .select('*')
      .single();
    if (orderErr || !orderRow) {
      await rollback();
      return { ok: false, error: 'Could not create the order' };
    }

    if (totals.totalCents === 0) {
      const tickets = await this.issueTickets(orderRow.id, input.lines, buyerEmail);
      return { ok: true, status: 'paid', order: { ...orderRow, tickets } };
    }

    if (!hasStripe()) {
      await rollback();
      await this.db.from('orders').delete().eq('id', orderRow.id);
      return { ok: false, error: 'Ticket sales are not yet configured for this event.' };
    }

    const { data: eventRow } = await this.db
      .from('events')
      .select('slug')
      .eq('id', input.eventId)
      .maybeSingle();
    const origin = await siteOrigin();
    const returnPath = eventRow?.slug ? `/e/${eventRow.slug}` : '/';

    const stripe = getStripe();
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      customer_email: buyerEmail,
      line_items: input.lines.map((line) => {
        const tier = tiers.get(line.ticketTypeId)!;
        const linePriced = priceLine(tier.price_cents, 1, tier.fee_mode);
        return {
          quantity: line.quantity,
          price_data: {
            currency: 'eur',
            unit_amount: linePriced.buyerPaysCents,
            product_data: { name: tier.name },
          },
        };
      }),
      success_url: `${origin}/orders/${orderRow.id}`,
      cancel_url: `${origin}${returnPath}`,
      metadata: { orderId: orderRow.id, lines: JSON.stringify(input.lines) },
    });

    await this.db
      .from('orders')
      .update({ payment_ref: session.id, payment_method: 'stripe' })
      .eq('id', orderRow.id);

    if (!session.url) {
      await rollback();
      await this.db.from('orders').delete().eq('id', orderRow.id);
      return { ok: false, error: 'Could not start checkout with the payment provider' };
    }
    return { ok: true, status: 'requires_payment', orderId: orderRow.id, checkoutUrl: session.url };
  }

  /**
   * Called by the Stripe webhook, which has no user session — always uses
   * the service-role client. Idempotent: a webhook can legitimately fire
   * more than once for the same event. Line quantities are recovered from
   * the Checkout Session's own metadata (there is no per-line table on
   * `orders`) so the webhook route itself doesn't need to know that detail.
   */
  async confirmPayment(orderId: string, paymentRef: string): Promise<OrderWithTickets> {
    const admin = createAdminClient();
    const { data: order, error } = await admin
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single();
    if (error || !order) throw new Error('No such order');
    if (order.status === 'paid') {
      const { data: tickets } = await admin.from('tickets').select('*').eq('order_id', orderId);
      return { ...order, tickets: (tickets ?? []) as Ticket[] };
    }

    const session = await getStripe().checkout.sessions.retrieve(paymentRef);
    const linesRaw = session.metadata?.lines;
    const lines = linesRaw ? (JSON.parse(linesRaw) as CreateOrderInput['lines']) : [];
    const tickets = await this.issueTickets(orderId, lines, order.buyer_email);

    const { data: updated, error: updateErr } = await admin
      .from('orders')
      .update({ status: 'paid', payment_ref: paymentRef })
      .eq('id', orderId)
      .select('*')
      .single();
    if (updateErr || !updated) throw new Error('Could not confirm payment');
    return { ...updated, tickets };
  }

  /**
   * A pending order's reserved quantities live only in the Stripe session's
   * metadata (there is no per-line table on `orders`) — recover them from
   * there to release the hold, best-effort, before marking it cancelled.
   */
  async cancelOrder(orderId: string): Promise<void> {
    const admin = createAdminClient();
    const { data: order } = await admin
      .from('orders')
      .select('status, payment_ref')
      .eq('id', orderId)
      .maybeSingle();
    if (!order || order.status !== 'pending') return;

    if (hasStripe() && order.payment_ref) {
      try {
        const session = await getStripe().checkout.sessions.retrieve(order.payment_ref);
        const linesRaw = session.metadata?.lines;
        if (linesRaw) {
          const lines = JSON.parse(linesRaw) as { ticketTypeId: string; quantity: number }[];
          for (const line of lines) {
            await admin.rpc('release_tickets', {
              p_ticket_type_id: line.ticketTypeId,
              p_qty: line.quantity,
            });
          }
        }
      } catch {
        // Best-effort release — the order is still marked cancelled below.
      }
    }
    await admin.from('orders').update({ status: 'cancelled' }).eq('id', orderId);
  }

  async getOrder(orderId: string): Promise<OrderWithTickets | null> {
    const { data, error } = await this.db
      .from('orders')
      .select('*, tickets(*)')
      .eq('id', orderId)
      .maybeSingle();
    if (!error && data) return data as OrderWithTickets;

    // RLS blocks a guest (no session) from reading their own order — the
    // order id itself is the access credential for the confirmation screen.
    const admin = createAdminClient();
    const { data: guestData } = await admin
      .from('orders')
      .select('*, tickets(*)')
      .eq('id', orderId)
      .maybeSingle();
    return (guestData as OrderWithTickets) ?? null;
  }

  async listMyOrders(): Promise<OrderWithTickets[]> {
    if (!this.userId) return [];
    const { data, error } = await this.db
      .from('orders')
      .select('*, tickets(*)')
      .eq('user_id', this.userId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return (data ?? []) as OrderWithTickets[];
  }
}

import type { Order, Ticket } from '../schemas';
import type { CreateOrderInput } from './schemas';

export type { CreateOrderInput };
export type CheckoutLine = CreateOrderInput['lines'][number];

/** An order joined with the tickets it produced, for confirmation/wallet screens. */
export interface OrderWithTickets extends Order {
  tickets: Ticket[];
}

export type CreateOrderResult =
  /** Demo/mock mode: there is no real payment step, so the order is paid immediately. */
  | { ok: true; status: 'paid'; order: OrderWithTickets }
  /** A real provider is configured: the order is reserved and pending until the buyer completes payment there. */
  | { ok: true; status: 'requires_payment'; orderId: string; checkoutUrl: string }
  | { ok: false; error: string };

/**
 * The data contract for checkout. One interface, two implementations, the
 * same split as `EventRepository`/`AccountRepository`: a Supabase-backed
 * adapter (production, `reserve_tickets`/`release_tickets` under RLS) and an
 * in-memory mock (dev/offline/E2E). Payment is a separate concern from order
 * creation on purpose — `confirmPayment` is what a provider's webhook calls
 * once money has actually moved, independent of the request that created
 * the (pending) order.
 */
export interface OrderRepository {
  /** Reserves inventory and creates the order. See `CreateOrderResult`. */
  createOrder(input: CreateOrderInput): Promise<CreateOrderResult>;
  /** Flips a pending order to paid and issues its tickets. Idempotent. */
  confirmPayment(orderId: string, paymentRef: string): Promise<OrderWithTickets>;
  /** Frees a pending order's reserved inventory (payment failed/expired). */
  cancelOrder(orderId: string): Promise<void>;
  /**
   * Looks up an order by id for the confirmation screen. The id itself
   * (an unguessable UUID) is the access credential here — the same pattern
   * Stripe's own Checkout success URL uses — so this works for a guest
   * buyer who never signed in, not just the account holder.
   */
  getOrder(orderId: string): Promise<OrderWithTickets | null>;
  /** Every order tied to the current signed-in account, newest first. */
  listMyOrders(): Promise<OrderWithTickets[]>;
}

import { MOCK_EVENTS } from '../catalog/mock-data';
import {
  mockReserveInventory,
  mockReleaseInventory,
  mockExtraSold,
} from '../catalog/mock-inventory';
import { priceLine, sumOrder } from '../money';
import type { Order, Ticket } from '../schemas';
import type {
  CreateOrderInput,
  CreateOrderResult,
  OrderRepository,
  OrderWithTickets,
} from './types';

/**
 * In-memory orders/tickets for dev/offline/E2E — the same role
 * `MockAccountRepository` plays for accounts. Selected only when Supabase
 * env is absent.
 *
 * Parked on `globalThis`, not a module-level `const` — the reason is the
 * same one documented in `mock-account-repository.ts`: a server action and
 * an RSC render land in separate Next.js bundles, each with its own copy of
 * a plain module store.
 */
const STORE_KEY = Symbol.for('desihub.mockOrders');
const globalStore = globalThis as typeof globalThis & {
  [STORE_KEY]?: Map<string, OrderWithTickets>;
};
const orders: Map<string, OrderWithTickets> = (globalStore[STORE_KEY] ??= new Map<
  string,
  OrderWithTickets
>());

function randomId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID();
  return `mock-${Math.random().toString(36).slice(2)}${Date.now().toString(36)}`;
}

function randomQrToken(): string {
  const bytes = new Uint8Array(16);
  if (typeof crypto !== 'undefined' && 'getRandomValues' in crypto) crypto.getRandomValues(bytes);
  else for (let i = 0; i < bytes.length; i++) bytes[i] = Math.floor(Math.random() * 256);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
}

/** Test seam — the module-level store would otherwise leak between tests. */
export function resetMockOrders(): void {
  orders.clear();
}

export class MockOrderRepository implements OrderRepository {
  constructor(private readonly userId: string | null) {}

  async createOrder(input: CreateOrderInput): Promise<CreateOrderResult> {
    const event = MOCK_EVENTS.find((e) => e.id === input.eventId);
    if (!event) return { ok: false, error: 'Event not found' };

    const reserved: { ticketTypeId: string; quantity: number }[] = [];
    const tickets: Ticket[] = [];
    const linePricing: {
      faceValueCents: number;
      quantity: number;
      feeMode: 'absorb' | 'pass_on';
    }[] = [];

    const rollback = () => {
      for (const r of reserved) mockReleaseInventory(r.ticketTypeId, r.quantity);
    };

    for (const line of input.lines) {
      const tier = event.ticketTypes.find((t) => t.id === line.ticketTypeId);
      if (!tier) {
        rollback();
        return { ok: false, error: 'Ticket type not found' };
      }
      if (line.quantity < tier.min_per_order || line.quantity > tier.max_per_order) {
        rollback();
        return {
          ok: false,
          error: `${tier.name}: choose between ${tier.min_per_order} and ${tier.max_per_order} tickets`,
        };
      }
      const currentSold = tier.sold + mockExtraSold(tier.id);
      const ok = mockReserveInventory(tier.id, line.quantity, tier.sold, tier.quantity);
      if (!ok) {
        rollback();
        const left = Math.max(tier.quantity - currentSold, 0);
        return { ok: false, error: `${tier.name}: only ${left} left` };
      }
      reserved.push({ ticketTypeId: tier.id, quantity: line.quantity });
      linePricing.push({
        faceValueCents: tier.price_cents,
        quantity: line.quantity,
        feeMode: tier.fee_mode,
      });
      for (let i = 0; i < line.quantity; i++) {
        tickets.push({
          id: randomId(),
          order_id: '', // filled in once the order id is known, below
          ticket_type_id: tier.id,
          holder_name: null,
          holder_email: input.buyerEmail,
          qr_token: randomQrToken(),
          status: 'valid',
          checked_in_at: null,
          checked_in_by: null,
          meal_choice: 'none',
        });
      }
    }

    const priced = linePricing.map((l) => priceLine(l.faceValueCents, l.quantity, l.feeMode));
    const totals = sumOrder(priced);
    const orderId = randomId();
    for (const t of tickets) t.order_id = orderId;

    // Demo mode has no real payment step — the order is paid the instant it
    // is created, mirroring the dev sign-in shortcut.
    const order: Order = {
      id: orderId,
      user_id: this.userId,
      event_id: input.eventId,
      status: 'paid',
      subtotal_cents: totals.subtotalCents,
      fees_cents: totals.feesCents,
      total_cents: totals.totalCents,
      payment_method: 'demo',
      payment_ref: `demo_${orderId}`,
      buyer_email: input.buyerEmail.trim().toLowerCase(),
      created_at: new Date().toISOString(),
    };
    const withTickets: OrderWithTickets = { ...order, tickets };
    orders.set(orderId, withTickets);
    return { ok: true, status: 'paid', order: withTickets };
  }

  async confirmPayment(orderId: string): Promise<OrderWithTickets> {
    const order = orders.get(orderId);
    if (!order) throw new Error('No such order');
    return order; // mock orders are already paid at creation
  }

  async cancelOrder(orderId: string): Promise<void> {
    const order = orders.get(orderId);
    if (!order || order.status !== 'pending') return;
    for (const ticket of order.tickets) mockReleaseInventory(ticket.ticket_type_id, 1);
    orders.set(orderId, { ...order, status: 'cancelled' });
  }

  async getOrder(orderId: string): Promise<OrderWithTickets | null> {
    return orders.get(orderId) ?? null;
  }

  async listMyOrders(): Promise<OrderWithTickets[]> {
    if (!this.userId) return [];
    return [...orders.values()]
      .filter((o) => o.user_id === this.userId)
      .sort((a, b) => b.created_at.localeCompare(a.created_at));
  }
}

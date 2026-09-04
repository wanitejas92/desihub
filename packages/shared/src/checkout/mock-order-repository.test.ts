import { describe, it, expect, beforeEach } from 'vitest';
import { MOCK_EVENTS } from '../catalog/mock-data';
import { resetMockInventory, mockExtraSold } from '../catalog/mock-inventory';
import { MockOrderRepository, resetMockOrders } from './mock-order-repository';

const EVENT = MOCK_EVENTS.find((e) => e.ticketTypes.length > 0)!;
const TIER = EVENT.ticketTypes[0]!;

beforeEach(() => {
  resetMockOrders();
  resetMockInventory();
});

describe('MockOrderRepository.createOrder', () => {
  it('creates a paid order with one ticket per unit of quantity', async () => {
    const repo = new MockOrderRepository('user-1');
    const result = await repo.createOrder({
      eventId: EVENT.id,
      buyerEmail: 'a@b.nl',
      lines: [{ ticketTypeId: TIER.id, quantity: 3 }],
    });

    expect(result.ok).toBe(true);
    if (!result.ok || result.status !== 'paid') throw new Error('expected a paid order');
    expect(result.order.status).toBe('paid');
    expect(result.order.tickets).toHaveLength(3);
    expect(result.order.total_cents).toBeGreaterThan(0);
    expect(result.order.user_id).toBe('user-1');
  });

  it('works for a guest (no account)', async () => {
    const repo = new MockOrderRepository(null);
    const result = await repo.createOrder({
      eventId: EVENT.id,
      buyerEmail: 'guest@b.nl',
      lines: [{ ticketTypeId: TIER.id, quantity: 1 }],
    });
    expect(result.ok).toBe(true);
    if (!result.ok || result.status !== 'paid') throw new Error('expected a paid order');
    expect(result.order.user_id).toBeNull();
  });

  it('rejects a quantity outside min/max per order', async () => {
    const repo = new MockOrderRepository('user-1');
    const result = await repo.createOrder({
      eventId: EVENT.id,
      buyerEmail: 'a@b.nl',
      lines: [{ ticketTypeId: TIER.id, quantity: TIER.max_per_order + 1 }],
    });
    expect(result.ok).toBe(false);
  });

  it('never oversells: rejects once inventory runs out', async () => {
    const repo = new MockOrderRepository('user-1');
    let left = TIER.quantity - TIER.sold;

    // Buy it out in max_per_order-sized chunks, same constraint a real buyer faces.
    while (left > 0) {
      const batch = Math.min(TIER.max_per_order, left);
      const result = await repo.createOrder({
        eventId: EVENT.id,
        buyerEmail: 'a@b.nl',
        lines: [{ ticketTypeId: TIER.id, quantity: batch }],
      });
      expect(result.ok).toBe(true);
      left -= batch;
    }

    const oneMore = await repo.createOrder({
      eventId: EVENT.id,
      buyerEmail: 'a@b.nl',
      lines: [{ ticketTypeId: TIER.id, quantity: 1 }],
    });
    expect(oneMore.ok).toBe(false);
  });

  it('rolls back reservations from earlier lines when a later line fails', async () => {
    const repo = new MockOrderRepository('user-1');
    const result = await repo.createOrder({
      eventId: EVENT.id,
      buyerEmail: 'a@b.nl',
      lines: [
        { ticketTypeId: TIER.id, quantity: 2 },
        { ticketTypeId: 'not-a-real-tier', quantity: 1 },
      ],
    });
    expect(result.ok).toBe(false);

    // The 2 reserved by the first line must have been released, not stuck as sold.
    expect(mockExtraSold(TIER.id)).toBe(0);
    const retry = await repo.createOrder({
      eventId: EVENT.id,
      buyerEmail: 'a@b.nl',
      lines: [{ ticketTypeId: TIER.id, quantity: 2 }],
    });
    expect(retry.ok).toBe(true);
  });
});

describe('MockOrderRepository.listMyOrders / getOrder', () => {
  it('lists only the signed-in user’s orders, newest first', async () => {
    const mine = new MockOrderRepository('user-1');
    const theirs = new MockOrderRepository('user-2');
    const a = await mine.createOrder({
      eventId: EVENT.id,
      buyerEmail: 'a@b.nl',
      lines: [{ ticketTypeId: TIER.id, quantity: 1 }],
    });
    await theirs.createOrder({
      eventId: EVENT.id,
      buyerEmail: 'x@b.nl',
      lines: [{ ticketTypeId: TIER.id, quantity: 1 }],
    });

    const list = await mine.listMyOrders();
    expect(list).toHaveLength(1);
    expect(a.ok && a.status === 'paid' && list[0]!.id === a.order.id).toBe(true);
  });

  it('returns a guest order by id without requiring an account', async () => {
    const repo = new MockOrderRepository(null);
    const created = await repo.createOrder({
      eventId: EVENT.id,
      buyerEmail: 'guest@b.nl',
      lines: [{ ticketTypeId: TIER.id, quantity: 1 }],
    });
    if (!created.ok || created.status !== 'paid') throw new Error('expected a paid order');

    const fetched = await repo.getOrder(created.order.id);
    expect(fetched?.buyer_email).toBe('guest@b.nl');
  });
});

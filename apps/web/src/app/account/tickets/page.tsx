import type { Metadata } from 'next';
import Link from 'next/link';
import { formatMoney, formatEventDate, formatEventTime } from '@desihub/shared';
import { getOrderRepository } from '@/lib/checkout/session';
import { getRepository } from '@/lib/data';
import { EmptyState } from '@/components/empty-state';
import { IconTicket } from '@/components/ui/icons';

export const metadata: Metadata = { title: 'My tickets' };

export default async function MyTicketsPage() {
  const orderRepo = await getOrderRepository();
  const orders = (await orderRepo.listMyOrders()).filter((o) => o.status === 'paid');

  if (orders.length === 0) {
    return (
      <EmptyState
        title="No tickets yet"
        description="Tickets you buy on DesiHub show up here, ready to show at the door."
        action={{ href: '/browse', label: 'Find something to go to' }}
      />
    );
  }

  const eventRepo = await getRepository();
  const events = await eventRepo.eventsByIds(orders.map((o) => o.event_id));
  const eventById = new Map(events.map((e) => [e.id, e]));

  return (
    <div className="space-y-4">
      {orders.map((order) => {
        const event = eventById.get(order.event_id);
        return (
          <div
            key={order.id}
            className="border-border bg-surface shadow-elevation flex items-center justify-between gap-3 rounded-lg border p-4"
          >
            <div className="min-w-0">
              <Link
                href={event ? `/e/${event.slug}` : '#'}
                className="text-fg hover:text-accent font-semibold"
              >
                {event?.title ?? 'Event'}
              </Link>
              {event && (
                <p className="text-fg-muted text-sm">
                  {formatEventDate(event.starts_at)} · {formatEventTime(event.starts_at)}
                </p>
              )}
              <p className="text-fg-subtle text-xs">
                {order.tickets.length} ticket{order.tickets.length === 1 ? '' : 's'} ·{' '}
                {order.total_cents === 0 ? 'Free' : formatMoney(order.total_cents, event?.currency)}
              </p>
            </div>
            <Link
              href={`/orders/${order.id}`}
              className="text-accent inline-flex shrink-0 items-center gap-1.5 text-sm font-semibold hover:underline"
            >
              <IconTicket width={16} height={16} />
              View
            </Link>
          </div>
        );
      })}
    </div>
  );
}

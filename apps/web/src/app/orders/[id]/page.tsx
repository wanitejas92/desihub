import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { formatMoney, formatEventDate, formatEventTime } from '@desihub/shared';
import { getOrderRepository } from '@/lib/checkout/session';
import { getRepository } from '@/lib/data';
import { IconCheckCircle, IconTicket } from '@/components/ui/icons';
import { Button } from '@/components/ui/button';

export const metadata: Metadata = { title: 'Your order' };

export default async function OrderConfirmationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const orderRepo = await getOrderRepository();
  const order = await orderRepo.getOrder(id);
  if (!order) notFound();

  const eventRepo = await getRepository();
  const [event] = await eventRepo.eventsByIds([order.event_id]);

  if (order.status === 'pending') {
    return (
      <div className="max-w-content mx-auto max-w-lg px-4 py-16 text-center sm:px-6">
        <p className="font-display text-fg text-xl font-semibold">Confirming your payment…</p>
        <p className="text-fg-muted mt-2 text-sm">
          This can take a few seconds. Refresh this page to check again.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-content mx-auto px-4 py-10 sm:px-6">
      <div className="mx-auto max-w-lg text-center">
        <IconCheckCircle className="text-success mx-auto" width={40} height={40} />
        <h1 className="font-display text-fg mt-3 text-2xl font-bold">
          {order.status === 'paid' ? "You're going!" : 'Order received'}
        </h1>
        {event && (
          <p className="text-fg-muted mt-1">
            {event.title} · {formatEventDate(event.starts_at)} · {formatEventTime(event.starts_at)}
          </p>
        )}
        <p className="text-fg-subtle mt-1 text-sm">A copy was sent to {order.buyer_email}.</p>
      </div>

      <div className="mx-auto mt-8 max-w-lg space-y-3">
        {order.tickets.map((ticket, i) => (
          <div
            key={ticket.id}
            className="border-border bg-surface shadow-elevation flex items-center gap-4 rounded-lg border p-4"
          >
            <div className="bg-accent-subtle text-accent flex h-12 w-12 shrink-0 items-center justify-center rounded-full">
              <IconTicket width={20} height={20} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-fg text-sm font-semibold">
                {event?.title ?? 'Ticket'} — #{i + 1}
              </p>
              <p className="text-fg-subtle mt-0.5 font-mono text-xs break-all">{ticket.qr_token}</p>
              <p className="text-fg-subtle text-xs">Show this code at the door.</p>
            </div>
          </div>
        ))}
      </div>

      <div className="mx-auto mt-6 max-w-lg">
        <div className="border-border flex items-center justify-between border-t pt-4 text-sm">
          <span className="text-fg-muted">Total paid</span>
          <span className="text-fg font-semibold tabular-nums">
            {order.total_cents === 0 ? 'Free' : formatMoney(order.total_cents)}
          </span>
        </div>
      </div>

      <div className="mx-auto mt-6 flex max-w-lg flex-wrap justify-center gap-3">
        <Button href="/account/tickets" variant="secondary">
          View all my tickets
        </Button>
        {event && (
          <Button href={`/e/${event.slug}`} variant="outline">
            Back to event
          </Button>
        )}
      </div>
    </div>
  );
}

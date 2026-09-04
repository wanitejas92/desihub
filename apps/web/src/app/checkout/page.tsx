import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { formatMoney, priceLine, sumOrder, type LineItemPricing } from '@desihub/shared';
import { getRepository } from '@/lib/data';
import { getCurrentUser } from '@/lib/account/session';
import { CheckoutForm } from '@/components/checkout-form';
import { EventImage } from '@/components/event-image';

export const metadata: Metadata = { title: 'Checkout' };

interface PricedLine {
  ticketTypeId: string;
  name: string;
  quantity: number;
  pricing: LineItemPricing;
}

function parseSelection(sel: string): { ticketTypeId: string; quantity: number }[] {
  return sel
    .split(',')
    .map((pair) => {
      const [id, qtyStr] = pair.split(':');
      return { ticketTypeId: id ?? '', quantity: Number(qtyStr) };
    })
    .filter((l) => l.ticketTypeId && Number.isInteger(l.quantity) && l.quantity > 0);
}

export default async function CheckoutPage({
  searchParams,
}: {
  searchParams: Promise<{ event?: string; sel?: string }>;
}) {
  const { event: slug, sel } = await searchParams;
  if (!slug || !sel) notFound();

  const repo = await getRepository();
  const event = await repo.getEventBySlug(slug);
  if (!event) notFound();

  const requested = parseSelection(sel);
  const lines: PricedLine[] = requested
    .map((line) => {
      const tier = event.ticketTypes.find((t) => t.id === line.ticketTypeId);
      if (!tier) return null;
      return {
        ticketTypeId: tier.id,
        name: tier.name,
        quantity: line.quantity,
        pricing: priceLine(tier.price_cents, line.quantity, tier.fee_mode),
      };
    })
    .filter((l): l is PricedLine => l !== null);
  if (lines.length === 0) notFound();

  const totals = sumOrder(lines.map((l) => l.pricing));
  const user = await getCurrentUser();

  return (
    <div className="max-w-content mx-auto px-4 py-8 sm:px-6">
      <div className="mx-auto max-w-lg">
        <h1 className="font-display text-fg text-2xl font-bold">Checkout</h1>

        <div className="border-border bg-surface shadow-elevation mt-5 flex gap-3 rounded-lg border p-4">
          <div className="bg-bg-subtle relative h-16 w-16 shrink-0 overflow-hidden rounded-md">
            <EventImage
              imageUrl={event.image_url}
              title={event.title}
              category={event.category}
              startsAt={event.starts_at}
              organiserName={event.organiser.name}
              sizes="64px"
              fallbackWidth={128}
              fallbackHeight={128}
            />
          </div>
          <div className="min-w-0">
            <Link href={`/e/${event.slug}`} className="text-fg hover:text-accent font-semibold">
              {event.title}
            </Link>
            <p className="text-fg-muted text-sm">{event.venue?.name ?? event.venue?.city}</p>
          </div>
        </div>

        <div className="border-border bg-surface shadow-elevation mt-4 rounded-lg border p-4">
          <ul className="divide-border divide-y">
            {lines.map((l) => (
              <li
                key={l.ticketTypeId}
                className="flex items-center justify-between gap-3 py-2 text-sm"
              >
                <span className="text-fg-muted">
                  {l.quantity} × {l.name}
                </span>
                <span className="text-fg font-medium tabular-nums">
                  {formatMoney(l.pricing.buyerPaysCents, event.currency)}
                </span>
              </li>
            ))}
          </ul>
          <div className="border-border mt-2 flex items-center justify-between border-t pt-3">
            <span className="text-fg font-semibold">Total</span>
            <span className="font-display text-fg text-lg font-bold tabular-nums">
              {totals.totalCents === 0 ? 'Free' : formatMoney(totals.totalCents, event.currency)}
            </span>
          </div>
        </div>

        <CheckoutForm
          eventId={event.id}
          eventSlug={event.slug}
          lines={requested}
          defaultEmail={user?.email ?? ''}
        />
      </div>
    </div>
  );
}

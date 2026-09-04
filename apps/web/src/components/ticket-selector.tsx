'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { formatMoney, priceLine, sumOrder, type EventWithRelations } from '@desihub/shared';
import { Button } from './ui/button';
import { cn } from '@/lib/cn';

/** Encodes the cart into the checkout page's URL: `id:qty,id:qty`. */
function encodeSelection(selection: Record<string, number>): string {
  return Object.entries(selection)
    .filter(([, qty]) => qty > 0)
    .map(([id, qty]) => `${id}:${qty}`)
    .join(',');
}

export function TicketSelector({
  event,
  compact,
}: {
  event: Pick<EventWithRelations, 'slug' | 'currency' | 'ticketTypes'>;
  compact?: boolean;
}) {
  const router = useRouter();
  const [selection, setSelection] = useState<Record<string, number>>({});

  const setQty = (tierId: string, qty: number, min: number, max: number) => {
    setSelection((prev) => ({
      ...prev,
      [tierId]: Math.max(0, Math.min(max, qty === 0 ? 0 : Math.max(min, qty))),
    }));
  };

  const totals = useMemo(() => {
    const lines = event.ticketTypes
      .map((tier) => {
        const qty = selection[tier.id] ?? 0;
        return qty > 0 ? priceLine(tier.price_cents, qty, tier.fee_mode) : null;
      })
      .filter((l): l is NonNullable<typeof l> => l !== null);
    return sumOrder(lines);
  }, [event.ticketTypes, selection]);

  const selectedCount = Object.values(selection).reduce((a, b) => a + b, 0);

  const goToCheckout = () => {
    const sel = encodeSelection(selection);
    if (!sel) return;
    router.push(`/checkout?event=${event.slug}&sel=${encodeURIComponent(sel)}`);
  };

  if (compact) {
    return (
      <Button
        onClick={() => router.push(`/e/${event.slug}#tickets`)}
        className="h-11 rounded-md px-5 font-semibold whitespace-nowrap"
      >
        Select tickets
      </Button>
    );
  }

  return (
    <div id="tickets">
      <ul className="divide-border mt-3 divide-y">
        {event.ticketTypes.map((tier) => {
          const left = Math.max(tier.quantity - tier.sold, 0);
          const qty = selection[tier.id] ?? 0;
          const soldOut = left <= 0;
          return (
            <li key={tier.id} className="flex items-center justify-between gap-3 py-2.5">
              <div>
                <p className="text-fg text-sm font-medium">{tier.name}</p>
                <p className="text-fg-subtle text-xs">
                  {soldOut ? 'Sold out' : `${left} spots left`}
                </p>
                <p className="text-fg mt-0.5 text-sm font-semibold">
                  {tier.price_cents === 0 ? 'Free' : formatMoney(tier.price_cents, event.currency)}
                </p>
              </div>
              <div
                className={cn(
                  'border-border flex shrink-0 items-center rounded-md border',
                  soldOut && 'opacity-40',
                )}
              >
                <button
                  type="button"
                  disabled={soldOut || qty === 0}
                  aria-label={`Fewer ${tier.name}`}
                  onClick={() =>
                    setQty(tier.id, qty - 1, tier.min_per_order, Math.min(tier.max_per_order, left))
                  }
                  className="text-fg-muted hover:text-fg flex h-9 w-9 items-center justify-center disabled:cursor-not-allowed disabled:opacity-40"
                >
                  −
                </button>
                <span className="w-6 text-center text-sm font-semibold tabular-nums">{qty}</span>
                <button
                  type="button"
                  disabled={soldOut || qty >= Math.min(tier.max_per_order, left)}
                  aria-label={`More ${tier.name}`}
                  onClick={() =>
                    setQty(tier.id, qty + 1, tier.min_per_order, Math.min(tier.max_per_order, left))
                  }
                  className="text-fg-muted hover:text-fg flex h-9 w-9 items-center justify-center disabled:cursor-not-allowed disabled:opacity-40"
                >
                  +
                </button>
              </div>
            </li>
          );
        })}
      </ul>

      <Button
        onClick={goToCheckout}
        disabled={selectedCount === 0}
        className="mt-4 flex w-full items-center justify-center"
      >
        {selectedCount === 0
          ? 'Select tickets'
          : `Continue — ${totals.totalCents === 0 ? 'Free' : formatMoney(totals.totalCents, event.currency)}`}
      </Button>
    </div>
  );
}

'use client';

import { useState, useTransition, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import type { CheckoutLine } from '@desihub/shared';
import { createOrderAction } from '@/lib/checkout/actions';
import { Button } from './ui/button';

export function CheckoutForm({
  eventId,
  eventSlug,
  lines,
  defaultEmail,
}: {
  eventId: string;
  eventSlug: string;
  lines: CheckoutLine[];
  defaultEmail: string;
}) {
  const router = useRouter();
  const [email, setEmail] = useState(defaultEmail);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const result = await createOrderAction({ eventId, buyerEmail: email, lines });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      if (result.status === 'paid') {
        router.push(`/orders/${result.order.id}`);
        return;
      }
      // Stripe Checkout is a different origin — a full navigation, not router.push.
      window.location.href = result.checkoutUrl;
    });
  };

  return (
    <form
      onSubmit={onSubmit}
      className="border-border bg-surface shadow-elevation mt-4 rounded-lg border p-4"
    >
      <label htmlFor="buyerEmail" className="text-fg block text-sm font-semibold">
        Email address
      </label>
      <p className="text-fg-subtle mt-1 text-xs">Your tickets go here.</p>
      <input
        id="buyerEmail"
        name="buyerEmail"
        type="email"
        required
        autoComplete="email"
        inputMode="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="input mt-2 w-full"
      />

      {error && <p className="text-error mt-3 text-sm">{error}</p>}

      <Button type="submit" disabled={pending} className="mt-4 w-full">
        {pending ? 'Processing…' : 'Complete order'}
      </Button>
      <p className="text-fg-subtle mt-3 text-center text-xs">
        Changed your mind?{' '}
        <a href={`/e/${eventSlug}`} className="hover:text-fg underline">
          Back to the event
        </a>
      </p>
    </form>
  );
}

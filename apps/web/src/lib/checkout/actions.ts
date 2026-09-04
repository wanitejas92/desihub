'use server';

import { revalidatePath } from 'next/cache';
import { createOrderSchema, type CreateOrderInput, type CreateOrderResult } from '@desihub/shared';
import { getOrderRepository } from './session';
import { getRepository } from '@/lib/data';

export async function createOrderAction(input: CreateOrderInput): Promise<CreateOrderResult> {
  const parsed = createOrderSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? 'Invalid order' };
  }

  const repo = await getOrderRepository();
  const result = await repo.createOrder(parsed.data);
  if (result.ok) {
    revalidatePath('/account/tickets');
    // The event page is ISR-cached (revalidate = 3600) and shows live
    // inventory ("N spots left") — a sale must invalidate it immediately,
    // not wait out the hour, or a sold-out event would still show tickets.
    const [event] = await (await getRepository()).eventsByIds([input.eventId]);
    if (event) revalidatePath(`/e/${event.slug}`);
  }
  return result;
}

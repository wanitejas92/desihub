import { z } from 'zod';

/**
 * What the checkout form is allowed to submit. Ticket type ids are opaque
 * here on purpose — UUIDs behind Supabase, readable keys behind the mock —
 * the real guards are the foreign keys, `reserve_tickets`'s atomic check, and
 * the `no_oversell` constraint, not a shape check on the browser's payload.
 */
export const checkoutLineSchema = z.object({
  ticketTypeId: z.string().min(1).max(64),
  quantity: z.number().int().min(1).max(20),
});

export const createOrderSchema = z.object({
  eventId: z.string().min(1).max(64),
  buyerEmail: z.string().trim().email('Enter a valid email address'),
  lines: z.array(checkoutLineSchema).min(1, 'Select at least one ticket').max(20),
});
export type CreateOrderInput = z.infer<typeof createOrderSchema>;

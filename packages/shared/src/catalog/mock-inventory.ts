/**
 * Ticket inventory the mock checkout path has sold, layered on top of the
 * static `sold` count baked into `mock-data.ts`. Parked on `globalThis` for
 * the same reason `mock-account-repository.ts` is: Next.js gives a server
 * action and an RSC render separate copies of a module-level `const`, so a
 * plain `Map` here would let checkout reserve inventory that the event page
 * never sees sold. Mirrors the real `reserve_tickets`/`release_tickets`
 * Postgres functions (supabase/migrations/0002_functions_triggers.sql).
 */
const STORE_KEY = Symbol.for('desihub.mockTicketInventory');
const globalStore = globalThis as typeof globalThis & {
  [STORE_KEY]?: Map<string, number>;
};
const extraSold: Map<string, number> = (globalStore[STORE_KEY] ??= new Map<string, number>());

export function mockExtraSold(ticketTypeId: string): number {
  return extraSold.get(ticketTypeId) ?? 0;
}

/** Atomically reserves `quantity` against `capacity`. False when not enough is left. */
export function mockReserveInventory(
  ticketTypeId: string,
  quantity: number,
  baseSold: number,
  capacity: number,
): boolean {
  const current = baseSold + mockExtraSold(ticketTypeId);
  if (current + quantity > capacity) return false;
  extraSold.set(ticketTypeId, current - baseSold + quantity);
  return true;
}

/** Releases a reservation (failed/expired order) back into the pool. */
export function mockReleaseInventory(ticketTypeId: string, quantity: number): void {
  const current = mockExtraSold(ticketTypeId);
  extraSold.set(ticketTypeId, Math.max(0, current - quantity));
}

/** Test seam — the module-level store would otherwise leak between tests. */
export function resetMockInventory(): void {
  extraSold.clear();
}

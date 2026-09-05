/**
 * Drafts created through `/submit` while running on the mock repository.
 *
 * `submitEvent` used to return a slug and drop the input on the floor, which
 * made the mock agree with a broken database a little too well: both said
 * "submitted!" and neither had an event afterwards. Keeping the row here
 * means the mock behaves like the real adapter does now — a submission
 * produces a draft that the review queue can see and the public cannot.
 *
 * On `globalThis` for the same reason as `mock-inventory.ts`: Next.js gives a
 * server action and an RSC render separate copies of a module-level `const`,
 * so a plain array would be written by the action and read back empty.
 */

export interface MockSubmission {
  slug: string;
  title: string;
  starts_at: string;
  city: string;
  organiser_name: string;
  venue_name?: string;
  category?: string;
  /** Always 'draft' — the mock mirrors the RPC, which hard-codes it. */
  status: 'draft';
  submitted_at: string;
}

const STORE_KEY = Symbol.for('desihub.mockSubmissions');
const globalStore = globalThis as typeof globalThis & {
  [STORE_KEY]?: MockSubmission[];
};
const submissions: MockSubmission[] = (globalStore[STORE_KEY] ??= []);

export function mockRecordSubmission(entry: Omit<MockSubmission, 'status' | 'submitted_at'>): void {
  submissions.push({ ...entry, status: 'draft', submitted_at: new Date().toISOString() });
}

/** Newest first, matching how a review queue is read. */
export function mockSubmissions(): MockSubmission[] {
  return [...submissions].reverse();
}

export function mockFindSubmission(slug: string): MockSubmission | undefined {
  return submissions.find((s) => s.slug === slug);
}

/** Test seam — the module-level store would otherwise leak between tests. */
export function resetMockSubmissions(): void {
  submissions.length = 0;
}

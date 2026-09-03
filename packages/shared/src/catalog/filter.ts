import type { EventWithRelations, EventFilters } from './types';
import type { City } from '../constants';
import type { CityCount } from './repository';

/**
 * Pure, testable filtering + sorting for the mock repository and any
 * client-side refinement. The Supabase adapter pushes the same predicates into
 * SQL, but this is the reference semantics.
 */
export function applyFilters(
  events: EventWithRelations[],
  filters: EventFilters,
  now: Date = new Date(),
): EventWithRelations[] {
  const nowMs = now.getTime();
  let out = events.filter((e) => {
    if (!filters.includePast) {
      const end = e.ends_at ? new Date(e.ends_at).getTime() : new Date(e.starts_at).getTime();
      if (end < nowMs) return false;
    }
    if (filters.city && e.venue?.city !== filters.city) return false;
    if (filters.category && e.category !== filters.category) return false;
    if (filters.familyFriendly && !e.family_friendly) return false;
    if (filters.price === 'free' && !e.is_free) return false;
    if (filters.price === 'paid' && e.is_free) return false;
    if (filters.language && !e.languages.includes(filters.language as never)) return false;
    if (filters.dateFrom && new Date(e.starts_at) < new Date(filters.dateFrom)) return false;
    if (filters.dateTo && new Date(e.starts_at) > new Date(`${filters.dateTo}T23:59:59Z`))
      return false;
    if (filters.search) {
      const q = filters.search.toLowerCase();
      const hay = `${e.title} ${e.description ?? ''} ${e.tags.join(' ')} ${
        e.organiser.name
      } ${e.venue?.city ?? ''}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });

  out = out.sort((a, b) => {
    if (filters.includePast) {
      // Past view: most recent first.
      return new Date(b.starts_at).getTime() - new Date(a.starts_at).getTime();
    }
    return new Date(a.starts_at).getTime() - new Date(b.starts_at).getTime();
  });

  return out;
}

export function paginate<T>(items: T[], offset = 0, limit?: number): T[] {
  return limit == null ? items.slice(offset) : items.slice(offset, offset + limit);
}

/**
 * Cities ranked by how many of the given (already-upcoming-filtered) events
 * fall in them. Shared by both repository adapters so "popular" means the
 * same real count either way — never a fabricated number.
 */
export function cityCounts(events: EventWithRelations[], limit = 6): CityCount[] {
  const counts = new Map<City, number>();
  for (const e of events) {
    const city = e.venue?.city as City | undefined;
    if (!city) continue;
    counts.set(city, (counts.get(city) ?? 0) + 1);
  }
  return Array.from(counts, ([city, count]) => ({ city, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}

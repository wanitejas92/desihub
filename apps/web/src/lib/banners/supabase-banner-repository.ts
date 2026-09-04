import type { SupabaseClient } from '@supabase/supabase-js';
import type { Banner, BannerRepository } from '@desihub/shared';

/**
 * Supabase-backed banners.
 *
 * The RLS policy already filters to active, in-window rows, so this query
 * deliberately does not repeat those conditions — one place decides what is
 * live, and it is the one an expired banner cannot slip past.
 */
export class SupabaseBannerRepository implements BannerRepository {
  constructor(private readonly db: SupabaseClient) {}

  async listActive(): Promise<Banner[]> {
    const { data, error } = await this.db
      .from('banners')
      .select('id,image_url,link_url,title')
      .order('sort_order', { ascending: true });

    // A broken banner strip must never take the homepage down with it — the
    // carousel renders nothing for an empty list, which is a valid state.
    if (error) return [];

    return (data ?? []).map((r) => ({
      id: r.id as string,
      imageUrl: r.image_url as string,
      linkUrl: (r.link_url as string | null) ?? null,
      title: r.title as string,
    }));
  }
}

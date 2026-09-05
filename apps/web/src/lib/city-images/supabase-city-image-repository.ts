import type { SupabaseClient } from '@supabase/supabase-js';
import type { City, CityImageRepository } from '@desihub/shared';

export class SupabaseCityImageRepository implements CityImageRepository {
  constructor(private readonly db: SupabaseClient) {}

  async listAll(): Promise<Partial<Record<City, string>>> {
    const { data, error } = await this.db.from('city_images').select('city,image_url');
    if (error) return {};

    const out: Partial<Record<City, string>> = {};
    for (const row of data ?? []) {
      out[row.city as City] = row.image_url as string;
    }
    return out;
  }
}

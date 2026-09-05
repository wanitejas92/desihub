import { CITIES } from '@desihub/shared';
import { getCityImageRepository } from '@/lib/city-images';
import { CityImageForm } from '@/components/admin/city-image-form';

export default async function AdminCitiesPage() {
  const repo = await getCityImageRepository();
  const images = await repo.listAll();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-lg font-semibold">Popular Cities photos</h2>
        <p className="text-fg-muted mt-1 text-sm">
          City names and event counts on the homepage are computed automatically from real events —
          nothing to manage there. A cover photo is the one thing that has to be set by hand; a city
          with none set here renders the designed gradient tile instead.
        </p>
      </div>

      <div className="max-w-2xl space-y-4">
        {CITIES.map((city) => (
          <CityImageForm key={city} city={city} imageUrl={images[city] ?? null} />
        ))}
      </div>
    </div>
  );
}

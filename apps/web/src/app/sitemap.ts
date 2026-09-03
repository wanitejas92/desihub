import type { MetadataRoute } from 'next';
import { getRepository } from '@/lib/data';

const SITE = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://desihub.nl';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const repo = await getRepository();
  const [eventSlugs, orgSlugs] = await Promise.all([
    repo.listEventSlugs(),
    repo.listOrganiserSlugs(),
  ]);

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${SITE}/`, changeFrequency: 'daily', priority: 1 },
    { url: `${SITE}/browse`, changeFrequency: 'daily', priority: 0.9 },
    { url: `${SITE}/submit`, changeFrequency: 'monthly', priority: 0.5 },
  ];

  return [
    ...staticRoutes,
    ...eventSlugs.map((slug) => ({
      url: `${SITE}/e/${slug}`,
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    })),
    ...orgSlugs.map((slug) => ({
      url: `${SITE}/o/${slug}`,
      changeFrequency: 'weekly' as const,
      priority: 0.6,
    })),
  ];
}

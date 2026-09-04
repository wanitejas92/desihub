import type { Banner, BannerRepository } from './types';

/**
 * Demo banners for dev/offline/E2E — the same role the other mock
 * repositories play. The image paths point at `public/banners/`, which is
 * empty until real artwork is dropped in; the carousel draws designed
 * fallback art for any slide whose file is missing, so this reads as three
 * finished slides either way rather than three broken images.
 */
const DEMO: Banner[] = [
  {
    id: 'banner-01',
    imageUrl: '/banners/01.jpg',
    linkUrl: '/e/sufi-night-kavita-seth',
    title: 'Sufi Night with Kavita Seth',
  },
  {
    id: 'banner-02',
    imageUrl: '/banners/02.jpg',
    linkUrl: '/e/punjabi-live-bhangra-arena',
    title: 'Punjabi Live at Bhangra Arena',
  },
  {
    id: 'banner-03',
    imageUrl: '/banners/03.jpg',
    linkUrl: '/browse?category=diwali',
    title: 'Diwali season across the Netherlands',
  },
];

export class MockBannerRepository implements BannerRepository {
  async listActive(): Promise<Banner[]> {
    return DEMO;
  }
}

/**
 * A promo banner — the rotating artwork at the top of the homepage.
 *
 * The artwork is supplied, not generated: organisers already produce event
 * posters, and those beat any illustration the site could invent. This type
 * is deliberately thin, because everything about a banner is editorial —
 * which image, where it points, when it runs.
 */
export interface Banner {
  id: string;
  /** Absolute URL of the artwork (a public storage object, usually). */
  imageUrl: string;
  /** Where clicking goes. Null renders a non-interactive slide. */
  linkUrl: string | null;
  /** Doubles as the image's alt text, so it is never optional. */
  title: string;
}

/**
 * One interface, two implementations — the same split the listings, account
 * and checkout layers use. Reads only: banners are curated in the backend
 * (Supabase Studio + a storage bucket), not authored through the site.
 */
export interface BannerRepository {
  /** Active, in-window banners in display order. Empty is a valid answer. */
  listActive(): Promise<Banner[]>;
}

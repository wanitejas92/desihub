/** URL slug helpers. Slugs are unique per table (enforced in the DB too). */

export function slugify(input: string): string {
  return input
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '') // strip diacritics
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .slice(0, 80);
}

/** Appends a short suffix to disambiguate a colliding slug. */
export function slugWithSuffix(base: string, suffix: string): string {
  const clean = slugify(base);
  const s = slugify(suffix);
  return s ? `${clean}-${s}` : clean;
}

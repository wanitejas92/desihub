/**
 * Embedded map for the event page. The no-API-key `output=embed` form is
 * used deliberately — a Maps Embed API key would need to live in this repo
 * or an env var either way, and the venue's own address is not sensitive
 * data worth gating behind one.
 */
export function VenueMap({
  name,
  address,
  city,
  lat,
  lng,
}: {
  name: string;
  address: string | null;
  city: string;
  lat: number | null;
  lng: number | null;
}) {
  const query =
    lat != null && lng != null ? `${lat},${lng}` : [name, address, city].filter(Boolean).join(', ');
  const src = `https://www.google.com/maps?q=${encodeURIComponent(query)}&z=15&output=embed`;

  return (
    <div className="border-border bg-surface overflow-hidden rounded-2xl border">
      <iframe
        title={`Map showing ${name}`}
        src={src}
        loading="lazy"
        className="h-48 w-full border-0"
        referrerPolicy="no-referrer-when-downgrade"
      />
    </div>
  );
}

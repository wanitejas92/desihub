import { BannerForm } from '@/components/admin/banner-form';

export default async function AdminBannersPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-baseline justify-between gap-4">
        <h2 className="font-display text-lg font-semibold">Create banner</h2>
      </div>

      <div className="max-w-2xl">
        <BannerForm />
      </div>

      <div className="border-border max-w-2xl rounded-lg border p-4">
        <h3 className="text-fg font-semibold">How to add a banner:</h3>
        <ol className="text-fg-muted mt-3 space-y-2 text-sm">
          <li>
            1. <strong>Upload the image:</strong> Click &quot;Upload banner image&quot; and pick a
            file (WebP/JPEG/PNG, up to 5MB) — it uploads straight to Storage, no separate step
          </li>
          <li>
            2. <strong>Find event URL:</strong> (Optional) If linking to an event, copy the event
            page URL (e.g., https://desihub.nl/e/event-slug)
          </li>
          <li>
            3. <strong>Fill the form:</strong> Add a title and the optional event link
          </li>
          <li>
            4. <strong>Submit:</strong> Click &quot;Create banner&quot; and it will appear on
            homepage
          </li>
        </ol>
      </div>
    </div>
  );
}

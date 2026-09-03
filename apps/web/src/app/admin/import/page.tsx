import type { Metadata } from 'next';
import { ImportTool } from '@/components/import-tool';

export const metadata: Metadata = {
  title: 'Import event',
  robots: { index: false, follow: false },
};

export default function AdminImportPage() {
  return (
    <div className="max-w-content mx-auto px-4 py-10 sm:px-6">
      <p className="text-fg-subtle text-xs font-semibold tracking-wide uppercase">Admin</p>
      <h1 className="font-display mt-1 text-3xl font-semibold">Import an event</h1>
      <p className="text-fg-muted mt-2 max-w-prose">
        Paste a Facebook event, Instagram caption or Eventbrite listing to extract the details into
        a reviewable draft. This is how the catalogue gets filled in the early days.
      </p>
      <div className="mt-8">
        <ImportTool />
      </div>
    </div>
  );
}

import type { Metadata } from 'next';
import { SubmitForm } from '@/components/submit-form';
import { getCurrentUser } from '@/lib/account/session';
import { hasSupabase } from '@/lib/data';

export const metadata: Metadata = {
  title: 'Submit an event',
  description: 'List your Desi event on DesiHub — free, no account needed.',
};

export default async function SubmitPage() {
  // Storage writes need a JWT, so the artwork picker only offers a real
  // upload to someone signed in; everyone else gets a URL field instead.
  const user = hasSupabase() ? await getCurrentUser() : null;

  return (
    <div className="mx-auto max-w-xl px-4 py-10 sm:px-6">
      <h1 className="font-display text-2xl font-semibold sm:text-3xl">List your event</h1>
      <p className="text-fg-muted mt-2">
        Reach the Desi community across the Netherlands. It&apos;s free — tell us what people can
        expect and we&apos;ll review it within a day.
      </p>
      <div className="mt-8">
        <SubmitForm canUpload={Boolean(user)} />
      </div>
    </div>
  );
}

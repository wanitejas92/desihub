import type { Metadata } from 'next';
import { SubmitForm } from '@/components/submit-form';

export const metadata: Metadata = {
  title: 'Submit an event',
  description:
    'List your Desi event on DesiHub — free. Three fields to get started, no account needed.',
};

export default function SubmitPage() {
  return (
    <div className="mx-auto max-w-xl px-4 py-10 sm:px-6">
      <h1 className="font-display text-3xl font-semibold sm:text-4xl">List your event</h1>
      <p className="text-fg-muted mt-2">
        Reach the Desi community across the Netherlands. It&apos;s free, and you only need three
        fields to start.
      </p>
      <div className="mt-8">
        <SubmitForm />
      </div>
    </div>
  );
}

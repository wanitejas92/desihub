import { hasSupabase } from '@/lib/data';
import { AdminEventForm } from '@/components/admin/admin-event-form';

export default function AdminNewEventPage() {
  if (!hasSupabase()) return null;

  return (
    <div className="max-w-2xl">
      <h2 className="font-display text-lg font-semibold">Add an event</h2>
      <p className="text-fg-muted mt-1 mb-6 text-sm">
        The short path: fill this in and it is on the site. Use the review queue instead when an
        organiser has already submitted something.
      </p>
      <AdminEventForm />
    </div>
  );
}

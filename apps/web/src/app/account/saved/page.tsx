import type { Metadata } from 'next';
import { isPast } from '@desihub/shared';
import { EventGrid } from '@/components/event-grid';
import { EmptyState } from '@/components/empty-state';
import { getAccountRepository } from '@/lib/account/session';
import { getRepository } from '@/lib/data';

export const metadata: Metadata = { title: 'Saved events' };

export default async function SavedEventsPage() {
  const account = await getAccountRepository();
  const savedIds = account ? await account.listSavedEventIds() : [];
  const events = savedIds.length > 0 ? await (await getRepository()).eventsByIds(savedIds) : [];

  const upcoming = events
    .filter((e) => !isPast(e.ends_at ?? e.starts_at))
    .sort((a, b) => new Date(a.starts_at).getTime() - new Date(b.starts_at).getTime());
  const past = events
    .filter((e) => isPast(e.ends_at ?? e.starts_at))
    .sort((a, b) => new Date(b.starts_at).getTime() - new Date(a.starts_at).getTime());

  if (events.length === 0) {
    return (
      <EmptyState
        title="Nothing saved yet"
        description="Tap the heart on any event and it'll show up here — on every device you sign in on."
        action={{ href: '/browse', label: 'Find something to save' }}
      />
    );
  }

  return (
    <div className="space-y-10">
      {upcoming.length > 0 && (
        <section>
          <h2 className="font-display mb-4 text-lg font-semibold sm:text-xl">
            Coming up ({upcoming.length})
          </h2>
          <EventGrid events={upcoming} />
        </section>
      )}

      {past.length > 0 && (
        <section>
          <h2 className="font-display mb-4 text-lg font-semibold sm:text-xl">Already happened</h2>
          <div className="opacity-80">
            <EventGrid events={past} />
          </div>
        </section>
      )}
    </div>
  );
}

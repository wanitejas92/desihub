import type { Metadata } from 'next';
import { OrganiserCard } from '@/components/organiser-card';
import { EmptyState } from '@/components/empty-state';
import { getAccountRepository } from '@/lib/account/session';
import { getRepository } from '@/lib/data';

export const metadata: Metadata = { title: 'Organisers you follow' };

export default async function FollowingPage() {
  const account = await getAccountRepository();
  const ids = account ? await account.listFollowedOrganiserIds() : [];
  const organisers = ids.length > 0 ? await (await getRepository()).organisersByIds(ids) : [];

  if (organisers.length === 0) {
    return (
      <EmptyState
        title="Not following anyone yet"
        description="Follow an organiser and their events will be easy to find here."
        action={{ href: '/browse', label: 'Browse events' }}
      />
    );
  }

  return (
    <ul role="list" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {organisers
        .slice()
        .sort((a, b) => a.name.localeCompare(b.name))
        .map((organiser) => (
          <li key={organiser.id}>
            <OrganiserCard
              id={organiser.id}
              name={organiser.name}
              slug={organiser.slug}
              verified={organiser.verified}
              city={organiser.city}
              showFollow
            />
          </li>
        ))}
    </ul>
  );
}

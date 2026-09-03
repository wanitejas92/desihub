import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { isPast } from '@desihub/shared';
import { getRepository } from '@/lib/data';
import { EventGrid } from '@/components/event-grid';
import { EmptyState } from '@/components/empty-state';
import { FollowButton } from '@/components/follow-button';

export const revalidate = 3600;

export async function generateStaticParams() {
  const repo = await getRepository();
  const slugs = await repo.listOrganiserSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const repo = await getRepository();
  const org = await repo.getOrganiserBySlug(slug);
  if (!org) return { title: 'Organiser not found' };
  return {
    title: org.name,
    description: org.bio ?? `Events by ${org.name} on DesiHub.`,
    alternates: { canonical: `/o/${org.slug}` },
  };
}

export default async function OrganiserPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const repo = await getRepository();
  const org = await repo.getOrganiserBySlug(slug);
  if (!org) notFound();

  const upcoming = org.events.filter((e) => !isPast(e.ends_at ?? e.starts_at));
  const past = org.events.filter((e) => isPast(e.ends_at ?? e.starts_at));

  return (
    <div className="max-w-content mx-auto px-4 py-8 sm:px-6">
      <header className="border-border flex flex-col gap-4 border-b pb-8 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <span
            aria-hidden
            className="rounded-pill bg-accent-subtle font-display text-accent flex h-16 w-16 shrink-0 items-center justify-center text-2xl font-semibold"
          >
            {org.name.charAt(0)}
          </span>
          <div>
            <h1 className="font-display text-2xl font-semibold sm:text-3xl">
              {org.name}
              {org.verified && (
                <span className="text-accent ml-2 align-middle" title="Verified organiser">
                  ✓
                </span>
              )}
            </h1>
            {org.city && <p className="text-fg-muted">{org.city}</p>}
            <p className="text-fg-muted mt-1 text-sm">
              <span className="text-fg font-semibold">{org.events.length}</span>{' '}
              {org.events.length === 1 ? 'event' : 'events'} listed
            </p>
          </div>
        </div>
        <FollowButton organiserSlug={org.slug} organiserName={org.name} />
      </header>

      {org.bio && <p className="text-fg mt-6 max-w-prose">{org.bio}</p>}

      <section className="mt-10">
        <h2 className="font-display text-xl font-semibold sm:text-2xl">Upcoming events</h2>
        <div className="mt-4">
          {upcoming.length > 0 ? (
            <EventGrid events={upcoming} />
          ) : (
            <EmptyState
              title="No upcoming events"
              description={`${org.name} hasn't listed an upcoming event yet. Follow them to be the first to know.`}
            />
          )}
        </div>
      </section>

      {past.length > 0 && (
        <section className="mt-12">
          <h2 className="font-display text-xl font-semibold sm:text-2xl">Past events</h2>
          <div className="mt-4 opacity-90">
            <EventGrid events={past} />
          </div>
        </section>
      )}
    </div>
  );
}

import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { ProfileForm } from '@/components/profile-form';
import { getCurrentUser } from '@/lib/account/session';
import { hasSupabase } from '@/lib/data';

export const metadata: Metadata = { title: 'Your profile' };

export default async function AccountPage() {
  const user = await getCurrentUser();
  if (!user) redirect('/sign-in?next=/account');

  return (
    <div className="max-w-2xl">
      {!hasSupabase() && (
        <p className="bg-accent-subtle text-fg mb-4 rounded-md px-4 py-3 text-sm">
          <strong className="font-semibold">Demo account.</strong> This build has no Supabase
          backend configured, so your profile, saves and follows live in the server’s memory and
          disappear when it restarts.
        </p>
      )}
      <ProfileForm user={user} />
    </div>
  );
}

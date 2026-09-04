'use client';

import { useActionState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { CITIES, EVENT_LANGUAGES, type AccountUser } from '@desihub/shared';
import { updateProfileAction, type ProfileState } from '@/lib/account/actions';
import { Button } from './ui/button';

const initial: ProfileState = { status: 'idle' };

/**
 * The profile is entirely optional — every field can stay empty. City and
 * languages exist to make recommendations better, not to gate anything, so
 * nothing here is marked required.
 */
export function ProfileForm({ user }: { user: AccountUser }) {
  const router = useRouter();
  const [state, action, pending] = useActionState(updateProfileAction, initial);

  useEffect(() => {
    if (state.status === 'success') {
      const timer = setTimeout(() => router.push('/'), 1000);
      return () => clearTimeout(timer);
    }
  }, [state.status, router]);

  return (
    <form
      action={action}
      className="border-border bg-surface shadow-elevation rounded-lg border p-5 sm:p-6"
    >
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="name" className="text-fg block text-sm font-semibold">
            Name
          </label>
          <input
            id="name"
            name="name"
            type="text"
            defaultValue={user.name ?? ''}
            placeholder="How should we greet you?"
            className="input mt-2 w-full"
          />
          {state.fieldErrors?.name && (
            <p className="text-error mt-1 text-sm">{state.fieldErrors.name}</p>
          )}
        </div>

        <div>
          <label htmlFor="city" className="text-fg block text-sm font-semibold">
            Your city
          </label>
          <select
            id="city"
            name="city"
            defaultValue={user.city ?? ''}
            className="border-border bg-surface text-fg mt-2 h-12 w-full rounded-md border px-3 text-sm"
          >
            <option value="">No city set</option>
            {CITIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
      </div>

      <fieldset className="mt-5">
        <legend className="text-fg text-sm font-semibold">Languages you follow events in</legend>
        <div className="mt-2 flex flex-wrap gap-2">
          {EVENT_LANGUAGES.map((language) => (
            <label
              key={language}
              className="rounded-pill border-border text-fg-muted has-[:checked]:border-accent has-[:checked]:bg-accent-subtle has-[:checked]:text-fg cursor-pointer border px-3 py-1.5 text-sm"
            >
              <input
                type="checkbox"
                name="languages"
                value={language}
                defaultChecked={user.languages.includes(language)}
                className="sr-only"
              />
              {language}
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset className="mt-5">
        <legend className="text-fg text-sm font-semibold">How we can reach you</legend>
        <div className="mt-2 space-y-2">
          <Toggle name="notifyEmail" label="Email" defaultChecked={user.notificationPrefs.email} />
          <Toggle
            name="notifyPush"
            label="Push notifications"
            defaultChecked={user.notificationPrefs.push}
          />
          <Toggle
            name="notifyWhatsapp"
            label="WhatsApp"
            defaultChecked={user.notificationPrefs.whatsapp}
          />
        </div>
      </fieldset>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <Button type="submit" disabled={pending}>
          {pending ? 'Saving…' : 'Save profile'}
        </Button>
        {state.status === 'success' && <p className="text-success text-sm">{state.message}</p>}
        {state.status === 'error' && <p className="text-error text-sm">{state.message}</p>}
      </div>
    </form>
  );
}

function Toggle({
  name,
  label,
  defaultChecked,
}: {
  name: string;
  label: string;
  defaultChecked: boolean;
}) {
  return (
    <label className="text-fg flex items-center gap-2.5 text-sm">
      <input type="checkbox" name={name} defaultChecked={defaultChecked} className="h-4 w-4" />
      {label}
    </label>
  );
}

'use client';

import { useActionState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  CITIES,
  EVENT_CATEGORIES,
  EVENT_CATEGORY_LABELS,
  EVENT_LANGUAGES,
  type AccountUser,
} from '@desihub/shared';
import { updateProfileAction, type ProfileState } from '@/lib/account/actions';
import { Button } from './ui/button';

const initial: ProfileState = { status: 'idle' };

/**
 * The profile is entirely optional — every field can stay empty. City,
 * interests and languages exist to make recommendations and the email
 * digest better, not to gate anything, so nothing here is required.
 *
 * Only one notification channel is offered (email): it is the one DesiHub
 * can actually deliver to with just an address on file. Earlier builds also
 * offered push and WhatsApp toggles with no delivery mechanism behind
 * either — no service-worker subscription, no phone number collected
 * anywhere — so switching them on did nothing. A toggle that cannot do what
 * it claims is worse than not offering it.
 */
export function ProfileForm({ user }: { user: AccountUser }) {
  const router = useRouter();
  const [state, action, pending] = useActionState(updateProfileAction, initial);

  useEffect(() => {
    if (state.status === 'success') {
      const timer = setTimeout(() => router.push('/'), 900);
      return () => clearTimeout(timer);
    }
  }, [state.status, router]);

  return (
    <form
      action={action}
      className="border-border bg-surface shadow-elevation rounded-lg border p-5 sm:p-6"
    >
      <p className="text-fg-muted text-sm">
        A few optional details that make DesiHub feel like it&rsquo;s actually paying attention —
        the right city, the events you care about, one email when something matches.
      </p>

      <div className="border-border mt-6 grid gap-5 border-t pt-6 sm:grid-cols-2">
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

      <fieldset className="border-border mt-6 border-t pt-6">
        <legend className="text-fg text-sm font-semibold">What are you into?</legend>
        <p className="text-fg-subtle mt-1 text-xs">
          Shapes what shows up first on the homepage and in your email digest.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {EVENT_CATEGORIES.map((category) => (
            <label
              key={category}
              className="rounded-pill border-border text-fg-muted has-[:checked]:border-accent has-[:checked]:bg-accent-subtle has-[:checked]:text-fg cursor-pointer border px-3 py-1.5 text-sm"
            >
              <input
                type="checkbox"
                name="interests"
                value={category}
                defaultChecked={user.interests.includes(category)}
                className="sr-only"
              />
              {EVENT_CATEGORY_LABELS[category]}
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset className="border-border mt-6 border-t pt-6">
        <legend className="text-fg text-sm font-semibold">Languages you follow events in</legend>
        <div className="mt-3 flex flex-wrap gap-2">
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

      <fieldset className="border-border mt-6 border-t pt-6">
        <legend className="text-fg text-sm font-semibold">Email digest</legend>
        <label className="text-fg mt-3 flex items-start gap-2.5 text-sm">
          <input
            type="checkbox"
            name="notifyEmail"
            defaultChecked={user.notificationPrefs.email}
            className="mt-0.5 h-4 w-4"
          />
          <span>
            Email me when a new event matches my interests
            <span className="text-fg-subtle block text-xs">Sent to {user.email}</span>
          </span>
        </label>
      </fieldset>

      <div className="border-border mt-6 flex flex-wrap items-center gap-3 border-t pt-6">
        <Button type="submit" disabled={pending}>
          {pending ? 'Saving…' : 'Save profile'}
        </Button>
        {state.status === 'success' && <p className="text-success text-sm">{state.message}</p>}
        {state.status === 'error' && <p className="text-error text-sm">{state.message}</p>}
      </div>
    </form>
  );
}

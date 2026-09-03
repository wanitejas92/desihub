'use client';

import { useActionState, useState } from 'react';
import { CITIES, EVENT_CATEGORIES, EVENT_CATEGORY_LABELS } from '@desihub/shared';
import { subscribeAction, type ActionState } from '@/lib/actions';
import { Button } from './ui/button';

const initial: ActionState = { status: 'idle' };

/**
 * Email capture that converts: one field at a time. Email first; city and
 * interests are revealed only after a valid email, so the first ask is trivial.
 */
export function EmailCapture() {
  const [state, action, pending] = useActionState(subscribeAction, initial);
  const [email, setEmail] = useState('');
  const [showMore, setShowMore] = useState(false);

  if (state.status === 'success') {
    return (
      <div className="bg-success-bg rounded-md p-6 text-center">
        <p className="font-display text-fg text-xl font-semibold">{state.message}</p>
      </div>
    );
  }

  return (
    <form action={action} className="space-y-4">
      <div>
        <label htmlFor="sub-email" className="block text-sm font-semibold">
          Get events you&apos;ll actually want to go to
        </label>
        <div className="mt-2 flex flex-col gap-2 sm:flex-row">
          <input
            id="sub-email"
            name="email"
            type="email"
            required
            inputMode="email"
            autoComplete="email"
            placeholder="you@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onBlur={() => setShowMore(email.includes('@'))}
            aria-invalid={Boolean(state.fieldErrors?.email)}
            className="input flex-1"
          />
          <Button type="submit" disabled={pending}>
            {pending ? 'Joining…' : 'Notify me'}
          </Button>
        </div>
        {state.fieldErrors?.email && (
          <p className="text-error mt-1 text-sm">{state.fieldErrors.email}</p>
        )}
      </div>

      {(showMore || email.includes('@')) && (
        <div className="bg-bg-subtle space-y-3 rounded-md p-4">
          <div>
            <label htmlFor="sub-city" className="text-fg-muted block text-sm font-medium">
              Your city <span className="text-fg-subtle">(optional)</span>
            </label>
            <select
              id="sub-city"
              name="city"
              className="border-border bg-surface text-fg mt-1 h-11 w-full rounded-md border px-3 text-base"
            >
              <option value="">Pick a city…</option>
              {CITIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
          <fieldset>
            <legend className="text-fg-muted text-sm font-medium">
              What are you into? <span className="text-fg-subtle">(optional)</span>
            </legend>
            <div className="mt-2 flex flex-wrap gap-2">
              {EVENT_CATEGORIES.map((c) => (
                <label
                  key={c}
                  className="rounded-pill border-border text-fg-muted has-[:checked]:border-accent has-[:checked]:bg-accent-subtle has-[:checked]:text-fg cursor-pointer border px-3 py-1.5 text-sm"
                >
                  <input type="checkbox" name="interests" value={c} className="sr-only" />
                  {EVENT_CATEGORY_LABELS[c]}
                </label>
              ))}
            </div>
          </fieldset>
        </div>
      )}

      {state.status === 'error' && state.message && (
        <p className="text-error text-sm">{state.message}</p>
      )}
      <p className="text-fg-subtle text-xs">No spam. Unsubscribe anytime.</p>
    </form>
  );
}

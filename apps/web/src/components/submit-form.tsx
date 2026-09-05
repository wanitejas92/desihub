'use client';

import { useActionState, useState } from 'react';
import { CITIES, EVENT_CATEGORIES, EVENT_CATEGORY_LABELS } from '@desihub/shared';
import { submitEventAction, type ActionState } from '@/lib/actions';
import { Button } from './ui/button';
import { ImageUpload } from './image-upload';
import { EntryFields } from './event/entry-fields';
import { IconSparkle, IconChevronDown, IconChevronRight } from './ui/icons';

const initial: ActionState = { status: 'idle' };

/** Sentinel `<option>` value that swaps the city picker for a free-text input. */
const OTHER_CITY = '__other__';

/**
 * Event submission, no login required. Everything the event page actually
 * shows — title, date, city, organiser, description, highlights, terms — is
 * required up front; only venue/artwork/category/contact sit behind "Add
 * more details".
 */
export function SubmitForm({ canUpload = false }: { canUpload?: boolean }) {
  const [state, action, pending] = useActionState(submitEventAction, initial);
  const [showMore, setShowMore] = useState(false);
  const [city, setCity] = useState('');

  if (state.status === 'success') {
    return (
      <div className="border-border bg-success-bg rounded-lg border p-8 text-center">
        <IconSparkle className="text-success mx-auto" width={28} height={28} />
        <h2 className="font-display text-fg mt-3 text-2xl font-semibold">{state.message}</h2>
        <p className="text-fg-muted mt-2">
          We review every submission before it goes live — usually within a day.
        </p>
      </div>
    );
  }

  const err = (k: string) => state.fieldErrors?.[k];

  return (
    <form action={action} className="space-y-5">
      <Field label="Event title" htmlFor="title" required error={err('title')}>
        <input
          id="title"
          name="title"
          required
          maxLength={200}
          placeholder="e.g. Navratri Garba Night"
          className="input"
          aria-invalid={Boolean(err('title'))}
        />
      </Field>

      <Field label="Date & time" htmlFor="starts_at" required error={err('starts_at')}>
        <input
          id="starts_at"
          name="starts_at"
          type="datetime-local"
          required
          className="input"
          aria-invalid={Boolean(err('starts_at'))}
        />
      </Field>

      <Field label="City" htmlFor="city" required error={err('city')}>
        <select
          id="city"
          name={city === OTHER_CITY ? undefined : 'city'}
          required
          className="input"
          value={city}
          onChange={(e) => setCity(e.target.value)}
        >
          <option value="" disabled>
            Choose a city…
          </option>
          {CITIES.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
          <option value={OTHER_CITY}>Other</option>
        </select>
        {city === OTHER_CITY && (
          <input
            name="city"
            required
            maxLength={100}
            placeholder="Enter your city"
            className="input mt-2"
            aria-label="City name"
          />
        )}
      </Field>

      <Field
        label="Your / organiser name"
        htmlFor="organiser_name"
        required
        error={err('organiser_name')}
      >
        <input id="organiser_name" name="organiser_name" required className="input" />
      </Field>

      <Field label="About event" htmlFor="description" required error={err('description')}>
        <textarea
          id="description"
          name="description"
          rows={4}
          required
          className="input"
          placeholder="What can people expect?"
        />
      </Field>

      <Field label="Highlights" htmlFor="highlights" required error={err('highlights')}>
        <textarea
          id="highlights"
          name="highlights"
          rows={3}
          required
          className="input"
          placeholder={
            'One per line, e.g.\nLive DJ all night\nFree entry before 10pm\nDress code: festive'
          }
        />
      </Field>

      <Field label="Terms and conditions" htmlFor="terms" required error={err('terms')}>
        <textarea
          id="terms"
          name="terms"
          rows={3}
          required
          className="input"
          placeholder="Entry rules, refund policy, age restrictions, etc."
        />
      </Field>

      <EntryFields errors={err} />

      <button
        type="button"
        onClick={() => setShowMore((v) => !v)}
        aria-expanded={showMore}
        className="text-accent inline-flex items-center gap-1 text-sm font-semibold hover:underline"
      >
        {showMore ? (
          <IconChevronDown width={14} height={14} />
        ) : (
          <IconChevronRight width={14} height={14} />
        )}
        {showMore ? 'Hide extra details' : 'Add more details (optional)'}
      </button>

      {showMore && (
        <div className="border-border bg-bg-subtle space-y-5 rounded-md border p-4">
          <Field label="Category" htmlFor="category">
            <select id="category" name="category" className="input" defaultValue="">
              <option value="">Not sure</option>
              {EVENT_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {EVENT_CATEGORY_LABELS[c]}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Venue name" htmlFor="venue_name">
            <input id="venue_name" name="venue_name" className="input" placeholder="e.g. Melkweg" />
          </Field>
          <Field label="Event artwork" htmlFor="image_url">
            <ImageUpload canUpload={canUpload} />
          </Field>
          <Field label="Contact email" htmlFor="contact_email" error={err('contact_email')}>
            <input
              id="contact_email"
              name="contact_email"
              type="email"
              className="input"
              placeholder="So we can reach you about your event"
            />
          </Field>
        </div>
      )}

      {state.status === 'error' && state.message && (
        <p className="text-error text-sm" role="alert">
          {state.message}
        </p>
      )}

      <Button type="submit" disabled={pending} className="w-full">
        {pending ? 'Submitting…' : 'Submit event'}
      </Button>
      <p className="text-fg-subtle text-center text-xs">
        Please only upload artwork you own — we never copy posters from social media.
      </p>
    </form>
  );
}

function Field({
  label,
  htmlFor,
  required,
  error,
  children,
}: {
  label: string;
  htmlFor: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={htmlFor} className="text-fg block text-sm font-semibold">
        {label}
        {required && <span className="text-accent ml-0.5">*</span>}
      </label>
      <div className="mt-1.5">{children}</div>
      {error && (
        <p className="text-error mt-1 text-sm" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

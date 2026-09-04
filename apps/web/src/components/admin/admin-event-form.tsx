'use client';

import { useActionState, useState } from 'react';
import Link from 'next/link';
import type { ReactNode } from 'react';
import { CITIES, EVENT_CATEGORIES, EVENT_CATEGORY_LABELS } from '@desihub/shared';
import { createEventAction, type AdminActionState } from '@/lib/admin/actions';
import { ImageUpload } from '../image-upload';
import { Button } from '../ui/button';
import { IconCheckCircle } from '../ui/icons';

const initial: AdminActionState = { status: 'idle' };

/**
 * The admin fast path: an event on the site in one screen. No review step —
 * an admin filling this in *is* the review — and no organiser setup first:
 * the organiser is matched by name or created behind the scenes.
 */
export function AdminEventForm() {
  const [state, action, pending] = useActionState(createEventAction, initial);
  const [isFree, setIsFree] = useState(true);

  if (state.status === 'success') {
    return (
      <div className="border-border bg-success-bg rounded-lg border p-8 text-center">
        <IconCheckCircle className="text-success mx-auto" width={28} height={28} />
        <h2 className="font-display text-fg mt-3 text-xl font-semibold">{state.message}</h2>
        <div className="mt-4 flex flex-wrap justify-center gap-2">
          {state.slug && (
            <Button href={`/e/${state.slug}`} size="sm">
              View it
            </Button>
          )}
          <Button href="/admin/events/new" size="sm" variant="secondary">
            Add another
          </Button>
        </div>
      </div>
    );
  }

  const err = (k: string) => state.fieldErrors?.[k];

  return (
    <form action={action} className="space-y-5">
      {state.status === 'error' && state.message && (
        <p
          role="alert"
          className="border-border bg-error-bg text-error rounded-lg border p-3 text-sm"
        >
          {state.message}
        </p>
      )}

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

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Starts" htmlFor="starts_at" required error={err('starts_at')}>
          <input
            id="starts_at"
            name="starts_at"
            type="datetime-local"
            required
            className="input"
            aria-invalid={Boolean(err('starts_at'))}
          />
        </Field>
        <Field label="Ends" htmlFor="ends_at" hint="Optional">
          <input id="ends_at" name="ends_at" type="datetime-local" className="input" />
        </Field>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="City" htmlFor="city" required error={err('city')}>
          <select id="city" name="city" required className="input" defaultValue="">
            <option value="" disabled>
              Choose a city
            </option>
            {CITIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Category" htmlFor="category" required error={err('category')}>
          <select id="category" name="category" required className="input" defaultValue="">
            <option value="" disabled>
              Choose a category
            </option>
            {EVENT_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {EVENT_CATEGORY_LABELS[c]}
              </option>
            ))}
          </select>
        </Field>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field
          label="Organiser"
          htmlFor="organiser_name"
          required
          error={err('organiser_name')}
          hint="Matched by name, or created"
        >
          <input
            id="organiser_name"
            name="organiser_name"
            required
            maxLength={200}
            placeholder="e.g. Desi Nights Amsterdam"
            className="input"
            aria-invalid={Boolean(err('organiser_name'))}
          />
        </Field>
        <Field label="Venue" htmlFor="venue_name" hint="Optional">
          <input
            id="venue_name"
            name="venue_name"
            maxLength={200}
            placeholder="e.g. Paradiso"
            className="input"
          />
        </Field>
      </div>

      <Field label="Artwork" htmlFor="image_url" hint="Optional">
        <ImageUpload canUpload />
      </Field>

      <Field label="Description" htmlFor="description" hint="Optional">
        <textarea
          id="description"
          name="description"
          rows={4}
          maxLength={8000}
          placeholder="What is the night about?"
          className="input"
        />
      </Field>

      <fieldset className="border-border space-y-4 rounded-lg border p-4">
        <legend className="text-fg-muted px-1 text-xs font-semibold tracking-wide uppercase">
          Entry
        </legend>

        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            name="is_free"
            defaultChecked
            onChange={(e) => setIsFree(e.target.checked)}
            className="accent-accent h-4 w-4"
          />
          <span className="text-fg font-medium">Free entry</span>
        </label>

        {!isFree && (
          <Field label="Ticket price (€)" htmlFor="price" error={err('min_price_cents')}>
            <input
              id="price"
              name="price"
              inputMode="decimal"
              placeholder="25.00"
              className="input"
            />
          </Field>
        )}

        <Field
          label="Booking link"
          htmlFor="booking_url"
          hint="Optional"
          error={err('booking_url')}
        >
          <input
            id="booking_url"
            name="booking_url"
            type="url"
            placeholder="https://…"
            className="input"
          />
        </Field>
      </fieldset>

      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="featured" className="accent-accent h-4 w-4" />
        <span className="text-fg font-medium">Feature on the homepage</span>
      </label>

      <div className="flex flex-wrap items-center gap-3">
        <Button type="submit" disabled={pending}>
          {pending ? 'Publishing…' : 'Publish event'}
        </Button>
        <Link href="/admin/events" className="text-fg-muted hover:text-fg text-sm font-semibold">
          Cancel
        </Link>
      </div>
      <p className="text-fg-subtle text-xs">
        This goes live immediately — an admin adding an event counts as the review.
      </p>
    </form>
  );
}

function Field({
  label,
  htmlFor,
  required,
  hint,
  error,
  children,
}: {
  label: string;
  htmlFor: string;
  required?: boolean;
  hint?: string;
  error?: string;
  children: ReactNode;
}) {
  return (
    <div>
      <label
        htmlFor={htmlFor}
        className="text-fg mb-1.5 flex items-baseline gap-2 text-sm font-semibold"
      >
        {label}
        {required && <span className="text-error">*</span>}
        {hint && <span className="text-fg-subtle text-xs font-normal">{hint}</span>}
      </label>
      {children}
      {error && (
        <p role="alert" className="text-error mt-1 text-xs">
          {error}
        </p>
      )}
    </div>
  );
}

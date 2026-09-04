'use client';

import { useActionState } from 'react';
import { createBannerAction, type AdminActionState } from '@/lib/admin/actions';
import { Button } from '../ui/button';
import { IconCheckCircle } from '../ui/icons';

const initial: AdminActionState = { status: 'idle' };

export function BannerForm() {
  const [state, action, pending] = useActionState(createBannerAction, initial);

  if (state.status === 'success') {
    return (
      <div className="border-border bg-success-bg rounded-lg border p-8 text-center">
        <IconCheckCircle className="text-success mx-auto" width={28} height={28} />
        <h2 className="font-display text-fg mt-3 text-xl font-semibold">{state.message}</h2>
        <div className="mt-4">
          <Button href="/admin/banners" size="sm">
            Back to banners
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

      <div>
        <label htmlFor="title" className="text-fg block text-sm font-semibold">
          Banner title
        </label>
        <input
          id="title"
          name="title"
          required
          maxLength={200}
          placeholder="e.g. Summer Garba Nights"
          className="input mt-2 w-full"
          aria-invalid={Boolean(err('title'))}
        />
        {err('title') && <p className="text-error mt-1 text-sm">{err('title')}</p>}
      </div>

      <div>
        <label htmlFor="image_url" className="text-fg block text-sm font-semibold">
          Image URL
        </label>
        <input
          id="image_url"
          name="image_url"
          type="url"
          required
          placeholder="https://..."
          className="input mt-2 w-full"
          aria-invalid={Boolean(err('image_url'))}
        />
        {err('image_url') && <p className="text-error mt-1 text-sm">{err('image_url')}</p>}
        <p className="text-fg-subtle mt-1 text-xs">Upload image to Supabase Storage first</p>
      </div>

      <div>
        <label htmlFor="event_link" className="text-fg block text-sm font-semibold">
          Event link (optional)
        </label>
        <input
          id="event_link"
          name="event_link"
          type="url"
          placeholder="https://desihub.nl/e/event-slug"
          className="input mt-2 w-full"
          aria-invalid={Boolean(err('event_link'))}
        />
        {err('event_link') && <p className="text-error mt-1 text-sm">{err('event_link')}</p>}
        <p className="text-fg-subtle mt-1 text-xs">
          Where clicking the banner should take users. Leave empty for non-clickable banner.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <Button type="submit" disabled={pending}>
          {pending ? 'Creating...' : 'Create banner'}
        </Button>
        <Button href="/admin/banners" variant="secondary">
          Cancel
        </Button>
      </div>
    </form>
  );
}

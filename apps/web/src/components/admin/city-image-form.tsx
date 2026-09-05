'use client';

import { useActionState } from 'react';
import type { City } from '@desihub/shared';
import {
  setCityImageAction,
  clearCityImageAction,
  type AdminActionState,
} from '@/lib/admin/actions';
import { ImageUpload } from '../image-upload';
import { Button } from '../ui/button';

const initial: AdminActionState = { status: 'idle' };

/** One row per city — set or replace its cover photo, or clear it back to the gradient tile. */
export function CityImageForm({ city, imageUrl }: { city: City; imageUrl: string | null }) {
  const [state, action, pending] = useActionState(setCityImageAction, initial);

  return (
    <div className="border-border flex flex-col gap-4 rounded-lg border p-4 sm:flex-row sm:items-start">
      <div className="w-24 shrink-0">
        <p className="text-fg mb-2 text-sm font-semibold">{city}</p>
        <form action={clearCityImageAction}>
          <input type="hidden" name="city" value={city} />
          {imageUrl && (
            <button
              type="submit"
              className="text-fg-muted hover:text-error text-xs font-semibold transition-colors"
            >
              Remove photo
            </button>
          )}
        </form>
      </div>

      <form action={action} className="flex-1">
        <input type="hidden" name="city" value={city} />
        <ImageUpload
          name="image_url"
          defaultValue={imageUrl}
          canUpload
          bucket="city-images"
          label={`Upload ${city} cover photo`}
        />
        {state.status === 'error' && <p className="text-error mt-1.5 text-xs">{state.message}</p>}
        {state.status === 'success' && (
          <p className="text-success mt-1.5 text-xs">{state.message}</p>
        )}
        <Button type="submit" size="sm" disabled={pending} className="mt-3">
          {pending ? 'Saving…' : 'Save'}
        </Button>
      </form>
    </div>
  );
}

'use client';

import { useRef, useState } from 'react';
import { createClient } from '@/lib/supabase/browser';
import { IconSparkle, IconAlertCircle } from './ui/icons';

const MAX_BYTES = 5 * 1024 * 1024; // matches the bucket's file_size_limit
const ACCEPTED = ['image/webp', 'image/jpeg', 'image/png'];

interface Props {
  /** Form field carrying the resulting URL. */
  name?: string;
  defaultValue?: string | null;
  /**
   * False when nobody is signed in. Storage requires a JWT, so the control
   * falls back to pasting a URL rather than showing a button that cannot work.
   */
  canUpload: boolean;
}

/**
 * Artwork picker for the event forms. Uploads straight to the `event-images`
 * bucket and writes the resulting public URL into a hidden input, so the
 * enclosing form still submits as a plain FormData post with no client state
 * to thread through.
 */
export function ImageUpload({ name = 'image_url', defaultValue = null, canUpload }: Props) {
  const [url, setUrl] = useState<string | null>(defaultValue);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function upload(file: File) {
    setError(null);

    if (!ACCEPTED.includes(file.type)) {
      setError('Use a JPG, PNG or WebP.');
      return;
    }
    if (file.size > MAX_BYTES) {
      setError(`That is ${(file.size / 1024 / 1024).toFixed(1)}MB — the limit is 5MB.`);
      return;
    }

    const db = createClient();
    if (!db) {
      setError('Uploads are unavailable in this environment.');
      return;
    }

    setBusy(true);
    try {
      const { data: auth } = await db.auth.getUser();
      if (!auth.user) {
        setError('Your session expired. Sign in again to upload.');
        return;
      }

      const ext = file.name.split('.').pop()?.toLowerCase() ?? 'jpg';
      // Keyed by uploader so a bucket listing stays attributable, and by a
      // random id so two people uploading `poster.jpg` never collide.
      const path = `${auth.user.id}/${crypto.randomUUID()}.${ext}`;

      const { error: upErr } = await db.storage
        .from('event-images')
        .upload(path, file, { cacheControl: '31536000', upsert: false });
      if (upErr) {
        setError(upErr.message);
        return;
      }

      const { data } = db.storage.from('event-images').getPublicUrl(path);
      setUrl(data.publicUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed. Try again.');
    } finally {
      setBusy(false);
    }
  }

  if (!canUpload) {
    return (
      <div>
        <input
          name={name}
          type="url"
          defaultValue={defaultValue ?? ''}
          placeholder="https://… link to the poster"
          className="input"
        />
        <p className="text-fg-subtle mt-1.5 text-xs">
          Sign in to upload artwork from your device instead.
        </p>
      </div>
    );
  }

  return (
    <div>
      <input type="hidden" name={name} value={url ?? ''} />

      {url ? (
        <div className="flex items-start gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element -- just-uploaded blob at an arbitrary Storage URL */}
          <img
            src={url}
            alt="Event artwork preview"
            className="border-border h-28 w-28 rounded-md border object-cover"
          />
          <div className="flex flex-col gap-1.5">
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="text-accent text-xs font-semibold hover:underline"
            >
              Replace
            </button>
            <button
              type="button"
              onClick={() => setUrl(null)}
              className="text-fg-muted hover:text-error text-xs font-semibold transition-colors"
            >
              Remove
            </button>
          </div>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={busy}
          className="border-border hover:border-accent hover:bg-accent-subtle/40 text-fg-muted flex w-full flex-col items-center justify-center gap-1.5 rounded-lg border border-dashed px-4 py-7 transition-colors disabled:cursor-not-allowed disabled:opacity-60"
        >
          <IconSparkle width={20} height={20} className="text-accent" />
          <span className="text-fg text-sm font-semibold">
            {busy ? 'Uploading…' : 'Upload artwork'}
          </span>
          <span className="text-xs">JPG, PNG or WebP · up to 5MB</span>
        </button>
      )}

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED.join(',')}
        className="sr-only"
        onChange={(e) => {
          const file = e.target.files?.[0];
          // Reset so re-picking the same file still fires a change event.
          e.target.value = '';
          if (file) void upload(file);
        }}
      />

      {error && (
        <p role="alert" className="text-error mt-1.5 flex items-center gap-1 text-xs">
          <IconAlertCircle width={13} height={13} />
          {error}
        </p>
      )}
    </div>
  );
}

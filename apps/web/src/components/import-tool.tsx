'use client';

import { useState } from 'react';
import {
  CITIES,
  EVENT_CATEGORIES,
  EVENT_CATEGORY_LABELS,
  formatMoney,
  type ImportExtraction,
} from '@desihub/shared';
import { extractEventFromText } from '@/lib/import/extract';

const SAMPLE = `Navratri Garba Night 2026
Saturday, 11 October 2026 at 18:30
De Meervaart, Amsterdam
Tickets €12 - €20. Live dhol and orchestra!
https://facebook.com/events/123456`;

function confBadge(conf: number | undefined) {
  const c = conf ?? 0;
  if (c >= 0.75) return { label: 'high', cls: 'bg-success-bg text-success' };
  if (c >= 0.5) return { label: 'medium', cls: 'bg-warn-bg text-warn' };
  if (c > 0) return { label: 'low', cls: 'bg-error-bg text-error' };
  return { label: 'not found', cls: 'bg-bg-sunken text-fg-subtle' };
}

/**
 * Paste a Facebook / Instagram / Eventbrite blob; extract the text fields into a
 * reviewable draft. Images are never imported — the organiser uploads their own
 * or we render a fallback card.
 */
export function ImportTool() {
  const [text, setText] = useState('');
  const [result, setResult] = useState<ImportExtraction | null>(null);

  function run() {
    setResult(extractEventFromText(text));
  }

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div>
        <label htmlFor="import-src" className="block text-sm font-semibold">
          Paste event text or a link
        </label>
        <textarea
          id="import-src"
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={12}
          placeholder="Paste a Facebook event, Instagram caption, or Eventbrite listing…"
          className="input mt-2 font-mono text-sm"
        />
        <div className="mt-3 flex gap-2">
          <button
            type="button"
            onClick={run}
            disabled={!text.trim()}
            className="bg-accent text-accent-fg hover:bg-accent-hover h-11 rounded-md px-5 text-sm font-semibold disabled:opacity-60"
          >
            Extract fields
          </button>
          <button
            type="button"
            onClick={() => setText(SAMPLE)}
            className="border-border text-fg hover:bg-surface-hover h-11 rounded-md border px-5 text-sm font-semibold"
          >
            Use sample
          </button>
        </div>
        <p className="bg-warn-bg text-warn mt-3 rounded-md px-3 py-2 text-xs">
          Text only. We never copy images or posters from third-party sites.
        </p>
      </div>

      <div>
        <h2 className="text-sm font-semibold">Extracted draft (review before saving)</h2>
        {!result ? (
          <p className="border-border text-fg-muted mt-2 rounded-md border border-dashed p-6 text-sm">
            Nothing extracted yet. Paste some text and press “Extract fields”.
          </p>
        ) : (
          <dl className="divide-border border-border mt-2 divide-y rounded-md border">
            <Row label="Title" conf={result.confidence.title}>
              {result.title ?? <em className="text-fg-subtle">—</em>}
            </Row>
            <Row label="Date & time" conf={result.confidence.starts_at}>
              {result.starts_at ? (
                new Date(result.starts_at).toLocaleString('en-NL', {
                  timeZone: 'Europe/Amsterdam',
                })
              ) : (
                <em className="text-fg-subtle">—</em>
              )}
            </Row>
            <Row label="City" conf={result.confidence.city}>
              {result.city ?? <em className="text-fg-subtle">—</em>}
            </Row>
            <Row label="Category" conf={result.confidence.category}>
              {result.category ? (
                EVENT_CATEGORY_LABELS[result.category]
              ) : (
                <em className="text-fg-subtle">—</em>
              )}
            </Row>
            <Row label="Price" conf={result.confidence.price}>
              {result.is_free
                ? 'Free'
                : result.min_price_cents != null
                  ? `${formatMoney(result.min_price_cents)}${
                      result.max_price_cents && result.max_price_cents !== result.min_price_cents
                        ? ` – ${formatMoney(result.max_price_cents)}`
                        : ''
                    }`
                  : '—'}
            </Row>
            <Row label="Source">
              {result.source_url ? (
                <span className="text-accent text-sm break-all">{result.source_url}</span>
              ) : (
                <em className="text-fg-subtle">—</em>
              )}
            </Row>
          </dl>
        )}
        {result && (
          <>
            {/* Guardrails: reference the vocabularies the review UI would map to. */}
            <p className="sr-only">
              {CITIES.join(', ')} · {EVENT_CATEGORIES.join(', ')}
            </p>
            <p className="text-fg-subtle mt-4 text-xs">
              In production this becomes a pre-filled draft event for an editor to confirm and
              publish. Low-confidence fields are flagged for review.
            </p>
          </>
        )}
      </div>
    </div>
  );
}

function Row({
  label,
  conf,
  children,
}: {
  label: string;
  conf?: number;
  children: React.ReactNode;
}) {
  const badge = conf !== undefined ? confBadge(conf) : null;
  return (
    <div className="flex items-center justify-between gap-3 px-4 py-3">
      <dt className="text-fg-muted text-sm font-medium">{label}</dt>
      <dd className="text-fg flex items-center gap-2 text-right text-sm font-medium">
        <span>{children}</span>
        {badge && (
          <span className={`rounded-pill px-2 py-0.5 text-[10px] font-semibold ${badge.cls}`}>
            {badge.label}
          </span>
        )}
      </dd>
    </div>
  );
}

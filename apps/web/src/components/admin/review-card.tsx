'use client';

import { useState } from 'react';
import Link from 'next/link';
import { formatEventDateCompact } from '@desihub/shared';
import type { ReviewEvent } from '@/lib/admin/types';
import { approveEventAction, rejectEventAction, returnToQueueAction } from '@/lib/admin/actions';
import { Button } from '../ui/button';
import { IconCheckCircle, IconAlertCircle, IconEye } from '../ui/icons';

/**
 * One submission, with the decision attached. Reject asks for a reason before
 * it will fire: the note is the only thing the organiser gets back, so an
 * empty one turns a rejection into a silent disappearance.
 */
export function ReviewCard({ event }: { event: ReviewEvent }) {
  const [rejecting, setRejecting] = useState(false);
  const pending = event.status === 'draft';

  return (
    <li className="border-border rounded-lg border p-4">
      <div className="flex gap-4">
        {event.image_url ? (
          // eslint-disable-next-line @next/next/no-img-element -- organiser-supplied artwork
          <img
            src={event.image_url}
            alt=""
            className="border-border h-20 w-20 shrink-0 rounded-md border object-cover"
          />
        ) : (
          <span
            aria-hidden
            className="border-border text-fg-subtle flex h-20 w-20 shrink-0 items-center justify-center rounded-md border border-dashed text-[10px]"
          >
            No image
          </span>
        )}

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <h3 className="font-display text-fg text-base font-semibold">{event.title}</h3>
            <StatusPill status={event.status} />
          </div>

          <p className="text-fg-muted mt-0.5 text-xs">
            {event.organiser_name}
            {event.venue_name ? ` · ${event.venue_name}` : ''}
            {event.city ? ` · ${event.city}` : ''}
            {' · '}
            {formatEventDateCompact(event.starts_at)}
          </p>

          {event.description && (
            <p className="text-fg-muted mt-2 line-clamp-2 text-sm">{event.description}</p>
          )}

          {event.review_note && (
            <p className="text-fg-muted border-border mt-2 border-l-2 pl-2 text-xs italic">
              Note to organiser: {event.review_note}
            </p>
          )}

          <div className="mt-3 flex flex-wrap items-center gap-2">
            {pending ? (
              <>
                <form action={approveEventAction}>
                  <input type="hidden" name="event_id" value={event.id} />
                  <Button type="submit" size="sm">
                    <IconCheckCircle width={14} height={14} />
                    Approve &amp; publish
                  </Button>
                </form>
                <Button
                  type="button"
                  size="sm"
                  variant="secondary"
                  onClick={() => setRejecting((v) => !v)}
                  aria-expanded={rejecting}
                >
                  <IconAlertCircle width={14} height={14} />
                  Turn down
                </Button>
              </>
            ) : (
              <form action={returnToQueueAction}>
                <input type="hidden" name="event_id" value={event.id} />
                <Button type="submit" size="sm" variant="secondary">
                  Put back in the queue
                </Button>
              </form>
            )}

            <Link
              href={`/e/${event.slug}`}
              className="text-fg-muted hover:text-accent inline-flex items-center gap-1 text-xs font-semibold transition-colors"
            >
              <IconEye width={13} height={13} />
              Preview
            </Link>
          </div>

          {rejecting && (
            <form action={rejectEventAction} className="mt-3 flex flex-col gap-2 sm:flex-row">
              <input type="hidden" name="event_id" value={event.id} />
              <input
                name="review_note"
                required
                maxLength={500}
                placeholder="Why? The organiser sees this."
                className="input flex-1 text-sm"
              />
              <Button type="submit" size="sm" variant="secondary">
                Send &amp; turn down
              </Button>
            </form>
          )}
        </div>
      </div>
    </li>
  );
}

function StatusPill({ status }: { status: ReviewEvent['status'] }) {
  const tone =
    status === 'published'
      ? 'bg-success-bg text-success'
      : status === 'rejected'
        ? 'bg-error-bg text-error'
        : 'bg-accent-subtle text-accent';
  return (
    <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase ${tone}`}>
      {status === 'draft' ? 'Awaiting review' : status}
    </span>
  );
}

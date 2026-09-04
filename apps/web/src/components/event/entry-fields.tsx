'use client';

import { useState } from 'react';
import { ENTRY_TYPES, type EntryType } from '@desihub/shared';

/**
 * The one booking question we ask organisers.
 *
 * Deliberately not a ticket-type builder: for the first release DesiHub does
 * not sell tickets, so asking someone to define "VIP / Early bird / General"
 * would be collecting data we cannot act on, in exchange for the friction that
 * makes people abandon the form. A price range and the link they already have
 * is everything the event page needs.
 *
 * When DesiHub ticketing arrives, this grows a fifth option — the answers
 * already collected keep working unchanged.
 */
const OPTIONS: { value: EntryType; label: string; hint: string }[] = [
  { value: 'free', label: 'Free — no registration', hint: 'People can just turn up.' },
  {
    value: 'registration',
    label: 'Free — registration required',
    hint: 'Free, but you want names in advance.',
  },
  {
    value: 'paid',
    label: 'Paid — booked on your website',
    hint: "We'll show the price and send people to your booking page.",
  },
  { value: 'door', label: 'Pay at the door', hint: 'Cash or card on the night.' },
];

export function EntryFields({ errors }: { errors?: (key: string) => string | undefined }) {
  const [entry, setEntry] = useState<EntryType>('free');
  const err = errors ?? (() => undefined);

  const needsUrl = entry === 'paid' || entry === 'registration';
  const needsPrice = entry === 'paid' || entry === 'door';

  return (
    <fieldset>
      <legend className="text-fg block text-sm font-semibold">
        How can people attend this event?
      </legend>

      <div className="mt-2 space-y-2">
        {OPTIONS.map((o) => (
          <label
            key={o.value}
            className={`flex cursor-pointer items-start gap-3 rounded-md border p-3 transition-colors ${
              entry === o.value
                ? 'border-accent bg-accent-subtle'
                : 'border-border hover:bg-bg-subtle'
            }`}
          >
            <input
              type="radio"
              name="entry_type"
              value={o.value}
              checked={entry === o.value}
              onChange={() => setEntry(o.value)}
              className="mt-0.5"
            />
            <span>
              <span className="text-fg block text-sm font-semibold">{o.label}</span>
              <span className="text-fg-muted block text-xs">{o.hint}</span>
            </span>
          </label>
        ))}
      </div>

      {needsPrice && (
        <div className="mt-4 grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="min_price" className="text-fg block text-sm font-semibold">
              {entry === 'door' ? 'Price at the door' : 'Lowest price'}
            </label>
            <div className="mt-1.5 flex items-center gap-2">
              <span className="text-fg-muted">€</span>
              <input
                id="min_price"
                name="min_price"
                type="number"
                min={0}
                step="0.50"
                inputMode="decimal"
                className="input"
                placeholder="15"
              />
            </div>
          </div>
          {entry === 'paid' && (
            <div>
              <label htmlFor="max_price" className="text-fg block text-sm font-semibold">
                Highest price
              </label>
              <div className="mt-1.5 flex items-center gap-2">
                <span className="text-fg-muted">€</span>
                <input
                  id="max_price"
                  name="max_price"
                  type="number"
                  min={0}
                  step="0.50"
                  inputMode="decimal"
                  className="input"
                  placeholder="35"
                />
              </div>
              {err('max_price_cents') && (
                <p className="text-error mt-1 text-sm" role="alert">
                  {err('max_price_cents')}
                </p>
              )}
            </div>
          )}
        </div>
      )}

      {needsUrl && (
        <div className="mt-4">
          <label htmlFor="booking_url" className="text-fg block text-sm font-semibold">
            {entry === 'paid' ? 'Booking link' : 'Registration link'}
            {entry === 'paid' && <span className="text-accent ml-0.5">*</span>}
          </label>
          <input
            id="booking_url"
            name="booking_url"
            type="url"
            className="input mt-1.5"
            placeholder="https://your-site.nl/tickets"
          />
          <p className="text-fg-subtle mt-1 text-xs">
            We show your event and price, then send people here to book. DesiHub doesn&apos;t take
            payments.
          </p>
          {err('booking_url') && (
            <p className="text-error mt-1 text-sm" role="alert">
              {err('booking_url')}
            </p>
          )}
        </div>
      )}
    </fieldset>
  );
}

export { ENTRY_TYPES };

import type { Metadata } from 'next';
import { Button } from '@/components/ui/button';

export const metadata: Metadata = {
  title: 'Contact',
  description: 'Get in touch with DesiHub — for organisers, attendees and press.',
};

const ROUTES = [
  {
    heading: 'Listing an event',
    body: 'Submit it yourself in a couple of minutes — it is free, and we review every listing before it goes live.',
    action: { href: '/submit', label: 'List your event' },
  },
  {
    heading: 'A problem with your ticket',
    body: 'Your tickets live in your account, with the code you show at the door. Check there first — most questions answer themselves.',
    action: { href: '/account/tickets', label: 'My tickets' },
  },
  {
    heading: 'Anything else',
    body: 'Email hello@desihub.nl and a person will read it.',
    action: null,
  },
] as const;

export default function ContactPage() {
  return (
    <div className="max-w-content mx-auto px-4 py-12 sm:px-6">
      <div className="max-w-2xl">
        <h1 className="font-display text-fg text-3xl font-bold sm:text-4xl">Contact</h1>
        <p className="text-fg-muted mt-4 text-lg">
          Start with whichever of these fits — it is the fastest route to an answer.
        </p>

        <ul role="list" className="mt-8 space-y-4">
          {ROUTES.map(({ heading, body, action }) => (
            <li
              key={heading}
              className="border-border bg-surface shadow-elevation rounded-xl border p-5"
            >
              <h2 className="font-display text-fg text-lg font-semibold">{heading}</h2>
              <p className="text-fg-muted mt-1.5 text-sm">{body}</p>
              {action && (
                <Button href={action.href} variant="outline" size="sm" className="mt-4">
                  {action.label}
                </Button>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

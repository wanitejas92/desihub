import type { Metadata } from 'next';
import { Button } from '@/components/ui/button';

export const metadata: Metadata = {
  title: 'About',
  description:
    'DesiHub brings every South Asian event in the Netherlands into one place — concerts, parties, dance, festivals and cultural nights.',
};

export default function AboutPage() {
  return (
    <div className="max-w-content mx-auto px-4 py-12 sm:px-6">
      <div className="max-w-2xl">
        <h1 className="font-display text-fg text-3xl font-bold sm:text-4xl">About DesiHub</h1>
        <p className="text-fg-muted mt-5 text-lg">
          Desi events in the Netherlands live in a dozen places at once — a WhatsApp group, an
          Instagram story, a poster in a shop window, a Facebook event someone forgot to make
          public. DesiHub puts them in one place.
        </p>
        <p className="text-fg-muted mt-4">
          Concerts, Bollywood nights, Garba and Dandiya, Diwali and Holi, temple events, comedy and
          live performances — across Amsterdam, Rotterdam, Den Haag, Utrecht, Eindhoven and beyond.
          Browsing is free and needs no account. Saving an event and following an organiser work
          signed out too, and follow you into your account the first time you sign in.
        </p>
        <p className="text-fg-muted mt-4">
          Organisers list events for free. We never scrape artwork or listings we don&apos;t have
          the rights to — every event here was submitted or verified.
        </p>

        <div className="mt-8 flex flex-wrap gap-3">
          <Button href="/browse">Explore events</Button>
          <Button href="/submit" variant="outline">
            List your event
          </Button>
        </div>
      </div>
    </div>
  );
}

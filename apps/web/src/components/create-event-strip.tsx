import Link from 'next/link';
import { IconMegaphone } from './ui/icons';

/**
 * The thin banner strip right under the category nav — a second, much
 * quieter "list your event" prompt than the full mid-page CTA banner
 * further down. Full-bleed (not `max-w-content`-boxed) so it reads as a
 * site-wide announcement, not a content block.
 */
export function CreateEventStrip() {
  return (
    <div
      className="text-center"
      style={{ backgroundImage: 'linear-gradient(90deg, #FF8A00, #F0446F, #7B35D6)' }}
    >
      <p className="max-w-content mx-auto flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-white sm:px-6">
        <IconMegaphone width={15} height={15} className="shrink-0" />
        <span>Do you want to create an event on our platform?</span>
        <Link href="/submit" className="font-bold underline underline-offset-2">
          Create Event
        </Link>
      </p>
    </div>
  );
}

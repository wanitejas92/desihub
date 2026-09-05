import Link from 'next/link';
import { IconMegaphone } from './ui/icons';

/**
 * The thin banner strip right under the category nav — a second, much
 * quieter "list your event" prompt than the full mid-page CTA banner
 * further down. Full-bleed (not `max-w-content`-boxed) so it reads as a
 * site-wide announcement, not a content block.
 *
 * It used to be the full orange→pink→purple gradient at full width, which
 * made a secondary prompt the loudest object above the fold — louder than
 * the events, and louder than any actual button. A hairline rule and one
 * accent-coloured link say the same thing without outranking the content.
 */
export function CreateEventStrip() {
  return (
    <div className="border-border bg-bg-subtle border-b text-center">
      <p className="max-w-content text-fg-muted mx-auto flex items-center justify-center gap-2 px-4 py-2.5 text-sm sm:px-6">
        <IconMegaphone width={15} height={15} className="text-fg-subtle shrink-0" />
        <span>Running an event of your own?</span>
        <Link
          href="/submit"
          className="text-accent font-semibold underline-offset-4 hover:underline"
        >
          List it free
        </Link>
      </p>
    </div>
  );
}

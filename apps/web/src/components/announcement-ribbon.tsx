import Link from 'next/link';
import { IconMegaphone } from './ui/icons';

/** Promo strip under the header — a soft tint accent, not a saturated gradient block. */
export function AnnouncementRibbon() {
  return (
    <div className="bg-accent-subtle border-border text-fg flex items-center justify-center gap-1.5 border-b py-2 text-center text-sm font-medium">
      <IconMegaphone className="text-accent shrink-0" width={16} height={16} />
      Running a Desi event?{' '}
      <Link href="/submit" className="text-accent font-semibold underline underline-offset-2">
        List it on DesiHub
      </Link>
    </div>
  );
}

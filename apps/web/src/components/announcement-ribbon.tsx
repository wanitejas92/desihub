import Link from 'next/link';
import { IconMegaphone } from './ui/icons';

/** Promo ribbon under the header, pointing organisers at the submit flow — one of the brief's few sanctioned full-gradient brand moments. */
export function AnnouncementRibbon() {
  return (
    <div
      className="flex items-center justify-center gap-1.5 py-2 text-center text-sm font-medium text-white"
      style={{ background: 'linear-gradient(90deg, #FF8A00, #F0446F, #7B35D6)' }}
    >
      <IconMegaphone className="shrink-0 opacity-90" width={16} height={16} />
      Running a Desi event?{' '}
      <Link href="/submit" className="font-semibold underline underline-offset-2">
        List it on DesiHub
      </Link>
    </div>
  );
}

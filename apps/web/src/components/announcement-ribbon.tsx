import Link from 'next/link';

/** DesiPass-style promo ribbon under the header, pointing organisers at the submit flow. */
export function AnnouncementRibbon() {
  return (
    <div
      className="py-2 text-center text-sm text-white"
      style={{ background: 'linear-gradient(90deg, #F0812A, #D6338C, #7B3FA0)' }}
    >
      <span aria-hidden>🧩</span> Running a Desi event?{' '}
      <Link href="/submit" className="font-semibold underline underline-offset-2">
        List it on DesiHub
      </Link>
    </div>
  );
}

/**
 * Floating WhatsApp contact button — renders only when a real number is
 * configured (`NEXT_PUBLIC_WHATSAPP_NUMBER`), same reasoning as the footer's
 * social icons: a floating button that opens to nothing is worse than no
 * button. Nothing today ships with a fake number.
 */
export function WhatsAppFloat() {
  const number = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER;
  if (!number) return null;

  return (
    <a
      href={`https://wa.me/${number.replace(/[^\d]/g, '')}`}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with us on WhatsApp"
      // bottom-20 (not -4), at every size: the event detail page has its own
      // full-width fixed price/booking bar at the true bottom regardless of
      // viewport, and this button is global (rendered in the root layout) so
      // it has no way to know which page it's on to vary the offset.
      className="fixed right-4 bottom-20 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg transition-transform hover:scale-105"
    >
      <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
        <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.39 1.26 4.81L2 22l5.42-1.42a9.87 9.87 0 0 0 4.62 1.18h.01c5.46 0 9.9-4.45 9.9-9.91C21.95 6.45 17.5 2 12.04 2Zm5.8 14a3.06 3.06 0 0 1-2.14 1.53c-.57.12-1.31.22-3.8-.81-3.18-1.32-5.24-4.55-5.4-4.76-.16-.21-1.29-1.72-1.29-3.28s.81-2.32 1.1-2.64c.28-.31.62-.39.83-.39.21 0 .42 0 .6.01.19.01.45-.07.7.54.27.65.91 2.24.99 2.4.08.16.13.35.03.56-.11.21-.16.34-.31.52-.16.19-.33.42-.47.56-.16.16-.32.33-.14.64.19.31.83 1.37 1.78 2.22 1.22 1.09 2.25 1.43 2.56 1.59.31.16.49.13.67-.08.19-.21.79-.92 1-1.24.21-.31.42-.26.7-.16.28.11 1.79.85 2.1 1 .31.16.51.24.59.37.08.13.08.75-.16 1.44Z" />
      </svg>
    </a>
  );
}

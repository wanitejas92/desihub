import Link from 'next/link';
import { Logo } from './logo';
import { EmailCapture } from './email-capture';
import { IconInstagram, IconFacebook, IconYoutube, IconTiktok } from './ui/icons';

/**
 * Social handles are read from env rather than hard-coded: an icon that
 * links nowhere is worse than no icon, so each one renders only when its
 * URL is actually configured.
 */
const SOCIALS = [
  { href: process.env.NEXT_PUBLIC_INSTAGRAM_URL, label: 'Instagram', Icon: IconInstagram },
  { href: process.env.NEXT_PUBLIC_FACEBOOK_URL, label: 'Facebook', Icon: IconFacebook },
  { href: process.env.NEXT_PUBLIC_YOUTUBE_URL, label: 'YouTube', Icon: IconYoutube },
  { href: process.env.NEXT_PUBLIC_TIKTOK_URL, label: 'TikTok', Icon: IconTiktok },
].filter((s): s is { href: string; label: string; Icon: typeof IconInstagram } => Boolean(s.href));

const COLUMNS = [
  {
    heading: 'DesiHub',
    links: [
      { href: '/browse', label: 'Events' },
      { href: '/#categories', label: 'Categories' },
      { href: '/#venues', label: 'Venues' },
      { href: '/#organisers', label: 'Organisers' },
    ],
  },
  {
    heading: 'Company',
    links: [
      { href: '/about', label: 'About us' },
      { href: '/contact', label: 'Contact' },
      { href: '/submit', label: 'List your event' },
    ],
  },
  {
    heading: 'Support',
    links: [
      { href: '/contact', label: 'Help centre' },
      { href: '/account', label: 'Your account' },
      { href: '/account/tickets', label: 'My tickets' },
    ],
  },
] as const;

export function SiteFooter() {
  return (
    <footer className="border-border bg-bg-subtle mt-16 border-t">
      <div className="max-w-content mx-auto grid gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[1.4fr_repeat(3,0.8fr)]">
        <div>
          <Logo />
          <p className="text-fg-muted mt-3 max-w-xs text-sm">
            Events. Concerts. Dance. Parties. Culture.
            <br />
            All in one place.
          </p>

          {SOCIALS.length > 0 && (
            <ul role="list" className="mt-4 flex items-center gap-2">
              {SOCIALS.map(({ href, label, Icon }) => (
                <li key={label}>
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={label}
                    className="border-border text-fg-muted hover:border-accent hover:text-accent flex h-9 w-9 items-center justify-center rounded-full border transition-colors"
                  >
                    <Icon width={17} height={17} />
                  </a>
                </li>
              ))}
            </ul>
          )}

          <div className="mt-6 max-w-sm">
            <EmailCapture />
          </div>
        </div>

        {COLUMNS.map(({ heading, links }) => (
          <nav key={heading} aria-label={heading}>
            <h2 className="text-fg text-sm font-bold">{heading}</h2>
            <ul className="text-fg-muted mt-3 space-y-2 text-sm">
              {links.map(({ href, label }) => (
                <li key={label}>
                  <Link href={href} className="hover:text-fg">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>

      <div className="border-border border-t">
        <div className="max-w-content mx-auto flex flex-col items-center gap-2 px-4 py-5 text-xs sm:flex-row sm:justify-between sm:px-6">
          <p className="text-fg-subtle">
            © {new Date().getFullYear()} DesiHub. All Rights Reserved.
          </p>
          <p className="text-fg-subtle">
            Made with <span aria-hidden>❤️</span> for the Desi Community in the Netherlands
          </p>
        </div>
      </div>
    </footer>
  );
}

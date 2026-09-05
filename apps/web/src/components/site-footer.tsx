import Link from 'next/link';
import { Logo } from './logo';
import { EmailCapture } from './email-capture';
import {
  IconInstagram,
  IconFacebook,
  IconYoutube,
  IconTiktok,
  IconAppStore,
  IconGooglePlay,
  IconArrowRight,
} from './ui/icons';

/**
 * The four spots always show, on request — a placeholder that leads
 * nowhere yet (rendered as a disabled button, not a link) beats hiding the
 * row entirely while these are being set up. Each one goes live the moment
 * its env var is set, with no further code change: real socials wire
 * through `NEXT_PUBLIC_*_URL`, and the app store links will do the same
 * once DesiHub's apps actually ship.
 */
const SOCIALS = [
  { href: process.env.NEXT_PUBLIC_FACEBOOK_URL, label: 'Facebook', Icon: IconFacebook },
  { href: process.env.NEXT_PUBLIC_INSTAGRAM_URL, label: 'Instagram', Icon: IconInstagram },
  {
    href: process.env.NEXT_PUBLIC_APP_STORE_URL,
    label: 'Download on the App Store',
    Icon: IconAppStore,
  },
  {
    href: process.env.NEXT_PUBLIC_GOOGLE_PLAY_URL,
    label: 'Get it on Google Play',
    Icon: IconGooglePlay,
  },
];

/** Env-gated the old way — hidden until configured, unlike the four above. */
const EXTRA_SOCIALS = [
  { href: process.env.NEXT_PUBLIC_YOUTUBE_URL, label: 'YouTube', Icon: IconYoutube },
  { href: process.env.NEXT_PUBLIC_TIKTOK_URL, label: 'TikTok', Icon: IconTiktok },
].filter((s): s is { href: string; label: string; Icon: typeof IconYoutube } => Boolean(s.href));

/**
 * One flat row, not three headed columns — the header nav was removed in
 * favour of this footer being the site's real navigation, so everything
 * still needs to be here, just without the visual weight of a full
 * multi-column site-map treatment. "Help centre" and "Contact" used to be
 * two separate links to the same /contact page; kept one.
 */
const LINKS = [
  { href: '/browse', label: 'Events' },
  { href: '/browse', label: 'Categories' },
  { href: '/#organisers', label: 'Organisers' },
  { href: '/about', label: 'About' },
  { href: '/contact', label: 'Contact' },
  { href: '/account', label: 'Your account' },
  { href: '/account/tickets', label: 'My tickets' },
] as const;

export function SiteFooter() {
  return (
    <footer className="border-border bg-bg-subtle mt-16 border-t">
      <div className="max-w-content mx-auto px-4 py-8 sm:px-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <Logo />

          <div className="flex items-center gap-4">
            <Link
              href="/submit"
              className="text-accent inline-flex items-center gap-1 text-sm font-semibold hover:underline"
            >
              Create event
              <IconArrowRight width={14} height={14} />
            </Link>

            <ul role="list" className="flex items-center gap-2">
              {[...SOCIALS, ...EXTRA_SOCIALS].map(({ href, label, Icon }) =>
                href ? (
                  <li key={label}>
                    <a
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={label}
                      className="border-border text-fg-muted hover:border-accent hover:text-accent flex h-9 w-9 items-center justify-center rounded-full border transition-colors"
                    >
                      <Icon width={16} height={16} />
                    </a>
                  </li>
                ) : (
                  <li key={label}>
                    <button
                      type="button"
                      disabled
                      aria-label={`${label} — coming soon`}
                      className="border-border text-fg-subtle flex h-9 w-9 cursor-not-allowed items-center justify-center rounded-full border opacity-60"
                    >
                      <Icon width={16} height={16} />
                    </button>
                  </li>
                ),
              )}
            </ul>
          </div>
        </div>

        <nav aria-label="Footer" className="border-border mt-6 border-t pt-6">
          <ul role="list" className="text-fg-muted flex flex-wrap gap-x-5 gap-y-2 text-sm">
            {LINKS.map(({ href, label }) => (
              <li key={label}>
                <Link href={href} className="hover:text-fg">
                  {label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="mt-6 max-w-sm">
          <EmailCapture />
        </div>
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

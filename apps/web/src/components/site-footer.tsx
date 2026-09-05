import type { CSSProperties } from 'react';
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
 * These two always show, on request — a placeholder that leads nowhere yet
 * (a disabled button, not a link) beats hiding the row entirely while
 * they're being set up. Each goes live the moment its env var is set, with
 * no further code change.
 */
const SOCIALS = [
  { href: process.env.NEXT_PUBLIC_FACEBOOK_URL, label: 'Facebook', Icon: IconFacebook },
  { href: process.env.NEXT_PUBLIC_INSTAGRAM_URL, label: 'Instagram', Icon: IconInstagram },
];

/** Env-gated the old way — hidden until configured, unlike the two above. */
const EXTRA_SOCIALS = [
  { href: process.env.NEXT_PUBLIC_YOUTUBE_URL, label: 'YouTube', Icon: IconYoutube },
  { href: process.env.NEXT_PUBLIC_TIKTOK_URL, label: 'TikTok', Icon: IconTiktok },
].filter((s): s is { href: string; label: string; Icon: typeof IconYoutube } => Boolean(s.href));

/**
 * Store badges, not bare icons — an "App Store" icon alone doesn't read as
 * a download link the way the familiar two-line badge shape does. Same
 * "disabled until the env var is set" treatment as the socials above; the
 * apps themselves haven't shipped yet, so these stay inert placeholders.
 */
const APP_BADGES = [
  {
    href: process.env.NEXT_PUBLIC_APP_STORE_URL,
    label: 'Download on the App Store',
    Icon: IconAppStore,
    eyebrow: 'Download on the',
    name: 'App Store',
  },
  {
    href: process.env.NEXT_PUBLIC_GOOGLE_PLAY_URL,
    label: 'Get it on Google Play',
    Icon: IconGooglePlay,
    eyebrow: 'GET IT ON',
    name: 'Google Play',
  },
];

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

/**
 * Dark, on request — everywhere else on DesiHub is deliberately light-only
 * (see the ui-tokens preset comment), so rather than touch that sitewide
 * decision this scopes a dark palette to just the footer by overriding the
 * same CSS variables every `bg-*`/`text-*`/`border-*` utility already reads
 * from. Every child (including `EmailCapture`, built with zero knowledge of
 * this) repaints correctly with no changes of its own.
 */
const DARK_FOOTER_VARS = {
  '--color-bg': '#12142A',
  '--color-bg-subtle': '#1B1E3D',
  '--color-surface': '#20234A',
  '--color-border': 'rgba(255,255,255,0.16)',
  '--color-border-strong': 'rgba(255,255,255,0.28)',
  '--color-fg': '#FFFFFF',
  '--color-fg-muted': '#A6A9C4',
  '--color-fg-subtle': '#7D80A0',
  '--color-accent-subtle': 'rgba(255,138,0,0.22)',
} as CSSProperties;

export function SiteFooter() {
  return (
    <footer className="bg-bg text-fg mt-16" style={DARK_FOOTER_VARS}>
      <div className="max-w-content mx-auto px-4 py-8 sm:px-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <Logo inverted />

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

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <p className="text-fg-subtle text-xs font-semibold tracking-wide uppercase">
            Get the app
          </p>
          {APP_BADGES.map(({ href, label, Icon, eyebrow, name }) =>
            href ? (
              <a
                key={name}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                // Fixed black, not the theme's `fg` token: a store badge
                // looks like a store badge on any background, dark footer
                // included, so it stays decoupled from the surrounding scope.
                className="flex items-center gap-2 rounded-lg border border-white/15 bg-black px-3 py-1.5 text-white transition-opacity hover:opacity-90"
              >
                <Icon width={20} height={20} />
                <span className="leading-tight">
                  <span className="block text-[9px]">{eyebrow}</span>
                  <span className="block text-sm font-semibold">{name}</span>
                </span>
              </a>
            ) : (
              <button
                key={name}
                type="button"
                disabled
                aria-label={`${label} — coming soon`}
                className="flex cursor-not-allowed items-center gap-2 rounded-lg border border-white/15 bg-black px-3 py-1.5 text-white opacity-40"
              >
                <Icon width={20} height={20} />
                <span className="leading-tight">
                  <span className="block text-[9px]">{eyebrow}</span>
                  <span className="block text-sm font-semibold">{name}</span>
                </span>
              </button>
            ),
          )}
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

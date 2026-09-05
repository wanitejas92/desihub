import type { Metadata, Viewport } from 'next';
import './globals.css';
import { SiteHeader } from '@/components/site-header';
import { ConditionalFooter } from '@/components/conditional-footer';
import { WhatsAppFloat } from '@/components/whatsapp-float';
import { AccountProvider } from '@/components/account-provider';
import { getAccountSnapshot } from '@/lib/account/session';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://desihub.nl'),
  title: {
    default: 'DesiHub — Desi events in the Netherlands',
    template: '%s · DesiHub',
  },
  description:
    'Every South Asian event in the Netherlands — concerts, Garba, Diwali, Holi, comedy, temple events and more. Find it, save it, get your ticket.',
  openGraph: {
    type: 'website',
    siteName: 'DesiHub',
    locale: 'en_NL',
  },
  robots: { index: true, follow: true },
};

/**
 * Two theme colours, so the browser chrome matches the page rather than
 * sitting as a light strip above a dark one. These are the `bg` token in
 * each theme — keep them in step with packages/ui-tokens/src/tokens.ts.
 */
export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#FAF7F2' },
    { media: '(prefers-color-scheme: dark)', color: '#12100E' },
  ],
  width: 'device-width',
  initialScale: 1,
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const { user, savedEventIds, followedOrganiserIds } = await getAccountSnapshot();

  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Fraunces:opsz,wght@9..144,500;9..144,600;9..144,700&display=swap"
        />
      </head>
      <body className="min-h-screen">
        <a
          href="#main"
          className="bg-accent text-accent-fg sr-only rounded-md px-4 py-2 focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50"
        >
          Skip to content
        </a>
        <AccountProvider
          user={user}
          savedEventIds={savedEventIds}
          followedOrganiserIds={followedOrganiserIds}
        >
          <SiteHeader user={user} />
          <main id="main">{children}</main>
          <ConditionalFooter />
          <WhatsAppFloat />
        </AccountProvider>
      </body>
    </html>
  );
}

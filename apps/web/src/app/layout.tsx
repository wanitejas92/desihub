import type { Metadata, Viewport } from 'next';
import './globals.css';
import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'https://desihub.nl'),
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

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#FAF7F2' },
    { media: '(prefers-color-scheme: dark)', color: '#0F0F0F' },
  ],
  width: 'device-width',
  initialScale: 1,
};

// Sets the theme before paint to avoid a flash. Reads a stored choice, else
// falls back to the system preference.
const themeScript = `(function(){try{var t=localStorage.getItem('desihub-theme');if(t==='dark'||t==='light'){document.documentElement.setAttribute('data-theme',t);}}catch(e){}})();`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600&family=Geist:wght@400;500;600;700&display=swap"
        />
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-screen">
        <a
          href="#main"
          className="bg-accent text-accent-fg sr-only rounded-md px-4 py-2 focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50"
        >
          Skip to content
        </a>
        <SiteHeader />
        <main id="main">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}

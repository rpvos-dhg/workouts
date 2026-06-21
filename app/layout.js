import { Bricolage_Grotesque, Inter } from 'next/font/google';
import './globals.css';
import { ServiceWorkerRegister } from './components/ServiceWorkerRegister';

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-body',
});

const bricolage = Bricolage_Grotesque({
  subsets: ['latin'],
  weight: ['400', '600', '800'],
  variable: '--font-display',
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL
  || (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'https://localhost:3000');

export const metadata = {
  metadataBase: new URL(SITE_URL),
  title: '6-Weken Plan',
  description: 'Jouw persoonlijke trainingsplan: dagplanning, logs, metingen, trends, fietsweer en reminders.',
  applicationName: '6-Weken Plan',
  manifest: '/manifest.json',
  icons: {
    icon: [
      { url: '/icon.svg', type: 'image/svg+xml' },
      { url: '/favicon.ico', sizes: 'any' },
    ],
    apple: [{ url: '/icon.png', sizes: '192x192', type: 'image/png' }],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: '6-Weken',
  },
  // Private, auth-gated app — keep it out of search indexes.
  robots: { index: false, follow: false },
  openGraph: {
    type: 'website',
    title: '6-Weken Plan',
    description: 'Persoonlijk trainingsplan met dagplanning, logs, metingen, trends en fietsweer.',
    siteName: '6-Weken Plan',
  },
  twitter: {
    card: 'summary',
    title: '6-Weken Plan',
    description: 'Persoonlijk trainingsplan met dagplanning, logs, metingen, trends en fietsweer.',
  },
  formatDetection: { telephone: false },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover', // honour env(safe-area-inset-*) on notched devices
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#003a71' },
    { media: '(prefers-color-scheme: dark)',  color: '#002050' },
  ],
};

export default function RootLayout({ children }) {
  return (
    <html lang="nl">
      <body className={`${inter.variable} ${bricolage.variable}`} style={{ fontFamily: 'var(--font-body), system-ui, sans-serif' }}>
        {children}
        <ServiceWorkerRegister />
      </body>
    </html>
  );
}

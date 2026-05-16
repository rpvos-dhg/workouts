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

export const metadata = {
  title: '6-Weken Plan',
  description: 'Jouw persoonlijke trainingsplan',
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
  formatDetection: { telephone: false },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
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

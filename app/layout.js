import { Atkinson_Hyperlegible, Sora } from 'next/font/google';
import './globals.css';

const atkinson = Atkinson_Hyperlegible({
  subsets: ['latin'],
  weight: ['400', '700'],
  variable: '--font-body',
});

const sora = Sora({
  subsets: ['latin'],
  weight: ['600', '700', '800'],
  variable: '--font-display',
});

export const metadata = {
  title: '6-Weken Plan',
  description: 'Jouw persoonlijke trainingsplan',
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/icon.png', type: 'image/png', sizes: '192x192' },
    ],
    apple: [{ url: '/icon.png', sizes: '192x192', type: 'image/png' }],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: '6-Weken',
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#006b6f',
};

export default function RootLayout({ children }) {
  return (
    <html lang="nl">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/icon.png" type="image/png" sizes="192x192" />
        <link rel="apple-touch-icon" href="/icon.png" />
      </head>
      <body className={`${atkinson.variable} ${sora.variable}`} style={{ fontFamily: 'var(--font-body), system-ui, sans-serif' }}>
        {children}
      </body>
    </html>
  );
}

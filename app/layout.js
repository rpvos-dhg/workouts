export const metadata = {
  title: '6-Weken Plan',
  description: 'Jouw persoonlijke trainingsplan',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: '6-Weken',
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#003D7A',
};

export default function RootLayout({ children }) {
  return (
    <html lang="nl">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <link rel="apple-touch-icon" href="/icon.png" />
      </head>
      <body style={{ margin: 0, padding: 0, fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif', background: '#eef2f7' }}>
        {children}
      </body>
    </html>
  );
}

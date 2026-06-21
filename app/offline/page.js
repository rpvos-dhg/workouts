import Link from 'next/link';

export const metadata = {
  title: 'Offline | 6-Weken Plan',
  robots: { index: false, follow: false },
};

export default function OfflinePage() {
  return (
    <main style={{ minHeight: '100svh', display: 'grid', placeItems: 'center', padding: '24px', color: 'var(--ink)' }}>
      <div className="info-card" style={{ maxWidth: '420px', width: '100%', padding: '28px', textAlign: 'center', borderLeft: '4px solid var(--action)' }}>
        <div className="signal-kicker signal-kicker--accent">6-Weken Plan</div>
        <h1 style={{ fontFamily: 'var(--font-display), var(--font-body), sans-serif', fontSize: 'var(--text-h1)', fontWeight: 800, margin: '8px 0 6px' }}>
          Je bent offline
        </h1>
        <p style={{ margin: '0 0 20px', color: 'var(--muted)', fontSize: 'var(--text-body)', lineHeight: 1.55 }}>
          Deze pagina staat nog niet in de offline cache. Eerder geopende schermen blijven beschikbaar.
          Maak verbinding en probeer het opnieuw.
        </p>
        <Link
          href="/"
          style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            minHeight: '44px', padding: '12px 20px', borderRadius: 'var(--radius)',
            background: 'var(--accent)', color: 'white', fontWeight: 700,
            fontSize: 'var(--text-body)', textDecoration: 'none',
          }}
        >
          Terug naar de app
        </Link>
      </div>
    </main>
  );
}

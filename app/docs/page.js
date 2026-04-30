import Link from 'next/link';

const sections = [
  {
    title: 'Dagelijks gebruik',
    items: [
      ['Vandaag', 'Toont de training van vandaag, dagdoelen, adaptief advies en de dagchecklist voor eiwit, water, kcal en post-workout eiwit.'],
      ['Week', 'Laat alle dagen van de huidige week zien met voltooi-status en snelle toegang tot dagdetails.'],
      ['Plan', 'Bundelt alle planonderdelen: dagen, hartslagzones, voeding, krachttraining en praktische tips.'],
      ['Meet', 'Legt geplande meetmomenten vast zoals gewicht, buikomtrek, slaap, rusthartslag, HRV, energie, stemming, spierpijn en honger.'],
      ['Log', 'Registreert, bewerkt, verwijdert en importeert workouts met duur, afstand, hartslag, kcal en notities.'],
      ['Inzicht', 'Visualiseert trends voor gewicht, buikomtrek, slaap, rusthartslag, fietssnelheid, hartslag en weekvoortgang.'],
    ],
  },
  {
    title: 'Slimme begeleiding',
    items: [
      ['Adaptief advies', 'Combineert checkins, gemiste trainingen, slaap, rusthartslag en recente prestaties om herstel- of trainingsadvies te tonen.'],
      ['Persoonlijke zones', 'Hartslagzones zijn instelbaar en worden gebruikt bij loganalyse en advies.'],
      ['Persoonlijke doelen', 'Kcal, eiwit, water en rusthartslag-baseline zijn instelbaar in het menu.'],
      ['Meetmomenten', 'Open meetmomenten worden uitgelicht totdat ze zijn opgeslagen.'],
    ],
  },
  {
    title: 'Import en integraties',
    items: [
      ['iOS Shortcut import', 'De app kan workouts ontvangen via een persoonlijke importtoken en een beveiligde POST endpoint.'],
      ['Duplicate detectie', 'Imports gebruiken een external id of payload hash zodat automatische imports geen dubbele logs maken.'],
      ['CSV fallback', 'HealthFit- of Apple Health-exportbestanden kunnen via de Log-tab worden geimporteerd.'],
      ['Web Push', 'Trainingen en meetmomenten kunnen om 20:00 Europe/Amsterdam een push reminder sturen als ze nog openstaan.'],
    ],
  },
  {
    title: 'Beheer en veiligheid',
    items: [
      ['Authenticatie', 'Gebruikers loggen in via Supabase Auth met wachtwoord, magic link of wachtwoordherstel.'],
      ['RLS', 'Supabase Row Level Security zorgt dat gebruikers alleen hun eigen logs, checkins, settings, habits, push subscriptions en importdata beheren.'],
      ['Server secrets', 'Service role, Web Push private key en CRON_SECRET staan alleen server-side in Vercel environment variables.'],
      ['Cron', 'Vercel Cron roept dagelijks de reminder-endpoint aan. De endpoint accepteert alleen requests met de juiste CRON_SECRET.'],
    ],
  },
];

const shortcutPayload = `{
  "source": "ios_shortcut",
  "externalId": "optional-id",
  "startedAt": "2026-05-02T20:00:00+02:00",
  "endedAt": "2026-05-02T21:00:00+02:00",
  "type": "cycling",
  "durationMin": 60,
  "distanceKm": 18.2,
  "kcal": 530,
  "avgHr": 142,
  "maxHr": 168,
  "notes": "Imported from Apple Health"
}`;

export const metadata = {
  title: 'Documentatie | 6-Weken Plan',
  description: 'Functionele documentatie voor de 6-Weken Plan workouts-app.',
};

export default function DocsPage() {
  return (
    <main style={{ minHeight: '100vh', color: 'var(--ink)' }}>
      <header className="app-header" style={{ paddingBottom: '54px' }}>
        <div style={{ width: 'min(100%, 980px)', margin: '0 auto' }}>
          <Link href="/" style={{ color: 'rgba(255,255,255,0.82)', fontSize: '13px', fontWeight: 800, textDecoration: 'none' }}>
            Terug naar app
          </Link>
          <div style={{ marginTop: '24px', fontSize: '12px', opacity: 0.86, fontWeight: 800, textTransform: 'uppercase' }}>
            6-Weken Plan
          </div>
          <h1 style={{
            margin: '6px 0 0',
            fontFamily: 'var(--font-display), var(--font-body), sans-serif',
            fontSize: 'clamp(30px, 6vw, 54px)',
            lineHeight: 1.05,
            fontWeight: 800,
            letterSpacing: 0,
          }}>
            App documentatie
          </h1>
          <p style={{ maxWidth: '720px', margin: '14px 0 0', color: 'rgba(255,255,255,0.82)', fontSize: '16px', lineHeight: 1.55 }}>
            Overzicht van alle schermen, functies, integraties en beheerinstellingen van de workouts-app.
          </p>
        </div>
      </header>

      <div style={{ width: 'min(calc(100% - 32px), 980px)', margin: '-28px auto 48px' }}>
        <section className="dashboard-strip" style={{ width: '100%', margin: 0 }}>
          <div className="signal-card">
            <div className="signal-kicker">Doel</div>
            <div className="signal-value">6 weken trainen, meten en bijsturen</div>
            <div className="signal-note">Dagplanning, logs, checkins, trends en reminders in een PWA.</div>
          </div>
          <div className="signal-card">
            <div className="signal-kicker">Data</div>
            <div className="signal-value">Supabase per gebruiker</div>
            <div className="signal-note">Alle persoonlijke data valt onder RLS en wordt per account gescheiden.</div>
          </div>
          <div className="signal-card">
            <div className="signal-kicker">Integraties</div>
            <div className="signal-value">Web Push + Health import</div>
            <div className="signal-note">Push reminders, iOS Shortcut endpoint en CSV importfallback.</div>
          </div>
        </section>

        {sections.map(section => (
          <section key={section.title} style={{ marginTop: '28px' }}>
            <SectionHeading title={section.title} />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '12px' }}>
              {section.items.map(([title, body]) => (
                <article key={title} className="info-card" style={{ background: 'var(--surface)', borderRadius: '12px', padding: '16px' }}>
                  <h2 style={{ margin: 0, fontSize: '17px', fontWeight: 800, color: 'var(--accent-strong)' }}>{title}</h2>
                  <p style={{ margin: '8px 0 0', color: 'var(--muted)', fontSize: '14px', lineHeight: 1.55 }}>{body}</p>
                </article>
              ))}
            </div>
          </section>
        ))}

        <section style={{ marginTop: '28px' }}>
          <SectionHeading title="Shortcut import payload" />
          <div className="info-card" style={{ background: 'var(--surface)', borderRadius: '12px', padding: '16px' }}>
            <p style={{ margin: '0 0 12px', color: 'var(--muted)', fontSize: '14px', lineHeight: 1.55 }}>
              De iOS Shortcut stuurt JSON naar <code>/api/import/shortcut/workout</code> met <code>Authorization: Bearer &lt;persoonlijke-token&gt;</code>.
            </p>
            <pre style={{
              margin: 0,
              overflowX: 'auto',
              borderRadius: '8px',
              background: '#082631',
              color: 'white',
              padding: '14px',
              fontSize: '13px',
              lineHeight: 1.5,
            }}>{shortcutPayload}</pre>
          </div>
        </section>

        <section style={{ marginTop: '28px' }}>
          <SectionHeading title="Operationele checklist" />
          <div className="info-card" style={{ background: 'var(--surface)', borderRadius: '12px', padding: '16px' }}>
            <ul style={{ margin: 0, paddingLeft: '20px', color: 'var(--muted)', fontSize: '14px', lineHeight: 1.7 }}>
              <li>Supabase schema is uitgevoerd via SQL Editor.</li>
              <li>Vercel Production bevat alle environment variables.</li>
              <li>Na elke env wijziging is een Production redeploy nodig.</li>
              <li>Web Push werkt pas nadat de gebruiker meldingen toestaat en de app op iOS als Home Screen web app gebruikt.</li>
            </ul>
          </div>
        </section>
      </div>
    </main>
  );
}

function SectionHeading({ title }) {
  return (
    <div style={{ margin: '0 4px 12px' }}>
      <div style={{ fontSize: '12px', fontWeight: 800, color: 'var(--accent-strong)', textTransform: 'uppercase' }}>{title}</div>
    </div>
  );
}

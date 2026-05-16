import Link from 'next/link';

const sections = [
  {
    title: 'Dagelijks gebruik',
    items: [
      ['Vandaag', 'Toont de training van vandaag, dagdoelen, adaptief advies en de dagchecklist voor eiwit, water, kcal en post-workout eiwit.'],
      ['Week', 'Laat alle dagen van de huidige week zien met voltooi-status en snelle toegang tot dagdetails.'],
      ['Plan', 'Bundelt alle planonderdelen: dagen, hartslagzones, voeding, krachttraining en praktische tips.'],
      ['Meet', 'Legt geplande meetmomenten vast: gewicht, buikomtrek, slaap, rusthartslag en HRV als getallen; energie, stemming en honger via een 1–5 schaal.'],
      ['Log', 'Registreert, bewerkt en verwijdert workouts met duur, afstand, hartslag, kcal en notities. Toont persoonlijke records (langste rit, hoogste snelheid, meeste kcal).'],
      ['Inzicht', 'Visualiseert trends voor gewicht, buikomtrek, slaap, rusthartslag, HRV, energie, stemming, fietssnelheid, hartslag en weekvoortgang.'],
    ],
  },
  {
    title: 'Slimme begeleiding',
    items: [
      ['Adaptief advies', 'Combineert checkins, gemiste trainingen, slaap, rusthartslag en recente prestaties om herstel- of trainingsadvies te tonen.'],
      ['Persoonlijke zones', 'Hartslagzones zijn instelbaar en worden gebruikt bij loganalyse. De workout-analyse in het logformulier gebruikt jouw eigen zones.'],
      ['Persoonlijke doelen', 'Kcal, eiwit, water en rusthartslag-baseline zijn instelbaar in het menu.'],
      ['Meetmomenten', 'Open meetmomenten worden uitgelicht totdat ze zijn opgeslagen.'],
    ],
  },
  {
    title: 'Extra functies',
    items: [
      ['Reminders', 'Open trainingen en meetmomenten kunnen je dagelijks een push reminder sturen rond 20:00 als er nog iets openstaat.'],
      ['Fietsweer', 'Fietsdagen tonen de beste tijdsblokken voor de komende ~16 dagen op basis van regen, wind, windvlagen, temperatuur en daglicht.'],
      ['Werkt offline', 'De app draait als installeerbare PWA op telefoon en desktop met een lokale cache voor de shell.'],
      ['Donkere modus', 'Volgt automatisch de systeemvoorkeur.'],
    ],
  },
];

const walkthroughs = [
  {
    title: 'Personalisatie stap voor stap',
    intro: 'Gebruik dit om de app beter op jouw doelen en hartslagwaarden te laten reageren.',
    steps: [
      'Open het menu rechtsboven en kies Instellingen.',
      'Vul je kcal-doel, eiwitdoel, waterdoel en rusthartslag-baseline in.',
      'Pas je hartslagzones aan als je Apple Watch of trainingstest andere zones aangeeft.',
      'Zet reminders aan of uit en kies de reminder-tijd. Standaard is 20:00.',
      'Klik Instellingen opslaan.',
      'De dagchecklist, loganalyse en adaptief advies gebruiken daarna deze persoonlijke waarden.',
    ],
  },
  {
    title: 'Reminders aanzetten',
    intro: 'Gebruik dit om herinneringen te krijgen voor open trainingen en meetmomenten.',
    steps: [
      'Open Instellingen via het menu rechtsboven.',
      'Klik op "Web Push aanzetten".',
      'Sta meldingen toe in je browser wanneer daarom gevraagd wordt.',
      'Op iPhone werkt dit alleen als de app via "Zet op beginscherm" is toegevoegd.',
      'Je ontvangt rond 20:00 een reminder als er nog een training of meetmoment openstaat.',
    ],
  },
  {
    title: 'App installeren',
    intro: 'Installeer de app als zelfstandige PWA voor sneller starten en offline shell.',
    steps: [
      'Open de app in Chrome, Edge of Safari.',
      'Op desktop: klik in de adresbalk op het installatie-icoon, of kies "App installeren" in het menu van je browser.',
      'Op iPhone: tik op het deel-icoon en kies "Zet op beginscherm".',
      'Op Android: open het browsermenu en kies "App installeren" of "Toevoegen aan startscherm".',
      'De app verschijnt nu als zelfstandig icoon op je toestel.',
    ],
  },
];

export const metadata = {
  title: 'Documentatie | 6-Weken Plan',
  description: 'Functionele documentatie voor de 6-Weken Plan workouts-app.',
};

const cardStyle = {
  background: 'var(--surface)',
  borderRadius: 'var(--radius-lg)',
  padding: '18px',
};

export default function DocsPage() {
  return (
    <main style={{ minHeight: '100vh', color: 'var(--ink)' }}>
      <header className="app-header" style={{ paddingBottom: '54px' }}>
        <div style={{ width: 'min(100%, 980px)', margin: '0 auto' }}>
          <Link href="/" style={{ color: 'rgba(255,255,255,0.82)', fontSize: '13px', fontWeight: 800, textDecoration: 'none' }}>
            ← Terug naar app
          </Link>
          <div style={{ marginTop: '24px', fontSize: '12px', opacity: 0.86, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            6-Weken Plan
          </div>
          <h1 style={{
            margin: '6px 0 0',
            fontFamily: 'var(--font-display), var(--font-body), sans-serif',
            fontSize: 'clamp(30px, 6vw, 54px)',
            lineHeight: 1.05,
            fontWeight: 800,
            letterSpacing: '-0.02em',
          }}>
            App documentatie
          </h1>
          <p style={{ maxWidth: '720px', margin: '14px 0 0', color: 'rgba(255,255,255,0.82)', fontSize: '16px', lineHeight: 1.55 }}>
            Overzicht van alle schermen, functies en hoe je de app op jouw doelen afstemt.
          </p>
        </div>
      </header>

      <div style={{ width: 'min(calc(100% - 32px), 980px)', margin: '-28px auto 48px' }}>
        <section className="dashboard-strip" style={{ width: '100%', margin: 0 }}>
          <div className="signal-card">
            <div className="signal-kicker">Doel</div>
            <div className="signal-value">6 weken trainen, meten en bijsturen</div>
            <div className="signal-note">Dagplanning, logs, checkins, trends en reminders in één app.</div>
          </div>
          <div className="signal-card">
            <div className="signal-kicker">Aanpak</div>
            <div className="signal-value">Persoonlijk en adaptief</div>
            <div className="signal-note">Je doelen, zones en metingen bepalen wat je elke dag te zien krijgt.</div>
          </div>
          <div className="signal-card">
            <div className="signal-kicker">Extra</div>
            <div className="signal-value">Reminders + fietsweer</div>
            <div className="signal-note">Push reminders voor open dagen en beste fietsmomenten per dag.</div>
          </div>
        </section>

        {sections.map(section => (
          <section key={section.title} style={{ marginTop: '28px' }}>
            <SectionHeading title={section.title} />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '12px' }}>
              {section.items.map(([title, body]) => (
                <article key={title} className="info-card" style={cardStyle}>
                  <h2 style={{ margin: 0, fontSize: '17px', fontWeight: 800, color: 'var(--accent-strong)' }}>{title}</h2>
                  <p style={{ margin: '8px 0 0', color: 'var(--muted)', fontSize: '14px', lineHeight: 1.55 }}>{body}</p>
                </article>
              ))}
            </div>
          </section>
        ))}

        <section style={{ marginTop: '28px' }}>
          <SectionHeading title="Stap voor stap" />
          <div style={{ display: 'grid', gap: '12px' }}>
            {walkthroughs.map(flow => (
              <article key={flow.title} className="info-card" style={cardStyle}>
                <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 800, color: 'var(--accent-strong)' }}>{flow.title}</h2>
                <p style={{ margin: '8px 0 12px', color: 'var(--muted)', fontSize: '14px', lineHeight: 1.55 }}>{flow.intro}</p>
                <ol style={{ margin: 0, paddingLeft: '22px', color: 'var(--muted)', fontSize: '14px', lineHeight: 1.7 }}>
                  {flow.steps.map(step => <li key={step}>{step}</li>)}
                </ol>
              </article>
            ))}
          </div>
        </section>

        <section style={{ marginTop: '28px' }}>
          <SectionHeading title="Sneltoetsen en tips" />
          <article className="info-card" style={cardStyle}>
            <ul style={{ margin: 0, paddingLeft: '20px', color: 'var(--muted)', fontSize: '14px', lineHeight: 1.7 }}>
              <li>Escape sluit elk venster en bottom-sheet.</li>
              <li>De checklist op Vandaag synchroniseert direct met je profiel.</li>
              <li>Voltooide dagen verschijnen doorgestreept en lichter in de week- en planweergave.</li>
              <li>De FAB rechtsonder opent altijd het log-formulier, ook tijdens andere taken.</li>
              <li>Tap een dag in Week of Plan om details en eventueel het fietsweer te bekijken.</li>
            </ul>
          </article>
        </section>
      </div>
    </main>
  );
}

function SectionHeading({ title }) {
  return (
    <div style={{ margin: '0 4px 12px' }}>
      <div style={{ fontSize: '12px', fontWeight: 800, color: 'var(--accent-strong)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{title}</div>
    </div>
  );
}

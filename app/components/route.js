'use client';

import { useState } from 'react';
import { Bike, Navigation } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { normalizeEmail } from '../../lib/utils';
import { InfoCard } from './ui';
import { smallActionStyle } from './styles';

const ROUTE_OWNER = 'remcopvos@gmail.com';

export function CyclingRouteCard({ day, cycleLogs, userEmail, t }) {
  const [status, setStatus] = useState('idle');
  const [routeData, setRouteData] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  if (normalizeEmail(userEmail) !== normalizeEmail(ROUTE_OWNER)) return null;

  async function generateRoute() {
    setStatus('loading');
    setErrorMsg('');

    function handleGeoError() {
      setErrorMsg('Locatietoegang geweigerd. Sta locatie toe en probeer opnieuw.');
      setStatus('error');
    }

    if (!navigator.geolocation) {
      setErrorMsg('Geolocatie niet beschikbaar in deze browser.');
      setStatus('error');
      return;
    }

    navigator.geolocation.getCurrentPosition(async ({ coords }) => {
      const { latitude: lat, longitude: lng } = coords;
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.access_token) throw new Error('Geen actieve sessie — log opnieuw in.');
        const res = await fetch('/api/cycling-route', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${session.access_token}` },
          body: JSON.stringify({
            workout: { title: day.title, dur: day.dur, hr: day.hr, speed: day.speed, target: day.target, desc: day.desc },
            cycleLogs, lat, lng,
          }),
        });
        let data;
        try { data = await res.json(); } catch { throw new Error(`Server fout (${res.status})`); }
        if (!res.ok || data.error) throw new Error(data.error || `HTTP ${res.status}`);
        setRouteData(data);
        setStatus('done');
      } catch (err) {
        setErrorMsg(err.message || 'Onbekende fout');
        setStatus('error');
      }
    }, handleGeoError);
  }

  return (
    <InfoCard style={{ borderLeft: '4px solid #003D7A' }}>
      <div className="signal-kicker" style={{ color: '#003D7A' }}>Routeadvies</div>

      {status === 'idle' && (
        <>
          <div style={{ fontSize: '13px', color: 'var(--muted)', marginTop: '6px', marginBottom: '12px', lineHeight: 1.5 }}>
            AI-afstandsschatting op basis van je training en eerdere ritten
          </div>
          <button type="button" onClick={generateRoute} style={smallActionStyle}>
            <Navigation size={16} aria-hidden="true" /> Bereken afstand
          </button>
        </>
      )}

      {status === 'loading' && (
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginTop: '10px', color: 'var(--muted)', fontSize: '14px' }}>
          <Bike size={16} aria-hidden="true" />
          Afstand wordt berekend…
        </div>
      )}

      {status === 'error' && (
        <>
          <div style={{ color: 'var(--danger)', fontSize: '13px', marginTop: '8px', lineHeight: 1.5 }}>{errorMsg}</div>
          <button type="button" onClick={generateRoute} style={{ ...smallActionStyle, marginTop: '10px' }}>
            <Navigation size={16} aria-hidden="true" /> Opnieuw proberen
          </button>
        </>
      )}

      {status === 'done' && routeData && (
        <>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', marginTop: '10px' }}>
            <span style={{ fontSize: '28px', fontWeight: 800, color: '#003D7A' }}>{routeData.estimatedKm}</span>
            <span style={{ fontSize: '14px', color: 'var(--muted)' }}>km geschat</span>
          </div>
          <div style={{ fontSize: '13px', fontWeight: 700, marginTop: '4px' }}>{routeData.routeType}</div>
          <div style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.5, marginTop: '6px' }}>{routeData.rationale}</div>

          <div style={{ marginTop: '14px' }}>
            <a href={routeData.fietsersbondUrl} target="_blank" rel="noopener noreferrer" style={{ ...smallActionStyle, textDecoration: 'none' }}>
              <Navigation size={15} aria-hidden="true" /> Plan route in Fietsersbond
            </a>
          </div>
          <button type="button" onClick={() => { setStatus('idle'); setRouteData(null); }} style={{
            marginTop: '10px', background: 'none', border: 'none', color: 'var(--muted)',
            fontSize: '12px', cursor: 'pointer', padding: '0', textDecoration: 'underline',
          }}>
            Opnieuw berekenen
          </button>
        </>
      )}
    </InfoCard>
  );
}

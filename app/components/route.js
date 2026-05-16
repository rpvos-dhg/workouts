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
      setErrorMsg(t('routeGeoDenied'));
      setStatus('error');
    }

    if (!navigator.geolocation) {
      setErrorMsg(t('routeGeoUnsupported'));
      setStatus('error');
      return;
    }

    navigator.geolocation.getCurrentPosition(async ({ coords }) => {
      const { latitude: lat, longitude: lng } = coords;
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.access_token) throw new Error(t('routeSessionGone'));
        const res = await fetch('/api/cycling-route', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${session.access_token}` },
          body: JSON.stringify({
            workout: { title: day.title, dur: day.dur, hr: day.hr, speed: day.speed, target: day.target, desc: day.desc },
            cycleLogs, lat, lng,
          }),
        });
        let data;
        try { data = await res.json(); } catch { throw new Error(`Server error (${res.status})`); }
        if (!res.ok || data.error) throw new Error(data.error || `HTTP ${res.status}`);
        setRouteData(data);
        setStatus('done');
      } catch (err) {
        setErrorMsg(err.message || t('routeServerError'));
        setStatus('error');
      }
    }, handleGeoError);
  }

  return (
    <InfoCard style={{ borderLeft: '4px solid var(--accent)' }}>
      <div className="signal-kicker" style={{ color: 'var(--accent)' }}>{t('routeAdvice')}</div>

      {status === 'idle' && (
        <>
          <div style={{ fontSize: '13px', color: 'var(--muted)', marginTop: '6px', marginBottom: '12px', lineHeight: 1.5 }}>
            {t('routeAiHelp')}
          </div>
          <button type="button" onClick={generateRoute} style={smallActionStyle}>
            <Navigation size={16} aria-hidden="true" /> {t('routeCalc')}
          </button>
        </>
      )}

      {status === 'loading' && (
        <div role="status" aria-live="polite" style={{ display: 'flex', gap: '10px', alignItems: 'center', marginTop: '10px', color: 'var(--muted)', fontSize: '14px' }}>
          <span className="spinner spinner--inline" aria-hidden="true" />
          {t('weatherCalculating')}
        </div>
      )}

      {status === 'error' && (
        <>
          <div role="alert" style={{ color: 'var(--danger)', fontSize: '13px', marginTop: '8px', lineHeight: 1.5 }}>{errorMsg}</div>
          <button type="button" onClick={generateRoute} style={{ ...smallActionStyle, marginTop: '10px' }}>
            <Navigation size={16} aria-hidden="true" /> {t('weatherRetry')}
          </button>
        </>
      )}

      {status === 'done' && routeData && (
        <>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', marginTop: '10px' }}>
            <span style={{ fontSize: '28px', fontWeight: 800, color: 'var(--accent)' }}>{routeData.estimatedKm}</span>
            <span style={{ fontSize: '14px', color: 'var(--muted)' }}>{t('routeKmEstimated')}</span>
            {routeData.expectedAvgSpeed && (
              <span style={{ fontSize: '13px', color: 'var(--muted)', marginLeft: '6px' }}>
                · ~{routeData.expectedAvgSpeed} km/u
              </span>
            )}
          </div>
          <div style={{ fontSize: '13px', fontWeight: 700, marginTop: '4px', color: 'var(--ink)' }}>{routeData.routeType}</div>
          <div style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.5, marginTop: '6px' }}>{routeData.rationale}</div>

          <div style={{ marginTop: '14px' }}>
            <a href={routeData.fietsersbondUrl} target="_blank" rel="noopener noreferrer" style={{ ...smallActionStyle, textDecoration: 'none' }}>
              <Navigation size={15} aria-hidden="true" /> {t('routePlanInBond')}
            </a>
          </div>
          <button type="button" onClick={() => { setStatus('idle'); setRouteData(null); }} style={{
            marginTop: '10px', background: 'none', border: 'none', color: 'var(--muted)',
            fontSize: '12px', cursor: 'pointer', padding: '0', textDecoration: 'underline',
          }}>
            {t('routeRecalc')}
          </button>
        </>
      )}
    </InfoCard>
  );
}

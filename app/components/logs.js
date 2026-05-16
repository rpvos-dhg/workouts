'use client';

import { useState } from 'react';
import { BarChart3, Bike, Download, Dumbbell, Edit3, Flame, Footprints, Gauge, HeartPulse, Plus, Target, Trash2 } from 'lucide-react';
import { getHeartZone } from '../../lib/insights';
import { exportLogsCSV } from '../../lib/utils';
import { InfoCard, Field, StatItem, MetricTile, SectionTitle } from './ui';
import { inputStyle, smallActionStyle, ghostButtonStyle, primaryButtonStyle } from './styles';
import { ModalShell } from './ModalShell';
import { useToast } from './Toast';

export function LogView({ logs, settings, setShowLogForm, deleteLog, onEditLog, t }) {
  const cycleLogs = logs.filter(l => l.type === 'cycle' && l.distance && l.duration);
  const avgSpeed = cycleLogs.length ? cycleLogs.reduce((s, l) => s + (l.distance / (l.duration / 60)), 0) / cycleLogs.length : 0;
  const avgHR = cycleLogs.filter(l => l.avg_hr).length ? cycleLogs.filter(l => l.avg_hr).reduce((s, l) => s + Number(l.avg_hr), 0) / cycleLogs.filter(l => l.avg_hr).length : 0;
  const longestRide = cycleLogs.length ? cycleLogs.reduce((b, l) => Number(l.distance) > Number(b?.distance ?? 0) ? l : b, null) : null;
  const fastestRide = cycleLogs.length ? cycleLogs.reduce((b, l) => {
    const s = Number(l.distance) / (Number(l.duration) / 60);
    return s > (b?.speed ?? 0) ? { ...l, speed: s } : b;
  }, null) : null;
  const mostKcal = logs.some(l => l.kcal) ? logs.reduce((b, l) => Number(l.kcal) > Number(b?.kcal ?? 0) ? l : b, null) : null;

  return (
    <div>
      <InfoCard>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap' }}>
          <div>
            <div className="signal-kicker" style={{ color: 'var(--accent-strong)' }}>{t('workoutLog')}</div>
            <div style={{ fontSize: '13px', color: 'var(--muted)' }}>{t('logSubtitle')}</div>
          </div>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {logs.length > 0 && (
              <button type="button" onClick={() => exportLogsCSV(logs)} style={{ ...smallActionStyle, background: 'var(--surface)', color: 'var(--accent)', border: '1px solid var(--line)' }}>
                <Download size={16} aria-hidden="true" /> CSV
              </button>
            )}
            <button type="button" onClick={() => setShowLogForm(true)} style={smallActionStyle}>
              <Plus size={16} aria-hidden="true" /> {t('save')}
            </button>
          </div>
        </div>
      </InfoCard>

      {logs.length > 0 && (
        <div className="premium-card" style={{ padding: '20px', borderRadius: 'var(--radius-lg)', marginBottom: '20px' }}>
          <div style={{ fontSize: '11px', opacity: 0.85, fontWeight: 800, letterSpacing: '0.1em' }}>{t('yourStats')}</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginTop: '12px' }}>
            <div><div style={{ fontSize: '12px', opacity: 0.75 }}>{t('workoutsLogged')}</div><div style={{ fontSize: '24px', fontWeight: 800 }}>{logs.length}</div></div>
            <div><div style={{ fontSize: '12px', opacity: 0.75 }}>{t('avgSpeed')}</div><div style={{ fontSize: '24px', fontWeight: 800 }}>{avgSpeed > 0 ? avgSpeed.toFixed(1) : '—'} <span style={{ fontSize: '14px', opacity: 0.7 }}>km/h</span></div></div>
            <div><div style={{ fontSize: '12px', opacity: 0.75 }}>{t('avgHr')}</div><div style={{ fontSize: '24px', fontWeight: 800 }}>{avgHR > 0 ? Math.round(avgHR) : '—'} <span style={{ fontSize: '14px', opacity: 0.7 }}>bpm</span></div></div>
            <div><div style={{ fontSize: '12px', opacity: 0.75 }}>{t('cycleRides')}</div><div style={{ fontSize: '24px', fontWeight: 800 }}>{cycleLogs.length}</div></div>
          </div>
        </div>
      )}

      {(longestRide || fastestRide || mostKcal?.kcal) && (
        <InfoCard>
          <div className="signal-kicker" style={{ color: 'var(--accent-strong)' }}>{t('personalRecords')}</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '10px', marginTop: '10px' }}>
            {longestRide && <MetricTile icon={Target} label={t('longestRide')} value={`${longestRide.distance} km`} />}
            {fastestRide && <MetricTile icon={Gauge} label={t('fastestSpeed')} value={`${fastestRide.speed.toFixed(1)} km/h`} />}
            {mostKcal?.kcal && <MetricTile icon={Flame} label={t('mostKcal')} value={`${mostKcal.kcal} kcal`} />}
          </div>
        </InfoCard>
      )}

      {logs.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--muted)' }}>
          <BarChart3 size={48} aria-hidden="true" style={{ marginBottom: '12px', color: 'var(--accent)' }} />
          <div style={{ fontSize: '17px', fontWeight: 700, marginBottom: '6px', color: 'var(--ink)' }}>{t('noWorkouts')}</div>
          <div style={{ fontSize: '14px', color: 'var(--muted-2)', marginBottom: '20px' }}>{t('noWorkoutsHelp')}</div>
        </div>
      ) : (
        <div>{logs.map(log => <LogCard key={log.id} log={log} settings={settings} deleteLog={deleteLog} onEditLog={onEditLog} t={t} />)}</div>
      )}
    </div>
  );
}

export function LogCard({ log, settings, deleteLog, onEditLog, t }) {
  const speed = log.distance && log.duration ? (log.distance / (log.duration / 60)).toFixed(1) : null;
  const zone = log.avg_hr ? getHeartZone(Number(log.avg_hr), settings) : null;
  const borderColor = log.type === 'cycle' ? 'var(--accent)' : log.type === 'strength' ? 'var(--warn)' : 'var(--success)';

  return (
    <div className="log-card" style={{ background: 'var(--surface)', borderRadius: 'var(--radius-lg)', padding: '14px', marginBottom: '10px', borderLeft: `4px solid ${borderColor}` }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: '11px', color: 'var(--muted-2)', fontWeight: 700, letterSpacing: '0.08em' }}>
            {new Date(log.date).toLocaleDateString('nl-NL', { weekday: 'short', day: 'numeric', month: 'short' }).toUpperCase()}
          </div>
          <div style={{ fontSize: '16px', fontWeight: 700, marginTop: '4px', color: 'var(--ink)' }}>
            {log.type === 'cycle' ? t('cycle') : log.type === 'strength' ? t('strength') : t('walk')} · {log.duration} min
          </div>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginTop: '8px', fontSize: '13px', color: 'var(--muted)' }}>
            {log.distance && <StatItem icon={Target} label={`${log.distance} km`} />}
            {speed && <StatItem icon={Gauge} label={`${speed} km/h`} />}
            {log.avg_hr && <StatItem icon={HeartPulse} label={`${log.avg_hr} bpm ${zone ? `(${zone})` : ''}`} />}
            {log.kcal && <StatItem icon={Flame} label={`${log.kcal} kcal`} />}
          </div>
          {log.notes && <div style={{ fontSize: '13px', color: 'var(--muted-2)', marginTop: '8px', fontStyle: 'italic' }}>"{log.notes}"</div>}
        </div>
        <div style={{ display: 'flex', gap: '4px', flexShrink: 0 }}>
          <button type="button" aria-label={t('editLog')} onClick={() => onEditLog(log)} style={iconButtonStyle}>
            <Edit3 size={16} aria-hidden="true" />
          </button>
          <button type="button" aria-label={t('deleteLog')} onClick={() => deleteLog(log.id)} style={iconButtonStyle}>
            <Trash2 size={16} aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
  );
}

const iconButtonStyle = {
  background: 'transparent',
  border: '1px solid transparent',
  color: 'var(--muted)',
  fontSize: '16px',
  cursor: 'pointer',
  padding: '0',
  width: '44px',
  height: '44px',
  minWidth: '44px',
  borderRadius: 'var(--radius)',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  transition: 'background 120ms ease, color 120ms ease',
};

export function LogForm({ onSave, onClose, todayPlan, initialLog, settings, t }) {
  const toast = useToast();
  const [form, setForm] = useState({
    date: initialLog?.date || new Date().toISOString().slice(0, 10),
    type: initialLog?.type || (todayPlan?.type === 'strength' ? 'strength' : 'cycle'),
    duration: initialLog?.duration ?? (todayPlan?.dur ? String(todayPlan.dur) : ''),
    distance: initialLog?.distance ?? '',
    avgHR: initialLog?.avg_hr ?? '',
    maxHR: initialLog?.max_hr ?? '',
    kcal: initialLog?.kcal ?? '',
    notes: initialLog?.notes || '',
  });

  const handleSubmit = () => {
    if (!form.duration) {
      toast.error(t('durationRequired'));
      return;
    }
    onSave(form);
  };

  const ZONE_SPEED_MAP = { 'Z1': '11-13', 'Z2': '14-17', 'Z3': '16-18', 'Z4': '17-20', 'Z5': '18-22' };

  let analysis = null;
  if (form.type === 'cycle' && form.distance && form.duration && form.avgHR) {
    const speed = form.distance / (form.duration / 60);
    const hr = Number(form.avgHR);
    const zone = getHeartZone(hr, settings) || 'Z2';
    const expectedSpeed = ZONE_SPEED_MAP[zone] || '14-17';
    const [low, high] = expectedSpeed.split('-').map(Number);
    let verdict = '';
    if (speed >= low && speed <= high) verdict = t('verdictPerfect');
    else if (speed > high) verdict = t('verdictStrong');
    else if (speed < low * 0.8) verdict = t('verdictSlow');
    else verdict = t('verdictSlightlyLow');
    analysis = { speed: speed.toFixed(1), zone, expectedSpeed, verdict };
  }

  return (
    <ModalShell open onClose={onClose} titleId="log-form-title" closeLabel={t('cancel')}>
      <h2 id="log-form-title" style={{ margin: '0 0 4px', fontSize: '22px', fontWeight: 800, color: 'var(--ink)' }}>{initialLog ? t('editLog') : t('workoutLog')}</h2>
      <p style={{ margin: '0 0 20px', fontSize: '13px', color: 'var(--muted)' }}>{t('logSubtitle')}</p>

      <Field label={t('date')} htmlFor="log-date">
        <input id="log-date" type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} style={inputStyle} />
      </Field>

      <Field label={t('type')}>
        <div style={{ display: 'flex', gap: '8px' }} role="radiogroup" aria-label={t('type')}>
          {[
            { key: 'cycle', label: t('cycle'), Icon: Bike },
            { key: 'strength', label: t('strength'), Icon: Dumbbell },
            { key: 'walk', label: t('walk'), Icon: Footprints },
          ].map(option => {
            const active = form.type === option.key;
            return (
              <button key={option.key} type="button" role="radio" aria-checked={active} onClick={() => setForm({ ...form, type: option.key })} style={{
                flex: 1, padding: '12px 10px', borderRadius: 'var(--radius)',
                border: active ? '2px solid var(--accent)' : '2px solid var(--line)',
                background: active ? 'var(--accent-tint)' : 'var(--surface)',
                color: active ? 'var(--accent)' : 'var(--ink)',
                fontSize: '14px', fontWeight: 700, cursor: 'pointer', minHeight: '44px',
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
              }}>
                <option.Icon size={16} aria-hidden="true" />{option.label}
              </button>
            );
          })}
        </div>
      </Field>

      <Field label={t('duration')} htmlFor="log-duration">
        <input id="log-duration" type="number" inputMode="decimal" value={form.duration} onChange={e => setForm({ ...form, duration: e.target.value })} placeholder="bijv. 45" style={inputStyle} required />
      </Field>
      {form.type === 'cycle' && (
        <Field label={t('distance')} htmlFor="log-distance">
          <input id="log-distance" type="number" inputMode="decimal" step="0.1" value={form.distance} onChange={e => setForm({ ...form, distance: e.target.value })} placeholder="bijv. 12.5" style={inputStyle} />
        </Field>
      )}
      <Field label={t('avgHrFull')} htmlFor="log-avg-hr">
        <input id="log-avg-hr" type="number" inputMode="numeric" value={form.avgHR} onChange={e => setForm({ ...form, avgHR: e.target.value })} placeholder="bijv. 142" style={inputStyle} />
      </Field>
      <Field label={t('maxHr')} htmlFor="log-max-hr">
        <input id="log-max-hr" type="number" inputMode="numeric" value={form.maxHR} onChange={e => setForm({ ...form, maxHR: e.target.value })} placeholder="bijv. 168" style={inputStyle} />
      </Field>
      <Field label={t('calories')} htmlFor="log-kcal">
        <input id="log-kcal" type="number" inputMode="numeric" value={form.kcal} onChange={e => setForm({ ...form, kcal: e.target.value })} placeholder="bijv. 380" style={inputStyle} />
      </Field>
      <Field label={t('optionalNotes')} htmlFor="log-notes">
        <textarea id="log-notes" value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} placeholder={t('workoutNotesPlaceholder')} rows={2} style={{ ...inputStyle, resize: 'vertical', fontFamily: 'inherit' }} />
      </Field>

      {analysis && (
        <div style={{ background: 'var(--info-tint)', borderRadius: 'var(--radius-lg)', padding: '14px', marginBottom: '16px', borderLeft: '4px solid var(--accent)' }}>
          <div style={{ fontSize: '11px', color: 'var(--accent)', fontWeight: 800, letterSpacing: '0.1em', marginBottom: '8px' }}>{t('analysis')}</div>
          <div style={{ fontSize: '14px', lineHeight: 1.6, color: 'var(--ink)' }}>
            {t('avgSpeed')} <strong>{analysis.speed} km/h</strong> in <strong>{analysis.zone}</strong> ({t('expected', { speed: analysis.expectedSpeed })})
            <div style={{ marginTop: '6px', color: 'var(--muted)' }}>{analysis.verdict}</div>
          </div>
        </div>
      )}

      <div style={{ display: 'flex', gap: '8px' }}>
        <button type="button" onClick={onClose} style={ghostButtonStyle}>{t('cancel')}</button>
        <button type="button" onClick={handleSubmit} style={{ ...primaryButtonStyle, flex: 2 }}>{t('save')}</button>
      </div>
    </ModalShell>
  );
}

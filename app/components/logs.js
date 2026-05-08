'use client';

import { useState } from 'react';
import { BarChart3, Bike, Download, Dumbbell, Edit3, Flame, Footprints, Gauge, HeartPulse, Plus, Target, Trash2 } from 'lucide-react';
import { getHeartZone } from '../../lib/insights';
import { exportLogsCSV } from '../../lib/utils';
import { InfoCard, Field, StatItem } from './ui';
import { inputStyle, smallActionStyle } from './styles';

export function LogView({ logs, settings, setShowLogForm, deleteLog, onEditLog, t }) {
  const cycleLogs = logs.filter(l => l.type === 'cycle' && l.distance && l.duration);
  const avgSpeed = cycleLogs.length ? cycleLogs.reduce((s, l) => s + (l.distance / (l.duration / 60)), 0) / cycleLogs.length : 0;
  const avgHR = cycleLogs.filter(l => l.avg_hr).length ? cycleLogs.filter(l => l.avg_hr).reduce((s, l) => s + Number(l.avg_hr), 0) / cycleLogs.filter(l => l.avg_hr).length : 0;

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
        <div className="premium-card" style={{ padding: '20px', borderRadius: '12px', marginBottom: '20px' }}>
          <div style={{ fontSize: '11px', opacity: 0.85, fontWeight: 700, letterSpacing: '1px' }}>{t('yourStats')}</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginTop: '12px' }}>
            <div><div style={{ fontSize: '12px', opacity: 0.75 }}>{t('workoutsLogged')}</div><div style={{ fontSize: '24px', fontWeight: 700 }}>{logs.length}</div></div>
            <div><div style={{ fontSize: '12px', opacity: 0.75 }}>{t('avgSpeed')}</div><div style={{ fontSize: '24px', fontWeight: 700 }}>{avgSpeed > 0 ? avgSpeed.toFixed(1) : '-'} <span style={{ fontSize: '14px', opacity: 0.7 }}>km/h</span></div></div>
            <div><div style={{ fontSize: '12px', opacity: 0.75 }}>{t('avgHr')}</div><div style={{ fontSize: '24px', fontWeight: 700 }}>{avgHR > 0 ? Math.round(avgHR) : '-'} <span style={{ fontSize: '14px', opacity: 0.7 }}>bpm</span></div></div>
            <div><div style={{ fontSize: '12px', opacity: 0.75 }}>{t('cycleRides')}</div><div style={{ fontSize: '24px', fontWeight: 700 }}>{cycleLogs.length}</div></div>
          </div>
        </div>
      )}

      {logs.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--muted)' }}>
          <BarChart3 size={48} aria-hidden="true" style={{ marginBottom: '12px', color: 'var(--accent)' }} />
          <div style={{ fontSize: '17px', fontWeight: 600, marginBottom: '6px' }}>{t('noWorkouts')}</div>
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

  return (
    <div className="log-card" style={{ background: 'var(--surface)', borderRadius: '12px', padding: '14px', marginBottom: '10px', borderLeft: `4px solid ${log.type === 'cycle' ? '#003D7A' : '#7A3000'}` }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '11px', color: '#888', fontWeight: 700, letterSpacing: '0.5px' }}>
            {new Date(log.date).toLocaleDateString('nl-NL', { weekday: 'short', day: 'numeric', month: 'short' }).toUpperCase()}
          </div>
          <div style={{ fontSize: '16px', fontWeight: 600, marginTop: '4px' }}>
            {log.type === 'cycle' ? t('cycle') : log.type === 'strength' ? t('strength') : t('walk')} • {log.duration} min
          </div>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginTop: '8px', fontSize: '13px', color: '#555' }}>
            {log.distance && <StatItem icon={Target} label={`${log.distance} km`} />}
            {speed && <StatItem icon={Gauge} label={`${speed} km/h`} />}
            {log.avg_hr && <StatItem icon={HeartPulse} label={`${log.avg_hr} bpm ${zone ? `(${zone})` : ''}`} />}
            {log.kcal && <StatItem icon={Flame} label={`${log.kcal} kcal`} />}
          </div>
          {log.notes && <div style={{ fontSize: '13px', color: '#666', marginTop: '8px', fontStyle: 'italic' }}>"{log.notes}"</div>}
        </div>
        <div style={{ display: 'flex', gap: '4px' }}>
          <button type="button" aria-label={t('editLog')} onClick={() => onEditLog(log)} style={{ background: 'transparent', border: 'none', color: '#666', fontSize: '16px', cursor: 'pointer', padding: '4px 8px' }}><Edit3 size={16} aria-hidden="true" /></button>
          <button type="button" aria-label={t('deleteLog')} onClick={() => deleteLog(log.id)} style={{ background: 'transparent', border: 'none', color: '#999', fontSize: '16px', cursor: 'pointer', padding: '4px 8px' }}><Trash2 size={16} aria-hidden="true" /></button>
        </div>
      </div>
    </div>
  );
}

export function LogForm({ onSave, onClose, todayPlan, initialLog, t }) {
  const [form, setForm] = useState({
    date: initialLog?.date || new Date().toISOString().slice(0, 10),
    type: initialLog?.type || (todayPlan?.type === 'strength' ? 'strength' : 'cycle'),
    duration: initialLog?.duration ?? '',
    distance: initialLog?.distance ?? '',
    avgHR: initialLog?.avg_hr ?? '',
    maxHR: initialLog?.max_hr ?? '',
    kcal: initialLog?.kcal ?? '',
    notes: initialLog?.notes || '',
  });

  const handleSubmit = () => {
    if (!form.duration) return alert(t('durationRequired'));
    onSave(form);
  };

  let analysis = null;
  if (form.type === 'cycle' && form.distance && form.duration && form.avgHR) {
    const speed = form.distance / (form.duration / 60);
    const hr = Number(form.avgHR);
    let expectedSpeed, zone;
    if (hr < 134) { zone = 'Z1'; expectedSpeed = '11-13'; }
    else if (hr < 147) { zone = 'Z2'; expectedSpeed = '14-17'; }
    else if (hr < 160) { zone = 'Z3'; expectedSpeed = '16-18'; }
    else if (hr < 173) { zone = 'Z4'; expectedSpeed = '17-20'; }
    else { zone = 'Z5'; expectedSpeed = '18-22'; }
    const [low, high] = expectedSpeed.split('-').map(Number);
    let verdict = '';
    if (speed >= low && speed <= high) verdict = t('verdictPerfect');
    else if (speed > high) verdict = t('verdictStrong');
    else if (speed < low * 0.8) verdict = t('verdictSlow');
    else verdict = t('verdictSlightlyLow');
    analysis = { speed: speed.toFixed(1), zone, expectedSpeed, verdict };
  }

  return (
    <div role="presentation" onClick={onClose} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 200, display: 'flex', alignItems: 'flex-end' }}>
      <div role="dialog" aria-modal="true" aria-labelledby="log-form-title" onClick={e => e.stopPropagation()} style={{ background: 'var(--surface)', width: '100%', maxHeight: '90vh', overflowY: 'auto', borderTopLeftRadius: '12px', borderTopRightRadius: '12px', padding: '24px' }}>
        <div style={{ width: '40px', height: '4px', background: '#ddd', borderRadius: '2px', margin: '0 auto 20px' }} />
        <h2 id="log-form-title" style={{ margin: '0 0 4px', fontSize: '22px', fontWeight: 700 }}>{initialLog ? t('editLog') : t('workoutLog')}</h2>
        <p style={{ margin: '0 0 20px', fontSize: '13px', color: 'var(--muted)' }}>{t('logSubtitle')}</p>

        <Field label={t('date')} htmlFor="log-date">
          <input id="log-date" type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} style={inputStyle} />
        </Field>

        <Field label={t('type')}>
          <div style={{ display: 'flex', gap: '8px' }}>
            {[
              { key: 'cycle', label: t('cycle'), Icon: Bike },
              { key: 'strength', label: t('strength'), Icon: Dumbbell },
              { key: 'walk', label: t('walk'), Icon: Footprints },
            ].map(option => (
              <button key={option.key} type="button" aria-pressed={form.type === option.key} onClick={() => setForm({ ...form, type: option.key })} style={{ flex: 1, padding: '10px', borderRadius: '10px', border: form.type === option.key ? '2px solid var(--accent)' : '2px solid var(--line)', background: form.type === option.key ? '#e8f4f1' : 'white', fontSize: '14px', fontWeight: 600, cursor: 'pointer' }}>
                <option.Icon size={16} aria-hidden="true" style={{ verticalAlign: '-3px', marginRight: '6px' }} />{option.label}
              </button>
            ))}
          </div>
        </Field>

        <Field label={t('duration')} htmlFor="log-duration">
          <input id="log-duration" type="number" inputMode="decimal" value={form.duration} onChange={e => setForm({ ...form, duration: e.target.value })} placeholder="bijv. 45" style={inputStyle} />
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
          <div style={{ background: '#F0F4FA', borderRadius: '12px', padding: '14px', marginBottom: '16px', borderLeft: '4px solid #003D7A' }}>
            <div style={{ fontSize: '11px', color: '#003D7A', fontWeight: 700, letterSpacing: '1px', marginBottom: '8px' }}>{t('analysis')}</div>
            <div style={{ fontSize: '14px', lineHeight: 1.6 }}>
              {t('avgSpeed')} <strong>{analysis.speed} km/h</strong> in <strong>{analysis.zone}</strong> ({t('expected', { speed: analysis.expectedSpeed })})
              <div style={{ marginTop: '6px', color: '#444' }}>{analysis.verdict}</div>
            </div>
          </div>
        )}

        <div style={{ display: 'flex', gap: '8px' }}>
          <button type="button" onClick={onClose} style={{ flex: 1, padding: '14px', borderRadius: '8px', border: '2px solid var(--line)', background: 'white', fontSize: '15px', fontWeight: 600, cursor: 'pointer' }}>{t('cancel')}</button>
          <button type="button" onClick={handleSubmit} style={{ flex: 2, padding: '14px', borderRadius: '8px', border: 'none', background: 'var(--accent)', color: 'white', fontSize: '15px', fontWeight: 600, cursor: 'pointer' }}>{t('save')}</button>
        </div>
      </div>
    </div>
  );
}

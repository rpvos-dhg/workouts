'use client';

import { useState, useEffect } from 'react';
import { Activity, CheckCircle2, Clock3 } from 'lucide-react';
import { MEASUREMENT_MOMENTS, getMeasurementMomentByDate, getMeasurementTitle, getSuggestedMeasurementMoment, isMeasurementCheckin } from '../../lib/plan-content';
import { getAlarmSignals, checkinToForm, getTodayString, formatDateShort } from '../../lib/utils';
import { getWeekOverview } from '../../lib/plan-content';
import { InfoCard, Tag, SimpleList, Field, MetricInput } from './ui';
import { inputStyle, primaryButtonStyle } from './styles';

function RatingPicker({ label, value, onChange }) {
  return (
    <div style={{ marginBottom: '14px' }}>
      <div style={{ fontSize: '13px', color: 'var(--muted)', fontWeight: 700, marginBottom: '6px' }}>{label}</div>
      <div role="radiogroup" aria-label={label} style={{ display: 'flex', gap: '6px' }}>
        {[1, 2, 3, 4, 5].map(n => {
          const active = Number(value) === n;
          return (
            <button key={n} type="button" role="radio" aria-checked={active} onClick={() => onChange(String(n))} style={{
              flex: 1, padding: '10px 0', borderRadius: 'var(--radius)', minHeight: '44px',
              border: `2px solid ${active ? 'var(--accent)' : 'var(--line)'}`,
              background: active ? 'var(--accent)' : 'var(--surface-2)',
              color: active ? 'white' : 'var(--muted)',
              fontSize: '15px', fontWeight: 800, cursor: 'pointer',
            }}>{n}</button>
          );
        })}
      </div>
    </div>
  );
}

export function CheckInView({ checkins, onSave, currentWeek, dueMeasurement, selectedMeasurementDate, t }) {
  const today = getTodayString();
  const selectedMoment = selectedMeasurementDate ? getMeasurementMomentByDate(selectedMeasurementDate) : null;
  const suggestedMoment = selectedMoment || dueMeasurement || getSuggestedMeasurementMoment(checkins, today);
  const [date, setDate] = useState(suggestedMoment.date);
  const current = checkins.find(item => item.date === date);
  const currentMoment = getMeasurementMomentByDate(date) || suggestedMoment;
  const savedMomentDates = new Set(checkins.map(item => item.date));
  const [form, setForm] = useState(() => checkinToForm(current, date));
  const [message, setMessage] = useState('');
  const [notificationStatus, setNotificationStatus] = useState('unsupported');

  useEffect(() => { if (selectedMeasurementDate) setDate(selectedMeasurementDate); }, [selectedMeasurementDate]);
  useEffect(() => { setForm(checkinToForm(current, date)); }, [current, date]);
  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) setNotificationStatus(Notification.permission);
  }, []);

  const alarms = getAlarmSignals(form, t);
  const selectedWeek = currentMoment.week || currentWeek;
  const overview = getWeekOverview(selectedWeek);
  const advice = alarms.length >= 2 ? (selectedWeek === 6 ? t('adviceWeek6') : t('adviceBackOff')) : t('adviceOk');
  const update = (key, value) => setForm({ ...form, [key]: value });

  const enableNotifications = async () => {
    if (typeof window === 'undefined' || !('Notification' in window)) { setMessage(t('notificationUnsupported')); return; }
    const permission = await Notification.requestPermission();
    setNotificationStatus(permission);
    setMessage(permission === 'granted' ? t('notificationOn') : t('notificationOff'));
  };

  const submit = async (e) => {
    e.preventDefault();
    const { error } = await onSave(form);
    setMessage(error ? error.message : t('measurementSaved'));
  };

  return (
    <div className="dashboard-grid">
      <div>
        <InfoCard className="hero-card" style={{ borderLeft: `4px solid ${alarms.length >= 2 ? 'var(--danger)' : 'var(--success)'}` }}>
          <div className="signal-kicker signal-kicker--accent">{t('plannedMeasurements')}</div>
          <div style={{ fontFamily: 'var(--font-display), var(--font-body), sans-serif', fontSize: '24px', fontWeight: 800, marginTop: '6px' }}>{t('alarmSignals', { count: alarms.length })}</div>
          <div style={{ fontSize: '13px', color: 'var(--muted)', marginTop: '6px', lineHeight: 1.5 }}>{advice}</div>
          <div style={{ fontSize: '12px', color: 'var(--muted-2)', marginTop: '8px' }}>{t('weekGoal', { kcal: overview.kcal })}</div>
          {notificationStatus !== 'granted' && (
            <button type="button" onClick={enableNotifications} style={{ marginTop: '12px', border: '1px solid var(--line)', background: 'var(--surface-3)', color: 'var(--accent-strong)', borderRadius: 'var(--radius)', padding: '10px 14px', fontSize: '13px', fontWeight: 700, cursor: 'pointer', minHeight: '44px' }}>
              {t('enableMeasurementNotification')}
            </button>
          )}
        </InfoCard>

        {alarms.length > 0 && (
          <InfoCard>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {alarms.map(alarm => <Tag key={alarm} icon={Activity} label={alarm} bg="var(--danger-tint)" color="var(--danger)" />)}
            </div>
          </InfoCard>
        )}

        <form onSubmit={submit}>
          <InfoCard>
            <div style={{ marginBottom: '14px' }}>
              <div className="signal-kicker signal-kicker--accent">{currentMoment.title}</div>
              <div style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.5 }}>{currentMoment.focus}</div>
            </div>
            <SimpleList items={currentMoment.items} />
            {currentMoment.photoReminder && (
              <div style={{ margin: '10px 0 4px', padding: '10px 12px', borderRadius: 'var(--radius)', background: 'var(--warn-tint)', color: 'var(--warn)', fontSize: '13px', fontWeight: 700, borderLeft: '3px solid var(--warn)' }}>
                {t('photo')}: {currentMoment.photoReminder}
              </div>
            )}
            <div style={{ height: '12px' }} />
            <MetricInput label={t('weight')} value={form.weightKg} onChange={v => update('weightKg', v)} placeholder="bijv. 88.4" />
            <MetricInput label={t('waist')} value={form.waistCm} onChange={v => update('waistCm', v)} placeholder="bijv. 96" />
            <MetricInput label={t('sleep')} value={form.sleepHours} onChange={v => update('sleepHours', v)} placeholder="bijv. 7.5" />
            <MetricInput label={t('restingHr')} value={form.restingHr} onChange={v => update('restingHr', v)} placeholder="bijv. 56" />
            <MetricInput label="HRV" value={form.hrv} onChange={v => update('hrv', v)} placeholder="optioneel" />
            <RatingPicker label={t('energy')} value={form.energyLevel} onChange={v => update('energyLevel', v)} />
            <RatingPicker label={t('mood')} value={form.moodLevel} onChange={v => update('moodLevel', v)} />
            <MetricInput label={t('soreness')} value={form.sorenessHours} onChange={v => update('sorenessHours', v)} placeholder="bijv. 24" />
            <RatingPicker label={t('hunger')} value={form.hungerLevel} onChange={v => update('hungerLevel', v)} />
            <label style={{ display: 'flex', gap: '10px', alignItems: 'center', fontSize: '13px', color: 'var(--muted)', margin: '10px 0 14px', cursor: 'pointer' }}>
              <input type="checkbox" checked={form.hrvLowSignal} onChange={e => update('hrvLowSignal', e.target.checked)} style={{ width: '18px', height: '18px', accentColor: 'var(--accent)' }} />
              {t('hrvLow')}
            </label>
            <Field label={t('notes')} htmlFor="measurement-notes">
              <textarea id="measurement-notes" value={form.notes} onChange={e => update('notes', e.target.value)} rows={3} placeholder={t('howFeel')} style={{ ...inputStyle, resize: 'vertical', fontFamily: 'inherit' }} />
            </Field>
            <button type="submit" style={{ ...primaryButtonStyle, width: '100%' }}>{t('saveMeasurement')}</button>
            {message && <div role="status" aria-live="polite" style={{ fontSize: '13px', color: [t('measurementSaved'), t('notificationOn')].includes(message) ? 'var(--success)' : 'var(--danger)', marginTop: '10px', textAlign: 'center', fontWeight: 700 }}>{message}</div>}
          </InfoCard>
        </form>
      </div>

      <aside className="side-panel">
        <InfoCard>
          <div style={{ display: 'grid', gap: '8px' }}>
            {MEASUREMENT_MOMENTS.map(moment => {
              const isSelected = moment.date === date;
              const isSaved = savedMomentDates.has(moment.date);
              const isDue = moment.date <= getTodayString() && !isSaved;
              return (
                <button key={moment.key} type="button" onClick={() => { setDate(moment.date); setMessage(''); }} aria-pressed={isSelected} style={{ textAlign: 'left', border: `2px solid ${isSelected ? 'var(--accent)' : isDue ? 'var(--action)' : 'var(--line)'}`, background: isSelected ? 'var(--accent-tint)' : 'var(--surface)', borderRadius: 'var(--radius)', padding: '12px', cursor: 'pointer', minHeight: '44px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: '10px', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: 800, color: 'var(--ink)' }}>{moment.title}</div>
                      <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '3px' }}>Week {moment.week} · {formatDateShort(moment.date)}</div>
                    </div>
                    <Tag icon={isSaved ? CheckCircle2 : Clock3} label={isSaved ? t('saved') : isDue ? t('now') : t('later')} bg={isSaved ? 'var(--success-tint)' : isDue ? 'var(--warn-tint)' : 'var(--info-tint)'} color={isSaved ? 'var(--success)' : isDue ? 'var(--warn)' : 'var(--accent)'} />
                  </div>
                </button>
              );
            })}
          </div>
        </InfoCard>

        <MeasurementHistory checkins={checkins} t={t} />
      </aside>
    </div>
  );
}

// Measurement history list. Reused on Voortgang (Phase 4) where each row links
// back into the check-in form via onOpenMeasurement.
export function MeasurementHistory({ checkins, onOpenMeasurement, t }) {
  const items = checkins.filter(isMeasurementCheckin);
  return (
    <section aria-label={t('measurementHistory')}>
      <div className="route-strip" aria-hidden="true" style={{ margin: '20px 4px 14px' }}>
        <span className="route-line" />
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px', margin: '0 4px 12px' }}>
        <div className="signal-kicker signal-kicker--accent">{t('measurementHistory')}</div>
        {onOpenMeasurement && (
          <button type="button" onClick={() => onOpenMeasurement()} style={{ border: '1px solid var(--line)', background: 'var(--surface)', color: 'var(--accent-strong)', borderRadius: 'var(--radius)', padding: '8px 12px', fontSize: '13px', fontWeight: 700, cursor: 'pointer', minHeight: '40px' }}>
            {t('recordMeasurement')}
          </button>
        )}
      </div>
      {items.length === 0 ? (
        <InfoCard><div style={{ fontSize: '13px', color: 'var(--muted)' }}>{t('noMeasurements')}</div></InfoCard>
      ) : items.map(item => {
        const summary = [item.weight_kg && `${item.weight_kg} kg`, item.waist_cm && `${item.waist_cm} cm`, item.sleep_hours && t('sleepShort', { hours: item.sleep_hours })].filter(Boolean).join(' · ');
        const body = (
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
            <div>
              <div style={{ fontWeight: 700, color: 'var(--ink)' }}>{getMeasurementTitle(item.date)}</div>
              <div style={{ fontSize: '12px', color: 'var(--muted-2)', marginTop: '4px' }}>{formatDateShort(item.date, t('localeTag'))}</div>
            </div>
            {summary && <div style={{ fontSize: '13px', color: 'var(--muted)' }}>{summary}</div>}
          </div>
        );
        return (
          <InfoCard key={item.id || item.date} style={onOpenMeasurement ? { padding: 0 } : undefined}>
            {onOpenMeasurement ? (
              <button type="button" onClick={() => onOpenMeasurement(item.date)} style={{ display: 'block', width: '100%', textAlign: 'left', background: 'transparent', border: 'none', padding: '16px', cursor: 'pointer', color: 'inherit', minHeight: '44px' }}>
                {body}
              </button>
            ) : body}
          </InfoCard>
        );
      })}
    </section>
  );
}

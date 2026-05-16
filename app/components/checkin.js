'use client';

import { useState, useEffect } from 'react';
import { Activity, CheckCircle2, Clock3 } from 'lucide-react';
import { MEASUREMENT_MOMENTS, getMeasurementMomentByDate, getMeasurementTitle, getSuggestedMeasurementMoment, isMeasurementCheckin } from '../../lib/plan-content';
import { getAlarmSignals, checkinToForm, getTodayString, formatDateShort } from '../../lib/utils';
import { getWeekOverview } from '../../lib/plan-content';
import { InfoCard, SectionTitle, Tag, SimpleList, Field } from './ui';
import { inputStyle } from './styles';

function MetricInputLocal({ label, value, onChange, placeholder }) {
  const id = `metric-${label.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
  return (
    <div style={{ marginBottom: '14px' }}>
      <label htmlFor={id} style={{ display: 'block', fontSize: '13px', color: 'var(--muted)', fontWeight: 700, marginBottom: '6px' }}>{label}</label>
      <input id={id} type="number" inputMode="decimal" value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} style={inputStyle} />
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
          <div className="signal-kicker" style={{ color: 'var(--accent-strong)' }}>{t('plannedMeasurements')}</div>
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
              <div className="signal-kicker" style={{ color: 'var(--accent-strong)' }}>{currentMoment.title}</div>
              <div style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.5 }}>{currentMoment.focus}</div>
            </div>
            <SimpleList items={currentMoment.items} />
            {currentMoment.photoReminder && (
              <div style={{ margin: '10px 0 4px', padding: '10px 12px', borderRadius: 'var(--radius)', background: 'var(--warn-tint)', color: 'var(--warn)', fontSize: '13px', fontWeight: 700, borderLeft: '3px solid var(--warn)' }}>
                {t('photo')}: {currentMoment.photoReminder}
              </div>
            )}
            <div style={{ height: '12px' }} />
            <MetricInputLocal label={t('weight')} value={form.weightKg} onChange={v => update('weightKg', v)} placeholder="bijv. 88.4" />
            <MetricInputLocal label={t('waist')} value={form.waistCm} onChange={v => update('waistCm', v)} placeholder="bijv. 96" />
            <MetricInputLocal label={t('sleep')} value={form.sleepHours} onChange={v => update('sleepHours', v)} placeholder="bijv. 7.5" />
            <MetricInputLocal label={t('restingHr')} value={form.restingHr} onChange={v => update('restingHr', v)} placeholder="bijv. 56" />
            <MetricInputLocal label="HRV" value={form.hrv} onChange={v => update('hrv', v)} placeholder="optioneel" />
            <MetricInputLocal label={t('energy')} value={form.energyLevel} onChange={v => update('energyLevel', v)} placeholder="3" />
            <MetricInputLocal label={t('mood')} value={form.moodLevel} onChange={v => update('moodLevel', v)} placeholder="3" />
            <MetricInputLocal label={t('soreness')} value={form.sorenessHours} onChange={v => update('sorenessHours', v)} placeholder="bijv. 24" />
            <MetricInputLocal label={t('hunger')} value={form.hungerLevel} onChange={v => update('hungerLevel', v)} placeholder="3" />
            <label style={{ display: 'flex', gap: '10px', alignItems: 'center', fontSize: '13px', color: 'var(--muted)', margin: '10px 0 14px' }}>
              <input type="checkbox" checked={form.hrvLowSignal} onChange={e => update('hrvLowSignal', e.target.checked)} />
              {t('hrvLow')}
            </label>
            <Field label={t('notes')} htmlFor="measurement-notes">
              <textarea id="measurement-notes" value={form.notes} onChange={e => update('notes', e.target.value)} rows={3} placeholder={t('howFeel')} style={{ ...inputStyle, resize: 'vertical', fontFamily: 'inherit' }} />
            </Field>
            <button type="submit" style={{ width: '100%', padding: '14px', borderRadius: 'var(--radius)', border: 'none', background: 'var(--accent)', color: 'white', fontSize: '15px', fontWeight: 700, cursor: 'pointer', minHeight: '44px' }}>{t('saveMeasurement')}</button>
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

        <SectionTitle title={t('history')} />
        {checkins.filter(isMeasurementCheckin).length === 0 ? (
          <InfoCard><div style={{ fontSize: '13px', color: 'var(--muted)' }}>{t('noMeasurements')}</div></InfoCard>
        ) : checkins.filter(isMeasurementCheckin).map(item => (
          <InfoCard key={item.id || item.date}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
              <div style={{ fontWeight: 700, color: 'var(--ink)' }}>{getMeasurementTitle(item.date)}</div>
              <div style={{ fontSize: '12px', color: 'var(--muted-2)', marginTop: '4px' }}>{formatDateShort(item.date)}</div>
              <div style={{ fontSize: '13px', color: 'var(--muted)' }}>{[item.weight_kg && `${item.weight_kg} kg`, item.waist_cm && `${item.waist_cm} cm`, item.sleep_hours && t('sleepShort', { hours: item.sleep_hours })].filter(Boolean).join(' · ')}</div>
            </div>
          </InfoCard>
        ))}
      </aside>
    </div>
  );
}

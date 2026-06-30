'use client';

import { useState, useEffect } from 'react';
import { CheckCircle2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { subscribeToPush } from '../../lib/utils';
import { withDefaultSettings } from '../../lib/insights';
import { InfoCard, SectionTitle, MetricInput, BellIcon, Field } from './ui';
import { inputStyle, primaryButtonStyle, secondaryButtonStyle, ghostButtonStyle } from './styles';
import { ModalShell } from './ModalShell';

export function GoogleLinkButton({ setMessage, setBusy, busy, t }) {
  const [linked, setLinked] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      const providers = session?.user?.app_metadata?.providers || [];
      setLinked(providers.includes('google'));
    });
  }, []);

  if (linked) {
    return (
      <div style={{ fontSize: '13px', color: 'var(--success)', marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
        <CheckCircle2 size={15} aria-hidden="true" /> {t('googleLinked')}
      </div>
    );
  }

  async function linkGoogle() {
    setBusy(true);
    const { error } = await supabase.auth.linkIdentity({ provider: 'google', options: { redirectTo: window.location.origin } });
    if (error) setMessage(error.message);
    setBusy(false);
  }

  return (
    <button type="button" onClick={linkGoogle} disabled={busy} style={{
      width: '100%', padding: '12px', borderRadius: 'var(--radius)',
      border: '1px solid var(--line)', background: 'var(--surface)',
      color: 'var(--ink)', fontSize: '14px', fontWeight: 600,
      cursor: busy ? 'not-allowed' : 'pointer',
      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
      marginBottom: '14px', minHeight: '44px',
    }}>
      <GoogleLogoSmall />
      {t('linkGoogle')}
    </button>
  );
}

export function PasswordDialog({ t, isRecovery, onClose }) {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const isSuccess = message === t('passwordUpdated');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    if (password.length < 6) { setMessage(t('passwordTooShort')); return; }
    if (password !== confirmPassword) { setMessage(t('passwordMismatch')); return; }
    setBusy(true);
    const { error } = await supabase.auth.updateUser({ password });
    setBusy(false);
    if (error) { setMessage(error.message); return; }
    setPassword('');
    setConfirmPassword('');
    setMessage(t('passwordUpdated'));
  };

  return (
    <ModalShell open onClose={onClose} titleId="password-dialog-title" closeLabel={t('cancel')} as="form" onSubmit={handleSubmit}>
      <h2 id="password-dialog-title" style={{ margin: '0 0 8px', fontSize: '22px', fontWeight: 800, color: 'var(--accent-strong)' }}>{t('changePassword')}</h2>
      {isRecovery && <p style={{ margin: '0 0 16px', fontSize: '13px', color: 'var(--muted)', lineHeight: 1.5 }}>{t('passwordRecoveryActive')}</p>}
      <Field label={t('newPassword')} htmlFor="new-password" help={t('minPassword')}>
        <input id="new-password" type="password" value={password} onChange={e => setPassword(e.target.value)} autoComplete="new-password" minLength={6} required style={inputStyle} />
      </Field>
      <Field label={t('confirmPassword')} htmlFor="confirm-password">
        <input id="confirm-password" type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} autoComplete="new-password" minLength={6} required style={inputStyle} />
      </Field>
      {message && (
        <div role="status" aria-live="polite" style={{
          marginBottom: '14px', padding: '12px', borderRadius: 'var(--radius)',
          background: isSuccess ? 'var(--success-tint)' : 'var(--danger-tint)',
          color: isSuccess ? 'var(--success)' : 'var(--danger)',
          fontSize: '13px', fontWeight: 700,
        }}>{message}</div>
      )}
      <div style={{ display: 'flex', gap: '8px' }}>
        <button type="button" onClick={onClose} style={ghostButtonStyle}>{t('cancel')}</button>
        <button type="submit" disabled={busy} style={{ ...primaryButtonStyle, flex: 2, opacity: busy ? 0.7 : 1, cursor: busy ? 'not-allowed' : 'pointer' }}>{busy ? t('busy') : t('savePassword')}</button>
      </div>
    </ModalShell>
  );
}

export function SettingsDialog({ settings, onSave, onClose, t }) {
  const [form, setForm] = useState(() => withDefaultSettings(settings));
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const isSuccess = [t('saved'), t('pushEnabled')].includes(message);

  useEffect(() => { setForm(withDefaultSettings(settings)); }, [settings]);

  const authFetch = async (url, options = {}) => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.access_token) throw new Error('Geen actieve sessie');
    return fetch(url, { ...options, headers: { ...(options.headers || {}), Authorization: `Bearer ${session.access_token}` } });
  };

  const save = async (event) => {
    event.preventDefault();
    setBusy(true);
    const { error } = await onSave(form);
    setMessage(error ? error.message : t('saved'));
    setBusy(false);
  };

  const enablePush = async () => {
    setBusy(true);
    setMessage('');
    try {
      await subscribeToPush(authFetch);
      setMessage(t('pushEnabled'));
    } catch (error) {
      setMessage(error.message);
    } finally {
      setBusy(false);
    }
  };

  const updateZone = (index, key, value) => {
    const zones = [...form.heart_zones];
    zones[index] = { ...zones[index], [key]: value };
    setForm({ ...form, heart_zones: zones });
  };

  return (
    <ModalShell open onClose={onClose} titleId="settings-dialog-title" closeLabel={t('cancel')} as="form" onSubmit={save}>
      <h2 id="settings-dialog-title" style={{ margin: '0 0 16px', fontSize: '22px', fontWeight: 800, color: 'var(--accent-strong)' }}>{t('settings')}</h2>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '10px' }}>
        <MetricInput label={t('kcalGoal')} value={form.kcal_target} onChange={v => setForm({ ...form, kcal_target: Number(v) || 0 })} placeholder="1900" />
        <MetricInput label={t('proteinGoal')} value={form.protein_target} onChange={v => setForm({ ...form, protein_target: Number(v) || 0 })} placeholder="130" />
        <MetricInput label={t('waterGoal')} value={form.water_target} onChange={v => setForm({ ...form, water_target: Number(v) || 0 })} placeholder="2" />
        <MetricInput label={t('baselineHr')} value={form.resting_hr_baseline} onChange={v => setForm({ ...form, resting_hr_baseline: Number(v) || 0 })} placeholder="56" />
      </div>

      <Field label={t('timezone')} htmlFor="settings-timezone">
        <input id="settings-timezone" value={form.timezone} onChange={e => setForm({ ...form, timezone: e.target.value })} style={inputStyle} />
      </Field>
      <Field label={t('reminderTime')} htmlFor="settings-reminder-time">
        <input id="settings-reminder-time" type="time" value={form.reminder_time} onChange={e => setForm({ ...form, reminder_time: e.target.value })} style={inputStyle} />
      </Field>
      <label style={{ display: 'flex', gap: '10px', alignItems: 'center', fontSize: '14px', color: 'var(--ink)', margin: '0 0 14px', cursor: 'pointer', padding: '10px 12px', border: '1px solid var(--line)', borderRadius: 'var(--radius)', background: 'var(--surface-2)' }}>
        <input type="checkbox" checked={!!form.reminder_enabled} onChange={e => setForm({ ...form, reminder_enabled: e.target.checked })} style={{ width: '18px', height: '18px', accentColor: 'var(--accent)' }} />
        {t('reminderEnabled')}
      </label>

      <SectionTitle title={t('heartZones')} />
      <div style={{ display: 'grid', gap: '8px', marginBottom: '14px' }}>
        {form.heart_zones.map((zone, index) => (
          <div key={zone.zone} style={{ display: 'grid', gridTemplateColumns: '60px 1fr 1fr', gap: '8px', alignItems: 'center' }}>
            <div style={{ fontWeight: 800, color: 'var(--accent-strong)' }}>{zone.zone}</div>
            <input type="number" value={zone.min} onChange={e => updateZone(index, 'min', Number(e.target.value) || 0)} style={inputStyle} aria-label={`${zone.zone} min`} />
            <input type="number" value={zone.max} onChange={e => updateZone(index, 'max', Number(e.target.value) || 0)} style={inputStyle} aria-label={`${zone.zone} max`} />
          </div>
        ))}
      </div>

      <GoogleLinkButton setMessage={setMessage} setBusy={setBusy} busy={busy} t={t} />

      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
        <button type="button" onClick={enablePush} disabled={busy} style={{ ...secondaryButtonStyle, opacity: busy ? 0.7 : 1, cursor: busy ? 'not-allowed' : 'pointer' }}><BellIcon />{t('enablePush')}</button>
        <button type="submit" disabled={busy} style={{ ...primaryButtonStyle, opacity: busy ? 0.7 : 1, cursor: busy ? 'not-allowed' : 'pointer' }}>{busy ? t('busy') : t('saveSettings')}</button>
      </div>

      {message && (
        <div role="status" aria-live="polite" style={{
          fontSize: '13px',
          background: isSuccess ? 'var(--success-tint)' : 'var(--danger-tint)',
          color: isSuccess ? 'var(--success)' : 'var(--danger)',
          padding: '10px 12px', borderRadius: 'var(--radius)',
          margin: '0 0 12px', textAlign: 'center', fontWeight: 700,
        }}>{message}</div>
      )}

      <button type="button" onClick={onClose} style={{ ...ghostButtonStyle, width: '100%' }}>{t('cancel')}</button>
    </ModalShell>
  );
}

function GoogleLogoSmall() {
  return (
    <svg width="16" height="16" viewBox="0 0 48 48" aria-hidden="true">
      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
    </svg>
  );
}

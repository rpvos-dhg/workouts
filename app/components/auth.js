'use client';

import { useState } from 'react';
import { Bike, KeyRound, Mail } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { Field } from './ui';
import { inputStyle } from './styles';

export function Loading({ t }) {
  return (
    <div role="status" aria-live="polite" aria-busy="true" style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', background: 'var(--bg)' }}>
      <div style={{ textAlign: 'center', color: 'var(--muted)' }}>
        <div className="spinner" aria-hidden="true" style={{ margin: '0 auto 14px' }} />
        <div style={{ fontSize: '14px', fontWeight: 600 }}>{t('loading')}</div>
      </div>
    </div>
  );
}

export function LanguageToggle({ t, lang, setLang, onChange }) {
  return (
    <div style={{ display: 'flex', gap: '4px' }}>
      {['nl', 'en'].map(l => (
        <button key={l} type="button" onClick={() => { setLang(l); onChange?.(); }} aria-pressed={lang === l} style={{
          padding: '10px 14px', borderRadius: 'var(--radius)', border: 'none', fontSize: '12px', fontWeight: 700,
          background: lang === l ? 'var(--accent)' : 'var(--surface-2)',
          color: lang === l ? 'white' : 'var(--muted)',
          cursor: 'pointer', minHeight: '40px', minWidth: '44px',
        }}>{l.toUpperCase()}</button>
      ))}
    </div>
  );
}

export function AuthModeButton({ onClick, icon: Icon, label }) {
  return (
    <button type="button" onClick={onClick} style={{
      width: '100%', padding: '12px', borderRadius: 'var(--radius)',
      border: '1px solid var(--line)', background: 'transparent',
      color: 'var(--muted)', fontSize: '14px', cursor: 'pointer',
      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
      minHeight: '44px',
    }}>
      {Icon && <Icon size={15} aria-hidden="true" />}
      {label}
    </button>
  );
}

export function Auth({ t, lang, setLang }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mode, setMode] = useState('signin');
  const [msg, setMsg] = useState('');
  const [busy, setBusy] = useState(false);
  const isEmailOnly = mode === 'forgot' || mode === 'magic';
  const successMessages = [t('confirmEmail'), t('resetEmailSent'), t('magicLinkSent')];
  const authSubtitle = mode === 'signup' ? t('createAccount') : mode === 'forgot' ? t('forgotTitle') : mode === 'magic' ? t('magicLinkTitle') : t('loginToStart');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setMsg('');
    try {
      if (mode === 'signup') {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        setMsg(t('confirmEmail'));
      } else if (mode === 'forgot') {
        const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: window.location.origin });
        if (error) throw error;
        setMsg(t('resetEmailSent'));
      } else if (mode === 'magic') {
        const { error } = await supabase.auth.signInWithOtp({ email, options: { emailRedirectTo: window.location.origin, shouldCreateUser: false } });
        if (error) throw error;
        setMsg(t('magicLinkSent'));
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
    } catch (err) {
      setMsg(err.message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="auth-shell">
      <div className="auth-card">
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '10px' }}>
          <LanguageToggle t={t} lang={lang} setLang={setLang} />
        </div>
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div aria-hidden="true" className="brand-mark"><Bike size={30} strokeWidth={2.4} /></div>
          <h1 style={{ margin: 0, fontFamily: 'var(--font-display), var(--font-body), sans-serif', fontSize: '25px', fontWeight: 800, color: 'var(--accent-strong)' }}>{t('appTitle')}</h1>
          <p style={{ margin: '6px 0 0', fontSize: '14px', color: 'var(--muted)' }}>{authSubtitle}</p>
        </div>

        <form onSubmit={handleSubmit}>
          {(mode === 'forgot' || mode === 'magic') && (
            <div style={{ background: 'var(--surface-2)', border: '1px solid var(--line)', borderRadius: '10px', color: 'var(--muted)', fontSize: '13px', lineHeight: 1.5, marginBottom: '14px', padding: '12px' }}>
              {mode === 'forgot' ? t('forgotHelp') : t('magicLinkHelp')}
            </div>
          )}
          <Field label={t('email')} htmlFor="auth-email">
            <input id="auth-email" type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder={t('email')} autoComplete="email" required style={inputStyle} />
          </Field>
          {!isEmailOnly && (
            <Field label={t('password')} htmlFor="auth-password" help={mode === 'signup' ? t('minPassword') : undefined}>
              <input id="auth-password" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder={mode === 'signup' ? t('passwordPlaceholder') : t('password')} autoComplete={mode === 'signup' ? 'new-password' : 'current-password'} required minLength={mode === 'signup' ? 6 : undefined} style={inputStyle} />
            </Field>
          )}
          <button type="submit" disabled={busy} style={{ width: '100%', padding: '14px', borderRadius: 'var(--radius)', border: 'none', background: 'var(--accent)', opacity: busy ? 0.7 : 1, color: 'white', fontSize: '15px', fontWeight: 700, cursor: busy ? 'not-allowed' : 'pointer', minHeight: '44px' }}>
            {busy ? t('busy') : mode === 'signup' ? t('signUp') : mode === 'forgot' ? t('sendResetLink') : mode === 'magic' ? t('sendMagicLink') : t('signIn')}
          </button>
        </form>

        {msg && (
          <div role="status" aria-live="polite" style={{ marginTop: '14px', padding: '12px', borderRadius: 'var(--radius)', background: successMessages.includes(msg) ? 'var(--success-tint)' : 'var(--danger-tint)', color: successMessages.includes(msg) ? 'var(--success)' : 'var(--danger)', fontSize: '13px', textAlign: 'center', fontWeight: 700 }}>{msg}</div>
        )}

        {(mode === 'signin' || mode === 'signup') && (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', margin: '16px 0 12px' }}>
              <div style={{ flex: 1, height: '1px', background: 'var(--line)' }} />
              <span style={{ fontSize: '12px', color: 'var(--muted)', whiteSpace: 'nowrap' }}>{t('or')}</span>
              <div style={{ flex: 1, height: '1px', background: 'var(--line)' }} />
            </div>
            <button type="button" onClick={() => supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: window.location.origin } })} style={{ width: '100%', padding: '14px', borderRadius: 'var(--radius)', border: '1px solid var(--line)', background: 'var(--surface)', color: 'var(--ink)', fontSize: '15px', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', minHeight: '44px' }}>
              <GoogleLogo size={18} />
              {t('signInWithGoogle')}
            </button>
          </>
        )}

        <div style={{ display: 'grid', gap: '2px', marginTop: '8px' }}>
          {mode === 'signin' && (
            <>
              <AuthModeButton onClick={() => { setMode('magic'); setMsg(''); }} icon={Mail} label={t('magicLink')} />
              <AuthModeButton onClick={() => { setMode('forgot'); setMsg(''); }} icon={KeyRound} label={t('forgotPassword')} />
              <AuthModeButton onClick={() => { setMode('signup'); setMsg(''); }} label={t('noAccount')} />
            </>
          )}
          {mode === 'signup' && <AuthModeButton onClick={() => { setMode('signin'); setMsg(''); }} label={t('hasAccount')} />}
          {(mode === 'forgot' || mode === 'magic') && <AuthModeButton onClick={() => { setMode('signin'); setMsg(''); }} label={t('usePasswordLogin')} />}
        </div>
      </div>
    </main>
  );
}

function GoogleLogo({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" aria-hidden="true">
      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
      <path fill="none" d="M0 0h48v48H0z"/>
    </svg>
  );
}

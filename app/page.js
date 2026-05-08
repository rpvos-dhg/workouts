'use client';

import { useState, useEffect } from 'react';
import { BookOpen, KeyRound, LogOut, MoreHorizontal, Plus, Settings } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { PLAN_DATA } from '../lib/plan-data';
import { DEFAULT_USER_SETTINGS, getAdaptiveAdvice, withDefaultSettings } from '../lib/insights';
import { getDueMeasurementMoment, getWeekOverview } from '../lib/plan-content';
import { makeT } from '../lib/i18n';
import { getTodayString, addDaysString, formatDateShort } from '../lib/utils';
import { Loading, Auth, LanguageToggle } from './components/auth';
import { DashboardStrip, MeasurementBanner, TodayView, WeekView, PlanView, DayDetail } from './components/plan';
import { CheckInView } from './components/checkin';
import { InsightsView } from './components/insights';
import { LogView, LogForm } from './components/logs';
import { SettingsDialog, PasswordDialog } from './components/settings';

export default function Home() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lang, setLang] = useState('nl');
  const [forcePasswordUpdate, setForcePasswordUpdate] = useState(false);

  useEffect(() => {
    const saved = window.localStorage.getItem('workouts-lang');
    if (saved === 'en' || saved === 'nl') setLang(saved);
  }, []);

  useEffect(() => {
    window.localStorage.setItem('workouts-lang', lang);
    document.documentElement.lang = lang;
  }, [lang]);

  const t = makeT(lang);

  useEffect(() => {
    let active = true;
    const hasRecoveryMarker = () => {
      if (typeof window === 'undefined') return false;
      return window.location.hash.includes('type=recovery') || window.location.search.includes('type=recovery');
    };

    const sessionFallback = new Promise(resolve => {
      window.setTimeout(() => resolve({ data: { session: null } }), 4000);
    });

    Promise.race([supabase.auth.getSession(), sessionFallback]).then(({ data: { session } }) => {
      if (!active) return;
      setSession(session);
      if (session && hasRecoveryMarker()) setForcePasswordUpdate(true);
      setLoading(false);
    }).catch(() => {
      if (!active) return;
      setSession(null);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!active) return;
      setSession(session);
      setLoading(false);
      if (event === 'PASSWORD_RECOVERY') setForcePasswordUpdate(true);
    });

    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, []);

  if (loading) return <Loading t={t} />;
  if (!session) return <Auth t={t} lang={lang} setLang={setLang} />;
  return (
    <App
      user={session.user}
      t={t}
      lang={lang}
      setLang={setLang}
      forcePasswordUpdate={forcePasswordUpdate}
      onPasswordUpdateHandled={() => setForcePasswordUpdate(false)}
    />
  );
}

function App({ user, t, lang, setLang, forcePasswordUpdate, onPasswordUpdateHandled }) {
  const [completed, setCompleted] = useState({});
  const [logs, setLogs] = useState([]);
  const [checkins, setCheckins] = useState([]);
  const [habits, setHabits] = useState([]);
  const [settings, setSettings] = useState(DEFAULT_USER_SETTINGS);
  const [view, setView] = useState(() => {
    if (typeof window === 'undefined') return 'today';
    const saved = sessionStorage.getItem('workouts-view');
    return ['today', 'week', 'plan', 'checkin', 'insights', 'log'].includes(saved) ? saved : 'today';
  });
  const [todayId, setTodayId] = useState(1);
  const [selectedDay, setSelectedDay] = useState(null);
  const [selectedMeasurementDate, setSelectedMeasurementDate] = useState(null);
  const [showLogForm, setShowLogForm] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [editingLog, setEditingLog] = useState(null);
  const [syncing, setSyncing] = useState(false);
  const [cyclingWeather, setCyclingWeather] = useState({ status: 'idle', byDate: {}, location: null, error: '' });
  const [weatherRetry, setWeatherRetry] = useState(0);
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [updateCountdown, setUpdateCountdown] = useState(10);

  useEffect(() => {
    const currentVersion = process.env.NEXT_PUBLIC_BUILD_ID || 'dev';
    const check = async () => {
      try {
        const res = await fetch('/api/version');
        if (!res.ok) return;
        const { version } = await res.json();
        if (version && version !== 'dev' && currentVersion !== 'dev' && version !== currentVersion) {
          setUpdateAvailable(true);
          setUpdateCountdown(10);
        }
      } catch { /* ignore */ }
    };
    const id = setInterval(check, 60 * 1000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (!updateAvailable) return;
    if (updateCountdown <= 0) {
      sessionStorage.setItem('workouts-view', view);
      window.location.reload();
      return;
    }
    const id = setTimeout(() => setUpdateCountdown(n => n - 1), 1000);
    return () => clearTimeout(id);
  }, [updateAvailable, updateCountdown, view]);

  useEffect(() => {
    if (forcePasswordUpdate) setShowPasswordDialog(true);
  }, [forcePasswordUpdate]);

  useEffect(() => {
    const load = async () => {
      const [{ data: completionsData }, { data: logsData }, { data: checkinData }, { data: settingsData }, { data: habitsData }] = await Promise.all([
        supabase.from('completions').select('*').eq('user_id', user.id),
        supabase.from('workout_logs').select('*').eq('user_id', user.id).order('date', { ascending: false }),
        supabase.from('daily_checkins').select('*').eq('user_id', user.id).order('date', { ascending: false }),
        supabase.from('user_settings').select('*').eq('user_id', user.id).maybeSingle(),
        supabase.from('daily_habits').select('*').eq('user_id', user.id).order('date', { ascending: false }),
      ]);
      const compMap = {};
      (completionsData || []).forEach(c => { compMap[c.day_id] = true; });
      setCompleted(compMap);
      setLogs(logsData || []);
      setCheckins(checkinData || []);
      setSettings(withDefaultSettings(settingsData || {}));
      setHabits(habitsData || []);
    };
    load();
  }, [user.id]);

  useEffect(() => {
    const channel = supabase
      .channel('app-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'completions', filter: `user_id=eq.${user.id}` }, () => reloadCompletions())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'workout_logs', filter: `user_id=eq.${user.id}` }, () => reloadLogs())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'daily_checkins', filter: `user_id=eq.${user.id}` }, () => reloadCheckins())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'user_settings', filter: `user_id=eq.${user.id}` }, () => reloadSettings())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'daily_habits', filter: `user_id=eq.${user.id}` }, () => reloadHabits())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user.id]);

  const reloadCompletions = async () => {
    const { data } = await supabase.from('completions').select('*').eq('user_id', user.id);
    const compMap = {};
    (data || []).forEach(c => { compMap[c.day_id] = true; });
    setCompleted(compMap);
  };

  const reloadLogs = async () => {
    const { data } = await supabase.from('workout_logs').select('*').eq('user_id', user.id).order('date', { ascending: false });
    setLogs(data || []);
  };

  const reloadCheckins = async () => {
    const { data } = await supabase.from('daily_checkins').select('*').eq('user_id', user.id).order('date', { ascending: false });
    setCheckins(data || []);
  };

  const reloadSettings = async () => {
    const { data } = await supabase.from('user_settings').select('*').eq('user_id', user.id).maybeSingle();
    setSettings(withDefaultSettings(data || {}));
  };

  const reloadHabits = async () => {
    const { data } = await supabase.from('daily_habits').select('*').eq('user_id', user.id).order('date', { ascending: false });
    setHabits(data || []);
  };

  useEffect(() => {
    const today = getTodayString();
    const found = PLAN_DATA.find(d => d.date === today);
    if (found) setTodayId(found.id);
    else {
      const next = PLAN_DATA.find(d => d.date >= today);
      if (next) setTodayId(next.id);
    }
  }, []);

  const toggleComplete = async (id) => {
    setSyncing(true);
    if (completed[id]) {
      await supabase.from('completions').delete().eq('user_id', user.id).eq('day_id', id);
      const next = { ...completed };
      delete next[id];
      setCompleted(next);
    } else {
      await supabase.from('completions').insert({ user_id: user.id, day_id: id });
      setCompleted({ ...completed, [id]: true });
    }
    setSyncing(false);
  };

  const buildLogPayload = (log) => ({
    user_id: user.id,
    date: log.date,
    type: log.type,
    duration: parseFloat(log.duration ?? log.durationMin) || null,
    distance: parseFloat(log.distance ?? log.distanceKm) || null,
    avg_hr: parseInt(log.avgHR ?? log.avg_hr) || null,
    max_hr: parseInt(log.maxHR ?? log.max_hr) || null,
    kcal: parseInt(log.kcal) || null,
    notes: log.notes || null,
  });

  const saveLog = async (log) => {
    setSyncing(true);
    const { data, error } = await supabase.from('workout_logs').insert(buildLogPayload(log)).select();
    if (!error && data) setLogs([data[0], ...logs]);
    setSyncing(false);
    setShowLogForm(false);
  };

  const updateLog = async (log) => {
    if (!editingLog) return;
    setSyncing(true);
    const payload = buildLogPayload(log);
    delete payload.user_id;
    const { data, error } = await supabase
      .from('workout_logs')
      .update(payload)
      .eq('user_id', user.id)
      .eq('id', editingLog.id)
      .select();
    if (!error && data?.[0]) {
      setLogs(logs.map(item => item.id === editingLog.id ? data[0] : item));
    }
    setSyncing(false);
    setEditingLog(null);
    setShowLogForm(false);
  };

  const deleteLog = async (id) => {
    if (!confirm(t('deleteConfirm'))) return;
    await supabase.from('workout_logs').delete().eq('id', id);
    setLogs(logs.filter(l => l.id !== id));
  };

  const openMeasurement = (date) => {
    setSelectedMeasurementDate(date);
    setSelectedDay(null);
    setView('checkin');
  };

  const openDay = (day) => {
    if (day.type === 'check') { openMeasurement(day.date); return; }
    setSelectedDay(day);
  };

  const saveCheckin = async (form) => {
    setSyncing(true);
    const payload = {
      user_id: user.id,
      date: form.date,
      weight_kg: parseFloat(form.weightKg) || null,
      waist_cm: parseFloat(form.waistCm) || null,
      sleep_hours: parseFloat(form.sleepHours) || null,
      resting_hr: parseInt(form.restingHr) || null,
      hrv: parseFloat(form.hrv) || null,
      energy_level: parseInt(form.energyLevel) || null,
      mood_level: parseInt(form.moodLevel) || null,
      soreness_hours: parseInt(form.sorenessHours) || null,
      hunger_level: parseInt(form.hungerLevel) || null,
      hrv_low_signal: !!form.hrvLowSignal,
      notes: form.notes || null,
      updated_at: new Date().toISOString(),
    };
    const { data, error } = await supabase
      .from('daily_checkins')
      .upsert(payload, { onConflict: 'user_id,date' })
      .select();
    if (!error && data) {
      setCheckins([data[0], ...checkins.filter(item => item.date !== data[0].date)]);
    }
    setSyncing(false);
    return { error };
  };

  const saveSettings = async (nextSettings) => {
    setSyncing(true);
    const payload = {
      ...withDefaultSettings(nextSettings),
      user_id: user.id,
      updated_at: new Date().toISOString(),
    };
    const { data, error } = await supabase
      .from('user_settings')
      .upsert(payload, { onConflict: 'user_id' })
      .select()
      .single();
    if (!error && data) setSettings(withDefaultSettings(data));
    setSyncing(false);
    return { error };
  };

  const saveDailyHabit = async (date, patch) => {
    const current = habits.find(item => item.date === date) || {};
    const next = { ...current, ...patch, date };
    setHabits([next, ...habits.filter(item => item.date !== date)]);
    const payload = {
      user_id: user.id,
      date,
      protein_done: !!next.protein_done,
      water_done: !!next.water_done,
      kcal_done: !!next.kcal_done,
      post_workout_protein_done: !!next.post_workout_protein_done,
      notes: next.notes || null,
      updated_at: new Date().toISOString(),
    };
    const { data } = await supabase
      .from('daily_habits')
      .upsert(payload, { onConflict: 'user_id,date' })
      .select()
      .single();
    if (data) setHabits([data, ...habits.filter(item => item.date !== date)]);
  };

  const signOut = async () => { await supabase.auth.signOut(); };

  const today = PLAN_DATA.find(d => d.id === todayId) || PLAN_DATA[0];
  const currentWeek = today.week;
  const currentOverview = getWeekOverview(currentWeek);
  const weekDays = PLAN_DATA.filter(d => d.week === currentWeek);
  const completedCount = Object.values(completed).filter(Boolean).length;
  const totalCount = PLAN_DATA.length;
  const progressPct = (completedCount / totalCount) * 100;
  const todayString = getTodayString();
  const streak = (() => {
    const past = PLAN_DATA.filter(d => d.date <= todayString).sort((a, b) => b.date.localeCompare(a.date));
    let count = 0;
    for (const d of past) { if (completed[d.id]) count++; else break; }
    return count;
  })();
  const dueMeasurement = getDueMeasurementMoment(checkins, todayString);
  const todayHabit = habits.find(item => item.date === todayString) || { date: todayString };
  const adaptiveAdvice = getAdaptiveAdvice({ today, completed, logs, checkins, settings, todayString });
  const weatherTimezone = withDefaultSettings(settings).timezone;
  const weatherForecastEnd = addDaysString(todayString, 13);
  const weatherCycleDays = PLAN_DATA
    .filter(day => day.type === 'cycle' && day.date >= todayString && day.date <= weatherForecastEnd)
    .map(day => ({ date: day.date, durationMin: day.dur || 60 }));
  const weatherRequestKey = weatherCycleDays.map(day => `${day.date}:${day.durationMin}`).join('|');

  useEffect(() => {
    if (!weatherRequestKey) {
      setCyclingWeather({ status: 'idle', byDate: {}, location: null, error: '' });
      return;
    }
    const controller = new AbortController();
    setCyclingWeather(current => ({ ...current, status: 'loading', error: '' }));
    let retryTimer;
    fetch('/api/weather/cycling', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ days: weatherCycleDays, timezone: weatherTimezone }),
      signal: controller.signal,
    })
      .then(async response => {
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || 'Weather failed');
        setCyclingWeather({ status: 'ready', byDate: data.recommendations || {}, location: data.location || null, error: '' });
      })
      .catch(error => {
        if (error.name === 'AbortError') return;
        setCyclingWeather(current => ({ ...current, status: 'error', error: error.message }));
        retryTimer = setTimeout(() => setWeatherRetry(n => n + 1), 5000);
      });
    return () => { controller.abort(); clearTimeout(retryTimer); };
  }, [weatherRequestKey, weatherTimezone, weatherRetry]);

  useEffect(() => {
    if (!dueMeasurement || typeof window === 'undefined' || !('Notification' in window)) return;
    if (Notification.permission !== 'granted') return;
    const storageKey = `measurement-notification-${dueMeasurement.key}-${dueMeasurement.date}`;
    if (window.localStorage.getItem(storageKey)) return;
    new Notification(`${t('navMeasure')}: ${dueMeasurement.title}`, {
      body: `${formatDateShort(dueMeasurement.date)} - ${t('openMeasurement').toLowerCase()}.`,
    });
    window.localStorage.setItem(storageKey, 'sent');
  }, [dueMeasurement, t]);

  return (
    <div className="app-shell">
      <header className="app-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
          <div>
            <div style={{ fontSize: '12px', opacity: 0.86, fontWeight: 700, textTransform: 'uppercase' }}>{t('weekOf', { week: currentWeek })}</div>
            <div style={{ fontFamily: 'var(--font-display), var(--font-body), sans-serif', fontSize: '24px', fontWeight: 800, marginTop: '4px', display: 'flex', alignItems: 'baseline', gap: '8px' }}>
              {t('appTitle')}
              <span style={{ fontSize: '11px', fontWeight: 600, opacity: 0.55, letterSpacing: '0.5px' }}>
                #{process.env.NEXT_PUBLIC_BUILD_ID || 'dev'}
              </span>
              {streak > 0 && (
                <span style={{ fontSize: '13px', fontWeight: 700, opacity: 0.9 }} title={`${streak} dagen op rij voltooid`}>
                  🔥 {streak}
                </span>
              )}
            </div>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <div style={{ background: 'rgba(255,255,255,0.16)', padding: '8px 12px', borderRadius: '999px', fontSize: '13px', fontWeight: 700 }}>
              {completedCount}/{totalCount}
            </div>
            <button type="button" aria-label={t('openMenu')} aria-expanded={showMenu} onClick={() => setShowMenu(!showMenu)} style={{ background: 'rgba(255,255,255,0.16)', border: '1px solid rgba(255,255,255,0.18)', color: 'white', padding: '6px 12px', borderRadius: '999px', cursor: 'pointer', fontWeight: 600 }}>
              <MoreHorizontal size={18} aria-hidden="true" />
            </button>
          </div>
        </div>
        <div aria-label={t('progressLabel', { progress: Math.round(progressPct) })} role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(progressPct)} style={{ background: 'rgba(255,255,255,0.22)', borderRadius: '999px', height: '8px', overflow: 'hidden' }}>
          <div style={{ background: 'var(--action)', height: '100%', width: `${progressPct}%`, borderRadius: '999px', transition: 'width 0.4s ease' }} />
        </div>
        <div style={{ fontSize: '12px', opacity: 0.88, marginTop: '8px', display: 'flex', justifyContent: 'space-between', gap: '12px' }}>
          <span>{t('completedPct', { progress: Math.round(progressPct) })}</span>
          {syncing && <span role="status" aria-live="polite">{t('sync')}</span>}
          {!syncing && <span style={{ opacity: 0.6 }}>{user.email}</span>}
        </div>
      </header>

      {updateAvailable && (
        <div style={{ background: '#1a7f4e', color: 'white', textAlign: 'center', padding: '10px 16px', fontSize: '14px', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
          <span>🆕 Nieuwe versie beschikbaar — automatisch vernieuwen over {updateCountdown}s</span>
          <button type="button" onClick={() => window.location.reload()} style={{ background: 'rgba(255,255,255,0.25)', border: '1px solid rgba(255,255,255,0.4)', color: 'white', padding: '4px 12px', borderRadius: '999px', cursor: 'pointer', fontSize: '13px', fontWeight: 700 }}>
            Nu vernieuwen
          </button>
        </div>
      )}

      {showMenu && (
        <div onClick={() => setShowMenu(false)} style={{ position: 'fixed', inset: 0, zIndex: 50, background: 'rgba(0,0,0,0.3)' }}>
          <div onClick={e => e.stopPropagation()} style={{ position: 'absolute', top: '70px', right: '20px', background: 'white', borderRadius: '12px', padding: '8px', boxShadow: '0 8px 24px rgba(0,0,0,0.15)', minWidth: '180px' }}>
            <button type="button" onClick={() => { setShowMenu(false); setShowSettings(true); }} style={{ width: '100%', padding: '12px 16px', border: 'none', background: 'transparent', textAlign: 'left', fontSize: '14px', cursor: 'pointer', borderRadius: '8px' }}>
              <Settings size={16} aria-hidden="true" style={{ verticalAlign: '-3px', marginRight: '8px' }} />{t('settings')}
            </button>
            <a href="/docs" onClick={() => setShowMenu(false)} style={{ display: 'block', width: '100%', padding: '12px 16px', border: 'none', background: 'transparent', textAlign: 'left', fontSize: '14px', cursor: 'pointer', borderRadius: '8px', color: 'inherit', textDecoration: 'none', boxSizing: 'border-box' }}>
              <BookOpen size={16} aria-hidden="true" style={{ verticalAlign: '-3px', marginRight: '8px' }} />{t('documentation')}
            </a>
            <button type="button" onClick={() => { setShowMenu(false); setShowPasswordDialog(true); }} style={{ width: '100%', padding: '12px 16px', border: 'none', background: 'transparent', textAlign: 'left', fontSize: '14px', cursor: 'pointer', borderRadius: '8px' }}>
              <KeyRound size={16} aria-hidden="true" style={{ verticalAlign: '-3px', marginRight: '8px' }} />{t('changePassword')}
            </button>
            <button type="button" onClick={() => { setShowMenu(false); signOut(); }} style={{ width: '100%', padding: '12px 16px', border: 'none', background: 'transparent', textAlign: 'left', fontSize: '14px', cursor: 'pointer', borderRadius: '8px' }}>
              <LogOut size={16} aria-hidden="true" style={{ verticalAlign: '-3px', marginRight: '8px' }} />{t('logout')}
            </button>
            <div style={{ padding: '8px 8px 4px' }}>
              <LanguageToggle t={t} lang={lang} setLang={setLang} onChange={() => setShowMenu(false)} />
            </div>
          </div>
        </div>
      )}

      <nav className="app-nav" aria-label="Hoofdnavigatie">
        {[
          { key: 'today', label: t('navToday') },
          { key: 'week', label: t('navWeek', { week: currentWeek }) },
          { key: 'plan', label: t('navPlan') },
          { key: 'checkin', label: t('navMeasure') },
          { key: 'insights', label: t('navInsights') },
          { key: 'log', label: t('navLog') },
        ].map(item => (
          <button key={item.key} type="button" aria-current={view === item.key ? 'page' : undefined} onClick={() => setView(item.key)} style={{ flex: 1, padding: '10px', border: 'none', background: view === item.key ? 'var(--accent)' : 'transparent', color: view === item.key ? 'white' : 'var(--muted)', borderRadius: '8px', fontSize: '14px', fontWeight: 700, cursor: 'pointer' }}>
            {item.label}
          </button>
        ))}
      </nav>

      <DashboardStrip today={today} overview={currentOverview} progressPct={progressPct} dueMeasurement={dueMeasurement} t={t} />

      {dueMeasurement && (
        <div className="banner-wrap">
          <MeasurementBanner moment={dueMeasurement} onOpen={() => openMeasurement(dueMeasurement.date)} t={t} />
        </div>
      )}

      <main className="view-main" style={{ padding: '20px 16px' }}>
        {view === 'today' && <TodayView day={today} completed={completed} toggleComplete={toggleComplete} overview={currentOverview} onOpenMeasurement={openMeasurement} habit={todayHabit} saveDailyHabit={saveDailyHabit} adaptiveAdvice={adaptiveAdvice} settings={settings} cyclingWeather={cyclingWeather} onRetryWeather={() => setWeatherRetry(n => n + 1)} logs={logs} userEmail={user.email} t={t} />}
        {view === 'week' && <WeekView days={weekDays} completed={completed} toggleComplete={toggleComplete} onSelectDay={openDay} weekNum={currentWeek} cyclingWeather={cyclingWeather} t={t} />}
        {view === 'plan' && <PlanView completed={completed} toggleComplete={toggleComplete} onSelectDay={openDay} currentWeek={currentWeek} cyclingWeather={cyclingWeather} t={t} />}
        {view === 'checkin' && <CheckInView checkins={checkins} onSave={saveCheckin} currentWeek={currentWeek} dueMeasurement={dueMeasurement} selectedMeasurementDate={selectedMeasurementDate} t={t} />}
        {view === 'insights' && <InsightsView logs={logs} checkins={checkins} completed={completed} settings={settings} adaptiveAdvice={adaptiveAdvice} t={t} />}
        {view === 'log' && <LogView logs={logs} settings={settings} setShowLogForm={setShowLogForm} deleteLog={deleteLog} onEditLog={(log) => { setEditingLog(log); setShowLogForm(true); }} t={t} />}
      </main>

      {selectedDay && <DayDetail day={selectedDay} onClose={() => setSelectedDay(null)} completed={completed} toggleComplete={toggleComplete} cyclingWeather={cyclingWeather} onRetryWeather={() => setWeatherRetry(n => n + 1)} logs={logs} userEmail={user.email} t={t} />}
      {showLogForm && <LogForm onSave={editingLog ? updateLog : saveLog} onClose={() => { setShowLogForm(false); setEditingLog(null); }} todayPlan={today} initialLog={editingLog} t={t} />}
      {showSettings && <SettingsDialog settings={settings} onSave={saveSettings} onClose={() => setShowSettings(false)} t={t} />}
      {showPasswordDialog && (
        <PasswordDialog
          t={t}
          isRecovery={forcePasswordUpdate}
          onClose={() => { setShowPasswordDialog(false); onPasswordUpdateHandled?.(); }}
        />
      )}

      <button type="button" aria-label={t('workoutLog')} className="fab" onClick={() => setShowLogForm(true)}>
        <Plus size={30} aria-hidden="true" />
      </button>
    </div>
  );
}

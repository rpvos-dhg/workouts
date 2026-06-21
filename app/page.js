'use client';

import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { Activity, BarChart3, BookOpen, Calendar, Dumbbell, Home as HomeIcon, KeyRound, LogOut, Map, MoreHorizontal, Plus, RefreshCw, Settings } from 'lucide-react';
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
import { ToastProvider, useToast } from './components/Toast';
import { ConfirmProvider, useConfirm } from './components/ConfirmDialog';
import { ErrorBoundary } from './components/ErrorBoundary';

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
    <ToastProvider>
      <ConfirmProvider>
        <ErrorBoundary label="Er ging iets mis in de app.">
          <App
            user={session.user}
            t={t}
            lang={lang}
            setLang={setLang}
            forcePasswordUpdate={forcePasswordUpdate}
            onPasswordUpdateHandled={() => setForcePasswordUpdate(false)}
          />
        </ErrorBoundary>
      </ConfirmProvider>
    </ToastProvider>
  );
}

function App({ user, t, lang, setLang, forcePasswordUpdate, onPasswordUpdateHandled }) {
  const toast = useToast();
  const confirm = useConfirm();
  const scrollPositions = useRef({});
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
    if (typeof document === 'undefined') return undefined;
    const onKey = (e) => {
      if (e.key !== 'Escape') return;
      if (showMenu) setShowMenu(false);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [showMenu]);

  useEffect(() => {
    sessionStorage.setItem('workouts-view', view);
  }, [view]);

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
    const onVisible = () => { if (document.visibilityState === 'visible') check(); };
    document.addEventListener('visibilitychange', onVisible);
    const id = setInterval(check, 5 * 60 * 1000);
    return () => { clearInterval(id); document.removeEventListener('visibilitychange', onVisible); };
  }, []);

  useEffect(() => {
    if (!updateAvailable) return;
    if (updateCountdown <= 0) {
      const formOpen = showLogForm || showSettings || showPasswordDialog || !!selectedDay;
      if (!formOpen) {
        window.location.reload();
      } else {
        setUpdateCountdown(60);
      }
      return;
    }
    const id = setTimeout(() => setUpdateCountdown(n => n - 1), 1000);
    return () => clearTimeout(id);
  }, [updateAvailable, updateCountdown, showLogForm, showSettings, showPasswordDialog, selectedDay]);

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
      .on('postgres_changes', { event: '*', schema: 'public', table: 'completions', filter: `user_id=eq.${user.id}` }, (payload) => {
        if (payload.eventType === 'INSERT' && payload.new?.day_id) {
          setCompleted(prev => ({ ...prev, [payload.new.day_id]: true }));
        } else if (payload.eventType === 'DELETE' && payload.old?.day_id) {
          setCompleted(prev => { const next = { ...prev }; delete next[payload.old.day_id]; return next; });
        } else {
          reloadCompletions();
        }
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'workout_logs', filter: `user_id=eq.${user.id}` }, (payload) => {
        if (payload.eventType === 'INSERT') {
          // Dedupe: the optimistic insert in saveLog may have already added this row.
          setLogs(prev => prev.some(l => l.id === payload.new.id) ? prev : [payload.new, ...prev].sort((a, b) => b.date.localeCompare(a.date)));
        } else if (payload.eventType === 'UPDATE') {
          setLogs(prev => prev.map(l => l.id === payload.new.id ? payload.new : l));
        } else if (payload.eventType === 'DELETE') {
          setLogs(prev => prev.filter(l => l.id !== payload.old?.id));
        }
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'daily_checkins', filter: `user_id=eq.${user.id}` }, (payload) => {
        if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
          setCheckins(prev => [payload.new, ...prev.filter(c => c.id !== payload.new.id)].sort((a, b) => b.date.localeCompare(a.date)));
        } else if (payload.eventType === 'DELETE') {
          setCheckins(prev => prev.filter(c => c.id !== payload.old?.id));
        }
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'user_settings', filter: `user_id=eq.${user.id}` }, (payload) => {
        if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
          setSettings(withDefaultSettings(payload.new || {}));
        }
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'daily_habits', filter: `user_id=eq.${user.id}` }, (payload) => {
        if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
          setHabits(prev => [payload.new, ...prev.filter(h => h.date !== payload.new.date)]);
        } else if (payload.eventType === 'DELETE') {
          setHabits(prev => prev.filter(h => h.id !== payload.old?.id));
        }
      })
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
    // Functional updates so rapid toggles and realtime events don't clobber each other via a stale closure.
    const wasComplete = !!completed[id];
    setCompleted(prev => {
      const next = { ...prev };
      if (wasComplete) delete next[id]; else next[id] = true;
      return next;
    });
    const { error } = wasComplete
      ? await supabase.from('completions').delete().eq('user_id', user.id).eq('day_id', id)
      : await supabase.from('completions').insert({ user_id: user.id, day_id: id });
    if (error) {
      setCompleted(prev => {
        const next = { ...prev };
        if (wasComplete) next[id] = true; else delete next[id];
        return next;
      });
      toast.error(error.message);
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
    if (error) { toast.error(error.message); }
    else if (data) { setLogs(prev => prev.some(l => l.id === data[0].id) ? prev : [data[0], ...prev]); toast.success(t('saved')); }
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
    if (error) { toast.error(error.message); }
    else if (data?.[0]) {
      setLogs(logs.map(item => item.id === editingLog.id ? data[0] : item));
      toast.success(t('saved'));
    }
    setSyncing(false);
    setEditingLog(null);
    setShowLogForm(false);
  };

  const deleteLog = async (id) => {
    const ok = await confirm({
      title: t('sureDelete'),
      message: t('deleteThisLog'),
      confirmLabel: t('deleteAction'),
      cancelLabel: t('cancel'),
      tone: 'danger',
    });
    if (!ok) return;
    const previous = logs;
    setLogs(logs.filter(l => l.id !== id));
    const { error } = await supabase.from('workout_logs').delete().eq('id', id);
    if (error) { setLogs(previous); toast.error(error.message); }
    else toast.success(t('logDeleted'));
  };

  const switchView = useCallback((newView) => {
    scrollPositions.current[view] = window.scrollY;
    setView(newView);
    requestAnimationFrame(() => {
      window.scrollTo(0, scrollPositions.current[newView] ?? 0);
    });
  }, [view]);

  const openMeasurement = (date) => {
    setSelectedMeasurementDate(date);
    setSelectedDay(null);
    switchView('checkin');
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
    const { data, error } = await supabase
      .from('daily_habits')
      .upsert(payload, { onConflict: 'user_id,date' })
      .select()
      .single();
    if (error) toast.error(error.message);
    else if (data) setHabits([data, ...habits.filter(item => item.date !== date)]);
  };

  const signOut = async () => { await supabase.auth.signOut(); };

  const todayString = useMemo(() => getTodayString(), []);
  const today = useMemo(() => PLAN_DATA.find(d => d.id === todayId) || PLAN_DATA[0], [todayId]);
  const currentWeek = today.week;
  const currentOverview = useMemo(() => getWeekOverview(currentWeek), [currentWeek]);
  const weekDays = useMemo(() => PLAN_DATA.filter(d => d.week === currentWeek), [currentWeek]);
  const completedCount = useMemo(() => Object.values(completed).filter(Boolean).length, [completed]);
  const totalCount = PLAN_DATA.length;
  const progressPct = useMemo(() => (completedCount / totalCount) * 100, [completedCount]);
  const streak = useMemo(() => {
    const past = PLAN_DATA.filter(d => d.date <= todayString).sort((a, b) => b.date.localeCompare(a.date));
    let count = 0;
    for (const d of past) {
      if (d.type === 'rest') continue;
      if (completed[d.id]) count++;
      // Today's workout being still open should not reset the streak earned on prior days.
      else if (d.date === todayString) continue;
      else break;
    }
    return count;
  }, [completed, todayString]);
  const dueMeasurement = useMemo(() => getDueMeasurementMoment(checkins, todayString), [checkins, todayString]);
  const todayHabit = useMemo(() => habits.find(item => item.date === todayString) || { date: todayString }, [habits, todayString]);
  const adaptiveAdvice = useMemo(() => getAdaptiveAdvice({ today, completed, logs, checkins, settings, todayString }), [today, completed, logs, checkins, settings, todayString]);
  const weatherTimezone = withDefaultSettings(settings).timezone;
  const weatherForecastEnd = useMemo(() => addDaysString(todayString, 13), [todayString]);
  const weatherCycleDays = useMemo(() => PLAN_DATA
    .filter(day => day.type === 'cycle' && day.date >= todayString && day.date <= weatherForecastEnd)
    .map(day => ({ date: day.date, durationMin: day.dur || 60 })), [todayString, weatherForecastEnd]);
  const weatherRequestKey = useMemo(() => weatherCycleDays.map(day => `${day.date}:${day.durationMin}`).join('|'), [weatherCycleDays]);

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
        // Cap automatic retries so a persistent failure can't loop forever (manual retry stays available).
        if (weatherRetry < 3) retryTimer = setTimeout(() => setWeatherRetry(n => n + 1), 5000);
      });
    return () => { controller.abort(); clearTimeout(retryTimer); };
  }, [weatherRequestKey, weatherTimezone, weatherRetry]);

  useEffect(() => {
    if (!dueMeasurement || typeof window === 'undefined' || !('Notification' in window)) return;
    if (Notification.permission !== 'granted') return;
    const storageKey = `measurement-notification-${dueMeasurement.key}-${dueMeasurement.date}`;
    if (window.localStorage.getItem(storageKey)) return;
    try {
      new Notification(`${t('navMeasure')}: ${dueMeasurement.title}`, {
        body: `${formatDateShort(dueMeasurement.date)} · ${t('openMeasurement').toLowerCase()}.`,
      });
      window.localStorage.setItem(storageKey, 'sent');
    } catch { /* ignore */ }
  }, [dueMeasurement, t]);

  return (
    <div className="app-shell">
      <a href="#main-content" className="skip-link">{t('skipToContent')}</a>
      <header className="app-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
          <div>
            <div style={{ fontSize: '12px', opacity: 0.86, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}>{t('weekOf', { week: currentWeek })}</div>
            <h1 style={{ fontFamily: 'var(--font-display), var(--font-body), sans-serif', fontSize: '24px', fontWeight: 800, margin: '4px 0 0', display: 'flex', alignItems: 'baseline', gap: '10px', letterSpacing: '-0.01em' }}>
              {t('appTitle')}
              <span style={{ fontSize: '11px', fontWeight: 600, opacity: 0.55, letterSpacing: '0.05em' }}>
                #{process.env.NEXT_PUBLIC_BUILD_ID || 'dev'}
              </span>
              {streak > 0 && (
                <span style={{ fontSize: '13px', fontWeight: 700, opacity: 0.9 }} title={t('streakHint', { days: streak })}>
                  🔥 {streak}
                </span>
              )}
            </h1>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <div style={{ background: 'rgba(255,255,255,0.16)', padding: '8px 14px', borderRadius: '999px', fontSize: '13px', fontWeight: 700 }}>
              {t('progressTotal', { done: completedCount, total: totalCount })}
            </div>
            <button type="button" aria-label={t('openMenu')} aria-expanded={showMenu} aria-haspopup="menu" onClick={() => setShowMenu(!showMenu)} style={{ background: 'rgba(255,255,255,0.16)', border: '1px solid rgba(255,255,255,0.18)', color: 'white', padding: '6px 12px', borderRadius: '999px', cursor: 'pointer', fontWeight: 600, minHeight: '40px', minWidth: '44px' }}>
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
        <div role="status" aria-live="polite" style={{ background: 'var(--success)', color: 'white', textAlign: 'center', padding: '12px 16px', fontSize: '14px', fontWeight: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', flexWrap: 'wrap' }}>
          <span>{t('updateAvailable', { seconds: updateCountdown })}</span>
          <button type="button" onClick={() => window.location.reload()} style={{ background: 'rgba(255,255,255,0.25)', border: '1px solid rgba(255,255,255,0.4)', color: 'white', padding: '6px 14px', borderRadius: '999px', cursor: 'pointer', fontSize: '13px', fontWeight: 700, minHeight: '36px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            <RefreshCw size={14} aria-hidden="true" /> {t('refreshNow')}
          </button>
        </div>
      )}

      {showMenu && (
        <div onClick={() => setShowMenu(false)} style={{ position: 'fixed', inset: 0, zIndex: 50, background: 'var(--overlay)', backdropFilter: 'blur(4px)', WebkitBackdropFilter: 'blur(4px)' }}>
          <div role="menu" aria-label={t('openMenu')} onClick={e => e.stopPropagation()} style={{ position: 'absolute', top: '70px', right: '20px', background: 'var(--surface)', borderRadius: 'var(--radius-lg)', padding: '8px', boxShadow: 'var(--shadow-lift)', border: '1px solid var(--line)', minWidth: '208px' }}>
            <button type="button" role="menuitem" autoFocus onClick={() => { setShowMenu(false); setShowSettings(true); }} style={menuItemStyle}>
              <Settings size={16} aria-hidden="true" style={{ marginRight: '10px', color: 'var(--accent)' }} />{t('settings')}
            </button>
            <a href="/docs" role="menuitem" onClick={() => setShowMenu(false)} style={{ ...menuItemStyle, display: 'flex', alignItems: 'center', textDecoration: 'none', boxSizing: 'border-box' }}>
              <BookOpen size={16} aria-hidden="true" style={{ marginRight: '10px', color: 'var(--accent)' }} />{t('documentation')}
            </a>
            <button type="button" role="menuitem" onClick={() => { setShowMenu(false); setShowPasswordDialog(true); }} style={menuItemStyle}>
              <KeyRound size={16} aria-hidden="true" style={{ marginRight: '10px', color: 'var(--accent)' }} />{t('changePassword')}
            </button>
            <button type="button" role="menuitem" onClick={() => { setShowMenu(false); signOut(); }} style={menuItemStyle}>
              <LogOut size={16} aria-hidden="true" style={{ marginRight: '10px', color: 'var(--accent)' }} />{t('logout')}
            </button>
            <div style={{ padding: '8px 8px 4px', borderTop: '1px solid var(--line)', marginTop: '4px' }}>
              <LanguageToggle t={t} lang={lang} setLang={setLang} onChange={() => setShowMenu(false)} />
            </div>
          </div>
        </div>
      )}

      <nav className="app-nav" aria-label={t('mainNav')}>
        {[
          { key: 'today',    label: t('navToday'),                       Icon: HomeIcon },
          { key: 'week',     label: t('navWeek', { week: currentWeek }), Icon: Calendar },
          { key: 'plan',     label: t('navPlan'),                        Icon: Map },
          { key: 'checkin',  label: t('navMeasure'),                     Icon: Activity, badge: !!dueMeasurement },
          { key: 'insights', label: t('navInsights'),                    Icon: BarChart3 },
          { key: 'log',      label: t('navLog'),                         Icon: Dumbbell },
        ].map(({ key, label, Icon, badge }) => (
          <button
            key={key}
            type="button"
            aria-current={view === key ? 'page' : undefined}
            aria-label={badge ? `${label} — ${t('measurementDueShort')}` : undefined}
            onClick={() => switchView(key)}
            className={`app-nav-btn${view === key ? ' app-nav-btn--active' : ''}`}
          >
            <span className="nav-icon" style={{ position: 'relative' }} aria-hidden="true">
              <Icon size={20} />
              {badge && <span style={{ position: 'absolute', top: '-3px', right: '-5px', width: '8px', height: '8px', borderRadius: '50%', background: 'var(--action)', border: '2px solid var(--bg)' }} />}
            </span>
            <span className="nav-label">{label}</span>
          </button>
        ))}
      </nav>

      <DashboardStrip today={today} overview={currentOverview} progressPct={progressPct} dueMeasurement={dueMeasurement} t={t} />

      {dueMeasurement && (
        <div className="banner-wrap">
          <MeasurementBanner moment={dueMeasurement} onOpen={() => openMeasurement(dueMeasurement.date)} t={t} />
        </div>
      )}

      <main id="main-content" className="view-main" style={{ padding: '20px 16px' }}>
        <ErrorBoundary>
          {view === 'today' && <TodayView day={today} completed={completed} toggleComplete={toggleComplete} overview={currentOverview} onOpenMeasurement={openMeasurement} habit={todayHabit} saveDailyHabit={saveDailyHabit} adaptiveAdvice={adaptiveAdvice} settings={settings} cyclingWeather={cyclingWeather} onRetryWeather={() => setWeatherRetry(n => n + 1)} logs={logs} userEmail={user.email} t={t} />}
          {view === 'week' && <WeekView days={weekDays} completed={completed} toggleComplete={toggleComplete} onSelectDay={openDay} weekNum={currentWeek} cyclingWeather={cyclingWeather} t={t} />}
          {view === 'plan' && <PlanView completed={completed} toggleComplete={toggleComplete} onSelectDay={openDay} currentWeek={currentWeek} cyclingWeather={cyclingWeather} t={t} />}
          {view === 'checkin' && <CheckInView checkins={checkins} onSave={saveCheckin} currentWeek={currentWeek} dueMeasurement={dueMeasurement} selectedMeasurementDate={selectedMeasurementDate} t={t} />}
          {view === 'insights' && <InsightsView logs={logs} checkins={checkins} completed={completed} settings={settings} adaptiveAdvice={adaptiveAdvice} t={t} />}
          {view === 'log' && <LogView logs={logs} settings={settings} setShowLogForm={setShowLogForm} deleteLog={deleteLog} onEditLog={(log) => { setEditingLog(log); setShowLogForm(true); }} t={t} />}
        </ErrorBoundary>
      </main>

      {selectedDay && <DayDetail day={selectedDay} onClose={() => setSelectedDay(null)} completed={completed} toggleComplete={toggleComplete} cyclingWeather={cyclingWeather} onRetryWeather={() => setWeatherRetry(n => n + 1)} logs={logs} userEmail={user.email} t={t} />}
      {showLogForm && <LogForm onSave={editingLog ? updateLog : saveLog} onClose={() => { setShowLogForm(false); setEditingLog(null); }} todayPlan={today} initialLog={editingLog} settings={settings} t={t} />}
      {showSettings && <SettingsDialog settings={settings} onSave={saveSettings} onClose={() => setShowSettings(false)} t={t} />}
      {showPasswordDialog && (
        <PasswordDialog
          t={t}
          isRecovery={forcePasswordUpdate}
          onClose={() => { setShowPasswordDialog(false); onPasswordUpdateHandled?.(); }}
        />
      )}

      <button type="button" aria-label={t('fabAddWorkout')} className="fab" onClick={() => setShowLogForm(true)}>
        <Plus size={30} aria-hidden="true" />
      </button>
    </div>
  );
}

const menuItemStyle = {
  width: '100%',
  padding: '12px 14px',
  border: 'none',
  background: 'transparent',
  textAlign: 'left',
  fontSize: '14px',
  cursor: 'pointer',
  borderRadius: 'var(--radius)',
  color: 'var(--ink)',
  fontWeight: 600,
  minHeight: '44px',
  display: 'flex',
  alignItems: 'center',
};

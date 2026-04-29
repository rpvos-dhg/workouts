'use client';

import { useState, useEffect } from 'react';
import {
  Activity,
  BarChart3,
  Bed,
  Bike,
  CheckCircle2,
  Clock3,
  Dumbbell,
  Flame,
  Footprints,
  Gauge,
  HeartPulse,
  LogOut,
  MoreHorizontal,
  Plus,
  Star,
  Target,
  Trash2,
  Trophy,
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { PLAN_DATA, TYPE_META } from '../lib/plan-data';
import {
  END_GOALS,
  HEART_ZONES,
  MEASUREMENT_MOMENTS,
  NUTRITION_GUIDE,
  PERFORMANCE_REFERENCES,
  PRACTICAL_TIPS,
  STRENGTH_GUIDE,
  getDueMeasurementMoment,
  getMeasurementMomentByDate,
  getMeasurementTitle,
  getSuggestedMeasurementMoment,
  getWeekOverview,
  isMeasurementCheckin,
} from '../lib/plan-content';

const TYPE_ICONS = {
  cycle: Bike,
  strength: Dumbbell,
  walk: Footprints,
  rest: Bed,
  check: BarChart3,
  goal: Trophy,
};

const I18N = {
  nl: {
    loading: 'Laden...',
    appTitle: '6-Weken Plan',
    createAccount: 'Maak een account',
    loginToStart: 'Log in om te starten',
    email: 'E-mail',
    password: 'Wachtwoord',
    minPassword: 'Minimaal 6 tekens.',
    passwordPlaceholder: 'Wachtwoord (min 6 tekens)',
    busy: 'Bezig...',
    signUp: 'Maak account',
    signIn: 'Inloggen',
    confirmEmail: 'Check je mail voor bevestigingslink!',
    noAccount: 'Nog geen account? Maak er een',
    hasAccount: 'Heb je al een account? Inloggen',
    language: 'Taal',
    dutch: 'NL',
    english: 'EN',
    weekOf: 'Week {week} van 6',
    logout: 'Uitloggen',
    openMenu: 'Menu openen',
    workoutLog: 'Workout loggen',
    navToday: 'Vandaag',
    navWeek: 'Wk {week}',
    navPlan: 'Plan',
    navMeasure: 'Meet',
    navLog: 'Log',
    sync: 'Synchroniseren...',
    progressLabel: '{progress} procent voltooid',
    completedPct: '{progress}% voltooid',
    today: 'Vandaag',
    noDuration: 'Geen duur',
    weekFocus: 'Weekfocus',
    longRide: 'lange rit',
    status: 'Status',
    noOpenMeasurement: 'Geen open meetmoment',
    openMeasurement: 'Open meetmoment',
    completed: 'Voltooid',
    markComplete: 'Markeer voltooid',
    dayGoals: 'Dagdoelen',
    protein: 'Eiwit',
    water: 'Water',
    rememberToday: 'Vandaag niet vergeten',
    proteinReminder: '130g eiwit (verdeel over 4-5 momenten)',
    waterReminder: '2L water',
    kcalTarget: '{kcal} kcal target',
    postTrainingProtein: '25-30g eiwit binnen 1u na training',
    longRideSnack: 'Snack + water mee voor lange rit',
    week6Recovery: 'Extra zout + water, herstel prioriteit',
    measurementOpen: 'MEETMOMENT STAAT OPEN',
    measurementToday: 'MEETMOMENT VANDAAG',
    open: 'Open',
    weekPlanning: 'Weekplanning',
    daysCompleted: '{done}/{total} dagen voltooid',
    days: 'Dagen',
    zones: 'Zones',
    nutrition: 'Voeding',
    strength: 'Kracht',
    tips: 'Tips',
    weekFocusLabel: 'Week {week} focus',
    period: 'Periode',
    heartZones: 'Hartslagzones',
    heartZonesSub: 'Hartslag is leidend; snelheid is referentie.',
    yourReference: 'Jouw referentie',
    referenceSub: 'Waarom deze snelheden realistisch zijn.',
    nutritionSub: '{kcal} kcal deze week, 130g eiwit per dag.',
    proteinSources: 'Eiwitbronnen',
    sampleDay: 'Voorbeelddag',
    strengthTraining: 'Krachttraining',
    schemaA: 'Schema A - woensdag',
    schemaB: 'Schema B - zondag',
    explanation: 'Uitleg {source}',
    execution: 'Uitvoering',
    realisticEnd: 'Reeel eindbeeld',
    notCompleted: 'Niet voltooid',
    markIncomplete: 'Markeer als niet voltooid',
    completeDay: 'Voltooi deze dag',
    planSections: 'Plansecties',
    plannedMeasurements: 'Geplande meetmomenten',
    alarmSignals: '{count} alarmsignalen',
    adviceWeek6: '2+ signalen: herstel prioriteit, houd 2700 kcal aan en push niet.',
    adviceBackOff: '2+ signalen: schakel terug naar ongeveer 2550 kcal en push niet.',
    adviceOk: 'Onder de drempel: houd het plan aan tot het volgende meetmoment.',
    weekGoal: 'Weekdoel: {kcal} kcal, 130g eiwit',
    notificationUnsupported: 'Browsermeldingen worden hier niet ondersteund',
    notificationOn: 'Melding aan: zolang de app open is krijg je een signaal bij een meetmoment',
    notificationOff: 'Melding niet aangezet',
    enableMeasurementNotification: 'Meetmoment-melding aanzetten',
    measurementSaved: 'Meetmoment opgeslagen',
    weight: 'Gewicht (kg)',
    waist: 'Buikomtrek (cm)',
    sleep: 'Slaap (uren)',
    restingHr: 'Rusthartslag',
    energy: 'Energie (1-5)',
    mood: 'Stemming (1-5)',
    soreness: 'Spierpijn (uren)',
    hunger: 'Honger (1-5)',
    hrvLow: 'HRV 3 dagen meer dan 20% laag',
    notes: 'Notities',
    howFeel: 'Hoe voel je je?',
    saveMeasurement: 'Meetmoment opslaan',
    later: 'Later',
    now: 'Nu',
    saved: 'Opgeslagen',
    history: 'Historie',
    noMeasurements: 'Nog geen meetmomenten opgeslagen.',
    sleepShort: '{hours}u slaap',
    alarmRestingHr: 'Rusthartslag +5 bpm',
    alarmSleep: 'Slaap < 7 uur',
    alarmMood: 'Lage stemming',
    alarmSoreness: 'Spierpijn > 72u',
    alarmHunger: 'Constante honger',
    alarmHrv: 'HRV 3 dagen laag',
    yourStats: 'JOUW STATS',
    workoutsLogged: 'Workouts gelogd',
    avgSpeed: 'Gem. snelheid',
    avgHr: 'Gem. HR',
    cycleRides: 'Fiets ritten',
    noWorkouts: 'Nog geen workouts gelogd',
    noWorkoutsHelp: 'Tik op de + knop om je eerste Apple Watch workout in te voeren.',
    deleteLog: 'Log verwijderen',
    deleteConfirm: 'Verwijder deze log?',
    durationRequired: 'Vul minstens duur in',
    logSubtitle: 'Voer in van je Apple Watch. Krijg direct inzicht hoe het past bij je plan.',
    date: 'Datum',
    type: 'Type',
    cycle: 'Fiets',
    walk: 'Wandelen',
    rest: 'Rust',
    check: 'Meten',
    measure: 'Meten',
    goal: 'Doel',
    duration: 'Duur (min) *',
    distance: 'Afstand (km)',
    avgHrFull: 'Gemiddelde HR (bpm)',
    maxHr: 'Max HR (bpm)',
    calories: 'Calorieën',
    optionalNotes: 'Notities (optioneel)',
    workoutNotesPlaceholder: 'Hoe voelde het? Wind? Stops?',
    analysis: 'ANALYSE',
    expected: '{speed} km/h verwacht',
    verdictPerfect: 'Perfect, in lijn met je plan',
    verdictStrong: 'Sneller dan verwacht - sterker dan plan',
    verdictSlow: 'Trager dan verwacht - wind, vermoeidheid, of fiets-issue?',
    verdictSlightlyLow: 'Iets onder verwachting, prima',
    cancel: 'Annuleren',
    save: 'Opslaan',
  },
  en: {
    loading: 'Loading...',
    appTitle: '6-Week Plan',
    createAccount: 'Create an account',
    loginToStart: 'Log in to start',
    email: 'Email',
    password: 'Password',
    minPassword: 'At least 6 characters.',
    passwordPlaceholder: 'Password (min 6 chars)',
    busy: 'Working...',
    signUp: 'Create account',
    signIn: 'Log in',
    confirmEmail: 'Check your email for the confirmation link.',
    noAccount: 'No account yet? Create one',
    hasAccount: 'Already have an account? Log in',
    language: 'Language',
    dutch: 'NL',
    english: 'EN',
    weekOf: 'Week {week} of 6',
    logout: 'Log out',
    openMenu: 'Open menu',
    workoutLog: 'Log workout',
    navToday: 'Today',
    navWeek: 'Wk {week}',
    navPlan: 'Plan',
    navMeasure: 'Measure',
    navLog: 'Log',
    sync: 'Syncing...',
    progressLabel: '{progress} percent complete',
    completedPct: '{progress}% complete',
    today: 'Today',
    noDuration: 'No duration',
    weekFocus: 'Week focus',
    longRide: 'long ride',
    status: 'Status',
    noOpenMeasurement: 'No open measurement',
    openMeasurement: 'Open measurement',
    completed: 'Completed',
    markComplete: 'Mark complete',
    dayGoals: 'Day goals',
    protein: 'Protein',
    water: 'Water',
    rememberToday: 'Do not forget today',
    proteinReminder: '130g protein, spread across 4-5 moments',
    waterReminder: '2L water',
    kcalTarget: '{kcal} kcal target',
    postTrainingProtein: '25-30g protein within 1h after training',
    longRideSnack: 'Bring snack + water for long rides',
    week6Recovery: 'Extra salt + water, recovery first',
    measurementOpen: 'MEASUREMENT OPEN',
    measurementToday: 'MEASUREMENT TODAY',
    open: 'Open',
    weekPlanning: 'Week planning',
    daysCompleted: '{done}/{total} days complete',
    days: 'Days',
    zones: 'Zones',
    nutrition: 'Nutrition',
    strength: 'Strength',
    tips: 'Tips',
    weekFocusLabel: 'Week {week} focus',
    period: 'Period',
    heartZones: 'Heart-rate zones',
    heartZonesSub: 'Heart rate is leading; speed is a reference.',
    yourReference: 'Your reference',
    referenceSub: 'Why these speeds are realistic.',
    nutritionSub: '{kcal} kcal this week, 130g protein per day.',
    proteinSources: 'Protein sources',
    sampleDay: 'Sample day',
    strengthTraining: 'Strength training',
    schemaA: 'Program A - Wednesday',
    schemaB: 'Program B - Sunday',
    explanation: 'Guide {source}',
    execution: 'How to do it',
    realisticEnd: 'Realistic end state',
    notCompleted: 'Not completed',
    markIncomplete: 'Mark incomplete',
    completeDay: 'Complete this day',
    planSections: 'Plan sections',
    plannedMeasurements: 'Planned measurements',
    alarmSignals: '{count} warning signals',
    adviceWeek6: '2+ signals: prioritize recovery, keep 2700 kcal and do not push.',
    adviceBackOff: '2+ signals: move back toward about 2550 kcal and do not push.',
    adviceOk: 'Below threshold: keep following the plan until the next measurement.',
    weekGoal: 'Week target: {kcal} kcal, 130g protein',
    notificationUnsupported: 'Browser notifications are not supported here',
    notificationOn: 'Notifications on: while the app is open you will get a measurement signal',
    notificationOff: 'Notification not enabled',
    enableMeasurementNotification: 'Enable measurement reminder',
    measurementSaved: 'Measurement saved',
    weight: 'Weight (kg)',
    waist: 'Waist (cm)',
    sleep: 'Sleep (hours)',
    restingHr: 'Resting HR',
    energy: 'Energy (1-5)',
    mood: 'Mood (1-5)',
    soreness: 'Soreness (hours)',
    hunger: 'Hunger (1-5)',
    hrvLow: 'HRV 3 days more than 20% low',
    notes: 'Notes',
    howFeel: 'How do you feel?',
    saveMeasurement: 'Save measurement',
    later: 'Later',
    now: 'Now',
    saved: 'Saved',
    history: 'History',
    noMeasurements: 'No measurements saved yet.',
    sleepShort: '{hours}h sleep',
    alarmRestingHr: 'Resting HR +5 bpm',
    alarmSleep: 'Sleep < 7 hours',
    alarmMood: 'Low mood',
    alarmSoreness: 'Soreness > 72h',
    alarmHunger: 'Constant hunger',
    alarmHrv: 'HRV low for 3 days',
    yourStats: 'YOUR STATS',
    workoutsLogged: 'Workouts logged',
    avgSpeed: 'Avg. speed',
    avgHr: 'Avg. HR',
    cycleRides: 'Bike rides',
    noWorkouts: 'No workouts logged yet',
    noWorkoutsHelp: 'Tap the + button to enter your first Apple Watch workout.',
    deleteLog: 'Delete log',
    deleteConfirm: 'Delete this log?',
    durationRequired: 'Enter at least duration',
    logSubtitle: 'Enter data from your Apple Watch. See how it fits your plan.',
    date: 'Date',
    type: 'Type',
    cycle: 'Bike',
    walk: 'Walk',
    rest: 'Rest',
    check: 'Measure',
    measure: 'Measure',
    goal: 'Goal',
    duration: 'Duration (min) *',
    distance: 'Distance (km)',
    avgHrFull: 'Average HR (bpm)',
    maxHr: 'Max HR (bpm)',
    calories: 'Calories',
    optionalNotes: 'Notes (optional)',
    workoutNotesPlaceholder: 'How did it feel? Wind? Stops?',
    analysis: 'ANALYSIS',
    expected: '{speed} km/h expected',
    verdictPerfect: 'Perfect, aligned with your plan',
    verdictStrong: 'Faster than expected - stronger than plan',
    verdictSlow: 'Slower than expected - wind, fatigue, or bike issue?',
    verdictSlightlyLow: 'Slightly below expectation, fine',
    cancel: 'Cancel',
    save: 'Save',
  },
};

function formatText(text, values = {}) {
  return String(text).replace(/\{(\w+)\}/g, (_, key) => values[key] ?? '');
}

function makeT(lang) {
  return (key, values) => formatText(I18N[lang]?.[key] ?? I18N.nl[key] ?? key, values);
}

export default function Home() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lang, setLang] = useState('nl');

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
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) return <Loading t={t} />;
  if (!session) return <Auth t={t} lang={lang} setLang={setLang} />;
  return <App user={session.user} t={t} lang={lang} setLang={setLang} />;
}

function Loading({ t }) {
  return (
    <div role="status" aria-live="polite" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ color: 'var(--accent-strong)', fontSize: '16px', fontWeight: 700 }}>{t('loading')}</div>
    </div>
  );
}

function Auth({ t, lang, setLang }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mode, setMode] = useState('signin');
  const [msg, setMsg] = useState('');
  const [busy, setBusy] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setBusy(true);
    setMsg('');
    try {
      if (mode === 'signup') {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        setMsg(t('confirmEmail'));
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
          <div aria-hidden="true" className="brand-mark">
            <Bike size={30} strokeWidth={2.4} />
          </div>
          <h1 style={{ margin: 0, fontFamily: 'var(--font-display), var(--font-body), sans-serif', fontSize: '25px', fontWeight: 800, color: 'var(--accent-strong)' }}>{t('appTitle')}</h1>
          <p style={{ margin: '6px 0 0', fontSize: '14px', color: 'var(--muted)' }}>
            {mode === 'signup' ? t('createAccount') : t('loginToStart')}
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <Field label={t('email')} htmlFor="auth-email">
          <input
            id="auth-email"
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder={t('email')}
            autoComplete="email"
            required
            style={inputStyle}
          />
          </Field>
          <Field label={t('password')} htmlFor="auth-password" help={mode === 'signup' ? t('minPassword') : undefined}>
          <input
            id="auth-password"
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder={t('passwordPlaceholder')}
            autoComplete={mode === 'signup' ? 'new-password' : 'current-password'}
            required
            minLength={6}
            style={inputStyle}
          />
          </Field>
          <button
            type="submit"
            disabled={busy}
            style={{
              width: '100%',
              padding: '14px',
              borderRadius: '8px',
              border: 'none',
              background: busy ? '#7b8791' : 'var(--accent)',
              color: 'white',
              fontSize: '15px',
              fontWeight: 700,
              cursor: busy ? 'not-allowed' : 'pointer',
            }}
          >
            {busy ? t('busy') : mode === 'signup' ? t('signUp') : t('signIn')}
          </button>
        </form>

        {msg && (
          <div role="status" aria-live="polite" style={{
            marginTop: '14px',
            padding: '12px',
            borderRadius: '8px',
            background: msg === t('confirmEmail') ? '#e7f6ef' : '#fdeaea',
            color: msg === t('confirmEmail') ? 'var(--success)' : 'var(--danger)',
            fontSize: '13px',
            textAlign: 'center',
            fontWeight: 700,
          }}>{msg}</div>
        )}

        <button
          onClick={() => { setMode(mode === 'signin' ? 'signup' : 'signin'); setMsg(''); }}
          style={{
            width: '100%',
            padding: '12px',
            border: 'none',
            background: 'transparent',
            color: 'var(--accent-strong)',
            fontSize: '13px',
            cursor: 'pointer',
            marginTop: '8px',
          }}
        >
          {mode === 'signin' ? t('noAccount') : t('hasAccount')}
        </button>
      </div>
    </main>
  );
}

function LanguageToggle({ t, lang, setLang }) {
  return (
    <div role="group" aria-label={t('language')} style={{
      display: 'inline-flex',
      gap: '3px',
      padding: '3px',
      border: '1px solid var(--line)',
      borderRadius: '999px',
      background: 'rgba(255,255,255,0.78)',
    }}>
      {[
        ['nl', t('dutch')],
        ['en', t('english')],
      ].map(([key, label]) => (
        <button
          key={key}
          type="button"
          onClick={() => setLang(key)}
          aria-pressed={lang === key}
          style={{
            minHeight: '32px',
            padding: '5px 10px',
            border: 'none',
            borderRadius: '999px',
            background: lang === key ? 'var(--accent)' : 'transparent',
            color: lang === key ? 'white' : 'var(--muted)',
            fontSize: '12px',
            fontWeight: 800,
            cursor: 'pointer',
          }}
        >
          {label}
        </button>
      ))}
    </div>
  );
}

function App({ user, t, lang, setLang }) {
  const [completed, setCompleted] = useState({});
  const [logs, setLogs] = useState([]);
  const [checkins, setCheckins] = useState([]);
  const [view, setView] = useState('today');
  const [todayId, setTodayId] = useState(1);
  const [selectedDay, setSelectedDay] = useState(null);
  const [selectedMeasurementDate, setSelectedMeasurementDate] = useState(null);
  const [showLogForm, setShowLogForm] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [syncing, setSyncing] = useState(false);

  // Load data from Supabase
  useEffect(() => {
    const load = async () => {
      const [{ data: completionsData }, { data: logsData }, { data: checkinData }] = await Promise.all([
        supabase.from('completions').select('*').eq('user_id', user.id),
        supabase.from('workout_logs').select('*').eq('user_id', user.id).order('date', { ascending: false }),
        supabase.from('daily_checkins').select('*').eq('user_id', user.id).order('date', { ascending: false }),
      ]);

      const compMap = {};
      (completionsData || []).forEach(c => { compMap[c.day_id] = true; });
      setCompleted(compMap);
      setLogs(logsData || []);
      setCheckins(checkinData || []);
    };
    load();
  }, [user.id]);

  // Realtime subscription
  useEffect(() => {
    const channel = supabase
      .channel('app-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'completions', filter: `user_id=eq.${user.id}` },
        () => reloadCompletions())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'workout_logs', filter: `user_id=eq.${user.id}` },
        () => reloadLogs())
      .on('postgres_changes', { event: '*', schema: 'public', table: 'daily_checkins', filter: `user_id=eq.${user.id}` },
        () => reloadCheckins())
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

  // Find today
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

  const saveLog = async (log) => {
    setSyncing(true);
    const { data, error } = await supabase.from('workout_logs').insert({
      user_id: user.id,
      date: log.date,
      type: log.type,
      duration: parseFloat(log.duration) || null,
      distance: parseFloat(log.distance) || null,
      avg_hr: parseInt(log.avgHR) || null,
      max_hr: parseInt(log.maxHR) || null,
      kcal: parseInt(log.kcal) || null,
      notes: log.notes || null,
    }).select();
    if (!error && data) setLogs([data[0], ...logs]);
    setSyncing(false);
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
    if (day.type === 'check') {
      openMeasurement(day.date);
      return;
    }
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

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const today = PLAN_DATA.find(d => d.id === todayId) || PLAN_DATA[0];
  const currentWeek = today.week;
  const currentOverview = getWeekOverview(currentWeek);
  const weekDays = PLAN_DATA.filter(d => d.week === currentWeek);
  const completedCount = Object.values(completed).filter(Boolean).length;
  const totalCount = PLAN_DATA.length;
  const progressPct = (completedCount / totalCount) * 100;
  const todayString = getTodayString();
  const dueMeasurement = getDueMeasurementMoment(checkins, todayString);

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
            <div style={{ fontFamily: 'var(--font-display), var(--font-body), sans-serif', fontSize: '24px', fontWeight: 800, marginTop: '4px' }}>{t('appTitle')}</div>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <div style={{
              background: 'rgba(255,255,255,0.16)', padding: '8px 12px',
              borderRadius: '999px', fontSize: '13px', fontWeight: 700,
            }}>
              {completedCount}/{totalCount}
            </div>
            <button type="button" aria-label={t('openMenu')} aria-expanded={showMenu} onClick={() => setShowMenu(!showMenu)} style={{
              background: 'rgba(255,255,255,0.16)', border: '1px solid rgba(255,255,255,0.18)', color: 'white',
              padding: '6px 12px', borderRadius: '999px',
              cursor: 'pointer', fontWeight: 600,
            }}><MoreHorizontal size={18} aria-hidden="true" /></button>
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

      {showMenu && (
        <div onClick={() => setShowMenu(false)} style={{
          position: 'fixed', inset: 0, zIndex: 50, background: 'rgba(0,0,0,0.3)',
        }}>
          <div onClick={e => e.stopPropagation()} style={{
            position: 'absolute', top: '70px', right: '20px', background: 'white',
            borderRadius: '12px', padding: '8px', boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
            minWidth: '180px',
          }}>
            <button type="button" onClick={() => { setShowMenu(false); signOut(); }} style={{
              width: '100%', padding: '12px 16px', border: 'none', background: 'transparent',
              textAlign: 'left', fontSize: '14px', cursor: 'pointer', borderRadius: '8px',
            }}><LogOut size={16} aria-hidden="true" style={{ verticalAlign: '-3px', marginRight: '8px' }} />{t('logout')}</button>
            <div style={{ padding: '8px 8px 4px' }}>
              <LanguageToggle t={t} lang={lang} setLang={setLang} />
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
          { key: 'log', label: t('navLog') },
        ].map(t => (
          <button key={t.key} type="button" aria-current={view === t.key ? 'page' : undefined} onClick={() => setView(t.key)} style={{
            flex: 1, padding: '10px', border: 'none',
            background: view === t.key ? 'var(--accent)' : 'transparent',
            color: view === t.key ? 'white' : 'var(--muted)',
            borderRadius: '8px', fontSize: '14px',
            fontWeight: 700, cursor: 'pointer',
          }}>{t.label}</button>
        ))}
      </nav>

      <DashboardStrip
        today={today}
        overview={currentOverview}
        progressPct={progressPct}
        dueMeasurement={dueMeasurement}
        t={t}
      />

      {dueMeasurement && (
        <div style={{ padding: '16px 16px 0' }}>
          <MeasurementBanner moment={dueMeasurement} onOpen={() => openMeasurement(dueMeasurement.date)} t={t} />
        </div>
      )}

      <main className="view-main" style={{ padding: '20px 16px' }}>
        {view === 'today' && <TodayView day={today} completed={completed} toggleComplete={toggleComplete} overview={currentOverview} onOpenMeasurement={openMeasurement} t={t} />}
        {view === 'week' && <WeekView days={weekDays} completed={completed} toggleComplete={toggleComplete} onSelectDay={openDay} weekNum={currentWeek} t={t} />}
        {view === 'plan' && <PlanView completed={completed} toggleComplete={toggleComplete} onSelectDay={openDay} currentWeek={currentWeek} t={t} />}
        {view === 'checkin' && <CheckInView checkins={checkins} onSave={saveCheckin} currentWeek={currentWeek} dueMeasurement={dueMeasurement} selectedMeasurementDate={selectedMeasurementDate} t={t} />}
        {view === 'log' && <LogView logs={logs} setShowLogForm={setShowLogForm} deleteLog={deleteLog} t={t} />}
      </main>

      {selectedDay && <DayDetail day={selectedDay} onClose={() => setSelectedDay(null)} completed={completed} toggleComplete={toggleComplete} t={t} />}
      {showLogForm && <LogForm onSave={saveLog} onClose={() => setShowLogForm(false)} todayPlan={today} t={t} />}

      <button type="button" aria-label={t('workoutLog')} className="fab" onClick={() => setShowLogForm(true)}><Plus size={30} aria-hidden="true" /></button>
    </div>
  );
}

function DashboardStrip({ today, overview, progressPct, dueMeasurement, t }) {
  const meta = TYPE_META[today.type];
  const measurementLabel = dueMeasurement
    ? `${formatDateShort(dueMeasurement.date)} - ${dueMeasurement.title}`
    : t('noOpenMeasurement');

  return (
    <section className="dashboard-strip" aria-label="Trainingsdashboard">
      <div className="signal-card">
        <div className="signal-kicker">{t('today')}</div>
        <div className="signal-value">{t(today.type) || meta.label}: {today.title}</div>
        <div className="signal-note">
          {today.dur > 0 ? `${today.dur} min` : t('noDuration')}{today.hr ? ` · HR ${today.hr}` : ''}{today.target ? ` · ${today.target}` : ''}
        </div>
      </div>
      <div className="signal-card">
        <div className="signal-kicker">{t('weekFocus')}</div>
        <div className="signal-value">{overview.focus}</div>
        <div className="signal-note">{overview.kcal} kcal · 130g {t('protein').toLowerCase()} · {t('longRide')} {overview.longRide}</div>
      </div>
      <div className="signal-card">
        <div className="signal-kicker">{t('status')}</div>
        <div className="signal-value">{t('completedPct', { progress: Math.round(progressPct) })}</div>
        <div className="signal-note">{measurementLabel}</div>
      </div>
    </section>
  );
}

function TodayView({ day, completed, toggleComplete, overview, onOpenMeasurement, t }) {
  const meta = TYPE_META[day.type];
  const isComplete = !!completed[day.id];
  const measurementMoment = day.type === 'check' ? getMeasurementMomentByDate(day.date) : null;
  const title = measurementMoment?.title || day.title;

  return (
    <div className="dashboard-grid">
      <div className="info-card hero-card" style={{
        background: 'var(--surface)', borderRadius: '12px', padding: '24px',
        border: `2px solid ${isComplete ? 'var(--success)' : meta.color}`,
      }}>
        <div style={{ marginBottom: '16px' }}>
          <div style={{ fontSize: '12px', color: meta.color, fontWeight: 800, textTransform: 'uppercase' }}>
            {day.day.toUpperCase()} {new Date(day.date).toLocaleDateString('nl-NL', { day: 'numeric', month: 'long' }).toUpperCase()}
          </div>
          <div style={{ fontFamily: 'var(--font-display), var(--font-body), sans-serif', fontSize: '26px', fontWeight: 800, marginTop: '4px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <IconBadge type={day.type} color={meta.color} bg={meta.bg} size={48} iconSize={26} />
            {title}
          </div>
        </div>

        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '16px' }}>
          {day.dur > 0 && <Tag icon={Clock3} label={`${day.dur} min`} bg={meta.bg} color={meta.color} />}
          {day.hr && <Tag icon={HeartPulse} label={`HR ${day.hr}`} bg="#FFE5E5" color="#DC3545" />}
          {day.speed && <Tag icon={Gauge} label={day.speed} bg="#E5F0FF" color="#003D7A" />}
          {day.target && <Tag icon={Target} label={day.target} bg="#FFF4DD" color="#B86E00" />}
        </div>

        {day.desc && (
          <div style={{ fontSize: '15px', color: 'var(--muted)', lineHeight: 1.5, marginBottom: '20px' }}>
            {day.desc}
          </div>
        )}
        {measurementMoment && (
          <div style={{ fontSize: '15px', color: 'var(--muted)', lineHeight: 1.5, marginBottom: '20px' }}>
            <div style={{ fontWeight: 700, marginBottom: '6px' }}>{measurementMoment.focus}</div>
            <SimpleList items={measurementMoment.items} />
            <button type="button" onClick={() => onOpenMeasurement(day.date)} style={{
              width: '100%', marginTop: '14px', padding: '12px', borderRadius: '8px',
              border: 'none', background: 'var(--accent)', color: 'white', fontSize: '15px',
              fontWeight: 700, cursor: 'pointer',
            }}>
              {t('openMeasurement')}
            </button>
          </div>
        )}

        <button type="button" onClick={() => toggleComplete(day.id)} style={{
          width: '100%', padding: '14px', borderRadius: '8px', border: 'none',
          background: isComplete ? 'var(--success)' : meta.color,
          color: 'white', fontSize: '16px', fontWeight: 600, cursor: 'pointer',
        }}>{isComplete ? t('completed') : t('markComplete')}</button>
      </div>

      <div className="side-panel">
        <div className="premium-card" style={{ borderRadius: '12px', padding: '18px' }}>
          <div style={{ fontSize: '11px', opacity: 0.78, fontWeight: 800, textTransform: 'uppercase', marginBottom: '10px' }}>
            {t('dayGoals')}
          </div>
          <div className="metric-grid">
            <MetricTile icon={Flame} label="Kcal" value={overview.kcal} />
            <MetricTile icon={Dumbbell} label={t('protein')} value="130g" />
            <MetricTile icon={Activity} label={t('water')} value="2L" />
          </div>
        </div>

        <div className="info-card" style={{
          background: 'var(--surface)', borderRadius: '12px',
          padding: '18px',
        }}>
          <div style={{ fontSize: '11px', color: 'var(--muted)', fontWeight: 800, textTransform: 'uppercase', marginBottom: '10px' }}>
            {t('rememberToday')}
          </div>
          <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '14px', color: 'var(--muted)', lineHeight: 1.7 }}>
            <li>{t('proteinReminder')}</li>
            <li>{t('waterReminder')}</li>
            <li>{t('kcalTarget', { kcal: overview.kcal })}</li>
            {['cycle', 'strength', 'walk'].includes(day.type) && <li>{t('postTrainingProtein')}</li>}
            {day.type === 'cycle' && day.dur >= 60 && <li>{t('longRideSnack')}</li>}
            {day.week === 6 && <li>{t('week6Recovery')}</li>}
          </ul>
        </div>
      </div>
    </div>
  );
}

function MeasurementBanner({ moment, onOpen, t }) {
  const isOverdue = moment.date < getTodayString();
  return (
    <InfoCard style={{ borderLeft: '4px solid var(--action)', marginBottom: 0, background: 'linear-gradient(135deg, #fffaf0, #ffffff)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', alignItems: 'center' }}>
        <div>
          <div style={{ fontSize: '11px', color: '#8b5a10', fontWeight: 800, textTransform: 'uppercase' }}>
            {isOverdue ? t('measurementOpen') : t('measurementToday')}
          </div>
          <div style={{ fontSize: '17px', fontWeight: 700, marginTop: '4px' }}>
            {moment.title}
          </div>
          <div style={{ fontSize: '13px', color: 'var(--muted)', marginTop: '4px' }}>
            {formatDateShort(moment.date)} - {moment.focus}
          </div>
        </div>
        <button onClick={onOpen} style={{
          border: 'none',
          background: 'var(--accent)',
          color: 'white',
          borderRadius: '8px',
          padding: '10px 12px',
          fontSize: '13px',
          fontWeight: 700,
          cursor: 'pointer',
          flex: '0 0 auto',
        }}>
          {t('open')}
        </button>
      </div>
    </InfoCard>
  );
}

function WeekView({ days, completed, toggleComplete, onSelectDay, weekNum, t }) {
  return (
    <div className="section-shell">
      <div className="signal-card" style={{ marginBottom: '4px' }}>
        <div className="signal-kicker">{t('weekPlanning')}</div>
        <div className="signal-value">Week {weekNum}</div>
        <div className="signal-note">{t('daysCompleted', { done: days.filter(d => completed[d.id]).length, total: days.length })}</div>
      </div>
      {days.map(d => <DayCard key={d.id} day={d} completed={completed} toggleComplete={toggleComplete} onSelectDay={onSelectDay} t={t} />)}
    </div>
  );
}

function AllView({ completed, toggleComplete, onSelectDay, t }) {
  return (
    <div className="section-shell">
      {[1, 2, 3, 4, 5, 6].map(w => {
        const wd = PLAN_DATA.filter(d => d.week === w);
        const compl = wd.filter(d => completed[d.id]).length;
        return (
          <div key={w} style={{ marginBottom: '24px' }}>
            <div className="signal-kicker" style={{ color: 'var(--accent-strong)', margin: '0 4px 10px' }}>Week {w} · {compl}/{wd.length}</div>
            {wd.map(d => <DayCard key={d.id} day={d} completed={completed} toggleComplete={toggleComplete} onSelectDay={onSelectDay} compact t={t} />)}
          </div>
        );
      })}
    </div>
  );
}

function PlanView({ completed, toggleComplete, onSelectDay, currentWeek, t }) {
  const [section, setSection] = useState('days');
  const overview = getWeekOverview(currentWeek);
  const sections = [
    { key: 'days', label: t('days') },
    { key: 'zones', label: t('zones') },
    { key: 'food', label: t('nutrition') },
    { key: 'strength', label: t('strength') },
    { key: 'tips', label: t('tips') },
  ];

  return (
    <div>
      <InfoCard style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.98), rgba(238,244,239,0.94))' }}>
        <div className="signal-kicker" style={{ color: 'var(--accent-strong)' }}>{t('weekFocusLabel', { week: currentWeek })}</div>
        <div style={{ fontFamily: 'var(--font-display), var(--font-body), sans-serif', fontSize: '22px', fontWeight: 800, marginTop: '6px' }}>{overview.focus}</div>
        <div className="metric-grid" style={{ marginTop: '14px' }}>
          <MetricTile icon={Clock3} label={t('period')} value={overview.period} />
          <MetricTile icon={Bike} label={t('longRide')} value={overview.longRide} />
          <MetricTile icon={Flame} label={t('nutrition')} value={`${overview.kcal} kcal`} />
        </div>
      </InfoCard>

      <Segmented options={sections} value={section} onChange={setSection} ariaLabel={t('planSections')} />

      {section === 'days' && <AllView completed={completed} toggleComplete={toggleComplete} onSelectDay={onSelectDay} t={t} />}
      {section === 'zones' && <ZonesSection t={t} />}
      {section === 'food' && <NutritionSection currentWeek={currentWeek} t={t} />}
      {section === 'strength' && <StrengthSection t={t} />}
      {section === 'tips' && <TipsSection t={t} />}
    </div>
  );
}

function ZonesSection({ t }) {
  return (
    <div>
      <SectionTitle title={t('heartZones')} subtitle={t('heartZonesSub')} />
      {HEART_ZONES.map(zone => (
        <InfoCard key={zone.zone}>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px' }}>
            <div>
              <div style={{ fontSize: '18px', fontWeight: 700, color: '#003D7A' }}>{zone.zone}</div>
              <div style={{ fontSize: '13px', color: '#555', marginTop: '4px' }}>{zone.feel}</div>
            </div>
            <div style={{ textAlign: 'right', fontSize: '13px', color: '#555' }}>
              <div style={{ fontWeight: 700 }}>{zone.hr} bpm</div>
              <div>{zone.speed}</div>
            </div>
          </div>
          <div style={{ fontSize: '13px', color: '#444', marginTop: '10px' }}>{zone.goal}</div>
        </InfoCard>
      ))}
      <SectionTitle title={t('yourReference')} subtitle={t('referenceSub')} />
      {PERFORMANCE_REFERENCES.map(item => (
        <InfoCard key={item.label}>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontSize: '15px', fontWeight: 800, color: '#003D7A' }}>{item.label}</div>
              <div style={{ fontSize: '13px', color: '#555', marginTop: '4px' }}>{item.detail}</div>
            </div>
            <div style={{ fontSize: '13px', color: '#1a1a1a', fontWeight: 700, textAlign: 'right' }}>{item.value}</div>
          </div>
        </InfoCard>
      ))}
    </div>
  );
}

function NutritionSection({ currentWeek, t }) {
  const overview = getWeekOverview(currentWeek);
  return (
    <div>
      <SectionTitle title={t('nutrition')} subtitle={t('nutritionSub', { kcal: overview.kcal })} />
      <InfoCard>
        <SimpleList items={NUTRITION_GUIDE.rules} />
      </InfoCard>
      <SectionTitle title={t('proteinSources')} />
      {NUTRITION_GUIDE.proteinSources.map(([name, portion, protein, tip]) => (
        <InfoCard key={name}>
          <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 0.8fr 0.7fr', gap: '8px', alignItems: 'center' }}>
            <div style={{ fontWeight: 700 }}>{name}</div>
            <div style={{ fontSize: '13px', color: '#555' }}>{portion}</div>
            <div style={{ fontSize: '13px', fontWeight: 700, color: '#003D7A' }}>{protein}</div>
          </div>
          <div style={{ fontSize: '13px', color: '#666', marginTop: '6px' }}>{tip}</div>
        </InfoCard>
      ))}
      <SectionTitle title={t('sampleDay')} />
      <InfoCard>
        <SimpleList items={NUTRITION_GUIDE.sampleDay} />
      </InfoCard>
    </div>
  );
}

function StrengthSection({ t }) {
  return (
    <div>
      <SectionTitle title={t('strengthTraining')} subtitle={STRENGTH_GUIDE.intro} />
      <StrengthTable title={t('schemaA')} rows={STRENGTH_GUIDE.A} t={t} />
      <StrengthTable title={t('schemaB')} rows={STRENGTH_GUIDE.B} t={t} />
    </div>
  );
}

function StrengthTable({ title, rows, t }) {
  return (
    <div>
      <SectionTitle title={title} />
      {rows.map(exercise => (
        <InfoCard key={exercise.name}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '12px' }}>
            <div style={{ fontWeight: 700 }}>{exercise.name}</div>
            {exercise.guideUrl && (
              <a href={exercise.guideUrl} target="_blank" rel="noopener noreferrer" style={{
                flex: '0 0 auto',
                padding: '8px 10px',
                borderRadius: '10px',
                background: '#003D7A',
                color: 'white',
                fontSize: '12px',
                fontWeight: 800,
                textDecoration: 'none',
              }}>
                {t('explanation', { source: exercise.guideSource })}
              </a>
            )}
          </div>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '8px' }}>
            <Tag icon={Dumbbell} label={exercise.sets} bg="#F0F4FA" color="#003D7A" />
            <Tag icon={Clock3} label={exercise.rest} bg="#FFF4DD" color="#B86E00" />
          </div>
          <div style={{ fontSize: '13px', color: '#555', marginTop: '8px', lineHeight: 1.5 }}>{exercise.notes}</div>
          {exercise.steps && (
            <div style={{ marginTop: '12px' }}>
              <div style={{ fontSize: '11px', fontWeight: 800, color: '#003D7A', letterSpacing: '0.6px', textTransform: 'uppercase', marginBottom: '8px' }}>
                {t('execution')}
              </div>
              <SimpleList items={exercise.steps} />
            </div>
          )}
        </InfoCard>
      ))}
    </div>
  );
}

function TipsSection({ t }) {
  return (
    <div>
      {PRACTICAL_TIPS.map(group => (
        <InfoCard key={group.title}>
          <div style={{ fontSize: '16px', fontWeight: 700, marginBottom: '8px' }}>{group.title}</div>
          <SimpleList items={group.items} />
        </InfoCard>
      ))}
      <SectionTitle title={t('realisticEnd')} />
      <InfoCard>
        <SimpleList items={END_GOALS} />
      </InfoCard>
    </div>
  );
}

function DayCard({ day: rawDay, completed, toggleComplete, onSelectDay, compact, t }) {
  const day = rawDay.type === 'check' ? { ...rawDay, title: getMeasurementTitle(rawDay.date) } : rawDay;
  const meta = TYPE_META[day.type];
  const isComplete = !!completed[day.id];
  const dateStr = new Date(day.date).toLocaleDateString('nl-NL', { day: 'numeric', month: 'short' });
  const open = () => onSelectDay(day);

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={open}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          open();
        }
      }}
      aria-label={`${day.title}, ${dateStr}`}
      className="day-card"
      style={{
      background: 'var(--surface)', borderRadius: '12px', padding: '14px', marginBottom: '10px',
      borderLeft: `4px solid ${meta.color}`,
      cursor: 'pointer', opacity: isComplete ? 0.6 : 1,
      display: 'flex', alignItems: 'center', gap: '12px',
    }}>
      <IconBadge type={day.type} color={meta.color} bg={meta.bg} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: '11px', color: meta.color, fontWeight: 700, letterSpacing: '0.5px' }}>
          {day.day.toUpperCase()} {dateStr.toUpperCase()} {day.dur > 0 ? `• ${day.dur} MIN` : ''}
        </div>
        <div style={{
          fontSize: '15px', fontWeight: 600, marginTop: '2px',
          textDecoration: isComplete ? 'line-through' : 'none',
        }}>
          {day.title}
          {day.intense && <Flame size={15} aria-label="Intensief" style={{ marginLeft: 6, verticalAlign: '-2px', color: 'var(--copper)' }} />}
          {day.big && <Star size={15} aria-label="Belangrijk" style={{ marginLeft: 6, verticalAlign: '-2px', color: 'var(--action)' }} />}
        </div>
        {!compact && day.target && (
          <div style={{ fontSize: '12px', color: 'var(--muted-2)', marginTop: '2px' }}>{day.target}</div>
        )}
      </div>
      <button type="button" aria-label={isComplete ? `${day.title} ${t('markIncomplete')}` : `${day.title} ${t('markComplete')}`} onClick={(e) => { e.stopPropagation(); toggleComplete(day.id); }} style={{
        width: '44px', height: '44px', minWidth: '44px', borderRadius: '999px',
        border: `2px solid ${isComplete ? 'var(--success)' : 'var(--line)'}`,
        background: isComplete ? 'var(--success)' : 'white',
        color: 'white', cursor: 'pointer', fontSize: '14px', fontWeight: 700,
        flexShrink: 0,
      }}>{isComplete ? <CheckCircle2 size={18} aria-hidden="true" /> : <span className="sr-only">{t('notCompleted')}</span>}</button>
    </div>
  );
}

function DayDetail({ day, onClose, completed, toggleComplete, t }) {
  const meta = TYPE_META[day.type];
  const isComplete = !!completed[day.id];

  return (
    <div role="presentation" onClick={onClose} style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 200,
      display: 'flex', alignItems: 'flex-end',
    }}>
      <div role="dialog" aria-modal="true" aria-labelledby="day-detail-title" onClick={e => e.stopPropagation()} style={{
        background: 'var(--surface)', width: '100%', maxHeight: '85vh', overflowY: 'auto',
        borderTopLeftRadius: '12px', borderTopRightRadius: '12px', padding: '24px',
      }}>
        <div style={{ width: '40px', height: '4px', background: '#ddd', borderRadius: '2px', margin: '0 auto 20px' }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
          <IconBadge type={day.type} color={meta.color} bg={meta.bg} size={46} iconSize={24} />
          <div>
            <div style={{ fontSize: '12px', color: meta.color, fontWeight: 700, letterSpacing: '1px' }}>
              {day.day.toUpperCase()} {new Date(day.date).toLocaleDateString('nl-NL', { day: 'numeric', month: 'long', year: 'numeric' }).toUpperCase()}
            </div>
            <div id="day-detail-title" style={{ fontSize: '24px', fontWeight: 700 }}>{day.title}</div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '16px' }}>
          {day.dur > 0 && <Tag icon={Clock3} label={`${day.dur} min`} bg={meta.bg} color={meta.color} />}
          {day.hr && <Tag icon={HeartPulse} label={day.hr} bg="#FFE5E5" color="#DC3545" />}
          {day.speed && <Tag icon={Gauge} label={day.speed} bg="#E5F0FF" color="#003D7A" />}
          {day.target && <Tag icon={Target} label={day.target} bg="#FFF4DD" color="#B86E00" />}
        </div>
        {day.desc && (
          <div style={{ fontSize: '15px', color: 'var(--muted)', lineHeight: 1.6, marginBottom: '20px',
            background: 'var(--surface-2)', padding: '16px', borderRadius: '8px' }}>
            {day.desc}
          </div>
        )}
        <button type="button" onClick={() => { toggleComplete(day.id); onClose(); }} style={{
          width: '100%', padding: '14px', borderRadius: '8px', border: 'none',
          background: isComplete ? '#666' : meta.color,
          color: 'white', fontSize: '15px', fontWeight: 600, cursor: 'pointer',
        }}>{isComplete ? t('markIncomplete') : t('completeDay')}</button>
      </div>
    </div>
  );
}

function TypeIcon({ type, size = 22, color = 'currentColor', strokeWidth = 2.2 }) {
  const Icon = TYPE_ICONS[type] || Activity;
  return <Icon size={size} color={color} strokeWidth={strokeWidth} aria-hidden="true" />;
}

function IconBadge({ type, color, bg, size = 48, iconSize = 24 }) {
  return (
    <span style={{
      width: size,
      height: size,
      minWidth: size,
      borderRadius: '12px',
      background: bg,
      color,
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      flexShrink: 0,
    }}>
      <TypeIcon type={type} size={iconSize} color={color} />
    </span>
  );
}

function Tag({ label, bg, color, icon: Icon }) {
  return (
    <span style={{ background: bg, color, padding: '6px 12px', borderRadius: '999px', fontSize: '13px', fontWeight: 700, display: 'inline-flex', alignItems: 'center' }}>
      {Icon && <Icon size={14} aria-hidden="true" style={{ marginRight: '6px' }} />}
      {label}
    </span>
  );
}

function InfoCard({ children, style, className = '' }) {
  return (
    <div className={`info-card ${className}`.trim()} style={{
      background: 'var(--surface)',
      borderRadius: '12px',
      padding: '16px',
      marginBottom: '12px',
      ...style,
    }}>
      {children}
    </div>
  );
}

function SectionTitle({ title, subtitle }) {
  return (
    <div style={{ margin: '18px 4px 10px' }}>
      <div style={{ fontSize: '12px', fontWeight: 800, color: 'var(--accent-strong)', textTransform: 'uppercase' }}>{title}</div>
      {subtitle && <div style={{ fontSize: '13px', color: 'var(--muted)', marginTop: '4px', lineHeight: 1.4 }}>{subtitle}</div>}
    </div>
  );
}

function Segmented({ options, value, onChange, ariaLabel = 'Tabs' }) {
  return (
    <div role="tablist" aria-label={ariaLabel} style={{
      display: 'flex',
      overflowX: 'auto',
      gap: '4px',
      background: 'var(--surface)',
      borderRadius: '12px',
      padding: '4px',
      margin: '14px 0',
      border: '1px solid var(--line)',
    }}>
      {options.map(option => (
        <button key={option.key} type="button" role="tab" aria-selected={value === option.key} onClick={() => onChange(option.key)} style={{
          flex: '1 0 auto',
          padding: '9px 10px',
          border: 'none',
          borderRadius: '8px',
          background: value === option.key ? 'var(--accent)' : 'transparent',
          color: value === option.key ? 'white' : 'var(--muted)',
          fontSize: '13px',
          fontWeight: 700,
          cursor: 'pointer',
        }}>{option.label}</button>
      ))}
    </div>
  );
}

function MetricTile({ label, value, icon: Icon }) {
  return (
    <div style={{ background: 'var(--surface-2)', borderRadius: '8px', padding: '10px', border: '1px solid var(--line)' }}>
      <div style={{ fontSize: '11px', color: 'var(--muted)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
        {Icon && <Icon size={13} aria-hidden="true" />}
        {label}
      </div>
      <div style={{ fontSize: '14px', fontWeight: 800, marginTop: '4px', color: 'var(--accent-strong)' }}>{value}</div>
    </div>
  );
}

function SimpleList({ items }) {
  return (
    <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '13px', color: 'var(--muted)', lineHeight: 1.65 }}>
      {items.map(item => <li key={item}>{item}</li>)}
    </ul>
  );
}

function CheckInView({ checkins, onSave, currentWeek, dueMeasurement, selectedMeasurementDate, t }) {
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

  useEffect(() => {
    if (selectedMeasurementDate) setDate(selectedMeasurementDate);
  }, [selectedMeasurementDate]);

  useEffect(() => {
    setForm(checkinToForm(current, date));
  }, [current, date]);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      setNotificationStatus(Notification.permission);
    }
  }, []);

  const alarms = getAlarmSignals(form, t);
  const selectedWeek = currentMoment.week || currentWeek;
  const overview = getWeekOverview(selectedWeek);
  const advice = alarms.length >= 2
    ? selectedWeek === 6
      ? t('adviceWeek6')
      : t('adviceBackOff')
    : t('adviceOk');

  const update = (key, value) => setForm({ ...form, [key]: value });
  const enableNotifications = async () => {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      setMessage(t('notificationUnsupported'));
      return;
    }
    const permission = await Notification.requestPermission();
    setNotificationStatus(permission);
    setMessage(permission === 'granted'
      ? t('notificationOn')
      : t('notificationOff'));
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
          <button type="button" onClick={enableNotifications} style={{
            marginTop: '12px',
            border: '1px solid var(--line)',
            background: 'var(--surface-3)',
            color: 'var(--accent-strong)',
            borderRadius: '8px',
            padding: '10px 12px',
            fontSize: '13px',
            fontWeight: 700,
            cursor: 'pointer',
          }}>
            {t('enableMeasurementNotification')}
          </button>
        )}
      </InfoCard>

      {alarms.length > 0 && (
        <InfoCard>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {alarms.map(alarm => <Tag key={alarm} icon={Activity} label={alarm} bg="#FFE5E5" color="#DC3545" />)}
          </div>
        </InfoCard>
      )}

      <form onSubmit={submit}>
        <InfoCard>
          <div style={{ marginBottom: '14px' }}>
            <div className="signal-kicker" style={{ color: 'var(--accent-strong)' }}>
              {currentMoment.title}
            </div>
            <div style={{ fontSize: '13px', color: 'var(--muted)', lineHeight: 1.5 }}>{currentMoment.focus}</div>
          </div>
          <SimpleList items={currentMoment.items} />
          {currentMoment.photoReminder && (
            <div style={{ margin: '10px 0 4px', padding: '10px 12px', borderRadius: '8px', background: '#fff4dd', color: '#7a4b00', fontSize: '13px', fontWeight: 700 }}>
              Foto: {currentMoment.photoReminder}
            </div>
          )}
          <div style={{ height: '12px' }} />
          <MetricInput label={t('weight')} value={form.weightKg} onChange={v => update('weightKg', v)} placeholder="bijv. 88.4" />
          <MetricInput label={t('waist')} value={form.waistCm} onChange={v => update('waistCm', v)} placeholder="bijv. 96" />
          <MetricInput label={t('sleep')} value={form.sleepHours} onChange={v => update('sleepHours', v)} placeholder="bijv. 7.5" />
          <MetricInput label={t('restingHr')} value={form.restingHr} onChange={v => update('restingHr', v)} placeholder="bijv. 56" />
          <MetricInput label="HRV" value={form.hrv} onChange={v => update('hrv', v)} placeholder="optioneel" />
          <MetricInput label={t('energy')} value={form.energyLevel} onChange={v => update('energyLevel', v)} placeholder="3" />
          <MetricInput label={t('mood')} value={form.moodLevel} onChange={v => update('moodLevel', v)} placeholder="3" />
          <MetricInput label={t('soreness')} value={form.sorenessHours} onChange={v => update('sorenessHours', v)} placeholder="bijv. 24" />
          <MetricInput label={t('hunger')} value={form.hungerLevel} onChange={v => update('hungerLevel', v)} placeholder="3" />
          <label style={{ display: 'flex', gap: '10px', alignItems: 'center', fontSize: '13px', color: 'var(--muted)', margin: '10px 0 14px' }}>
            <input type="checkbox" checked={form.hrvLowSignal} onChange={e => update('hrvLowSignal', e.target.checked)} />
            {t('hrvLow')}
          </label>
          <Field label={t('notes')} htmlFor="measurement-notes">
            <textarea id="measurement-notes" value={form.notes} onChange={e => update('notes', e.target.value)} rows={3} placeholder={t('howFeel')} style={{ ...inputStyle, resize: 'vertical', fontFamily: 'inherit' }} />
          </Field>
          <button type="submit" style={{
            width: '100%', padding: '14px', borderRadius: '8px', border: 'none',
            background: 'var(--accent)', color: 'white', fontSize: '15px', fontWeight: 700, cursor: 'pointer',
          }}>{t('saveMeasurement')}</button>
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
              <button key={moment.key} type="button" onClick={() => { setDate(moment.date); setMessage(''); }} style={{
                textAlign: 'left',
                border: `2px solid ${isSelected ? 'var(--accent)' : isDue ? 'var(--action)' : 'var(--line)'}`,
                background: isSelected ? '#e8f4f1' : 'white',
                borderRadius: '8px',
                padding: '12px',
                cursor: 'pointer',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: '10px', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: 800, color: 'var(--ink)' }}>{moment.title}</div>
                    <div style={{ fontSize: '12px', color: 'var(--muted)', marginTop: '3px' }}>Week {moment.week} - {formatDateShort(moment.date)}</div>
                  </div>
                  <Tag
                    icon={isSaved ? CheckCircle2 : Clock3}
                    label={isSaved ? t('saved') : isDue ? t('now') : t('later')}
                    bg={isSaved ? '#E0F0E0' : isDue ? '#FFF4DD' : '#F0F4FA'}
                    color={isSaved ? '#2C7A2C' : isDue ? '#B86E00' : '#003D7A'}
                  />
                </div>
              </button>
            );
          })}
        </div>
      </InfoCard>

      <SectionTitle title={t('history')} />
      {checkins.filter(isMeasurementCheckin).length === 0 ? (
        <InfoCard><div style={{ fontSize: '13px', color: '#666' }}>{t('noMeasurements')}</div></InfoCard>
      ) : checkins.filter(isMeasurementCheckin).map(item => (
        <InfoCard key={item.id || item.date}>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px' }}>
            <div style={{ fontWeight: 700 }}>{getMeasurementTitle(item.date)}</div>
            <div style={{ fontSize: '12px', color: '#888', marginTop: '4px' }}>{formatDateShort(item.date)}</div>
            <div style={{ fontSize: '13px', color: '#666' }}>{[item.weight_kg && `${item.weight_kg} kg`, item.waist_cm && `${item.waist_cm} cm`, item.sleep_hours && t('sleepShort', { hours: item.sleep_hours })].filter(Boolean).join(' · ')}</div>
          </div>
        </InfoCard>
      ))}
      </aside>
    </div>
  );
}

function MetricInput({ label, value, onChange, placeholder }) {
  const id = `metric-${label.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
  return (
    <Field label={label} htmlFor={id}>
      <input id={id} type="number" inputMode="decimal" value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} style={inputStyle} />
    </Field>
  );
}

function checkinToForm(checkin, fallbackDate) {
  return {
    date: checkin?.date || fallbackDate,
    weightKg: checkin?.weight_kg ?? '',
    waistCm: checkin?.waist_cm ?? '',
    sleepHours: checkin?.sleep_hours ?? '',
    restingHr: checkin?.resting_hr ?? '',
    hrv: checkin?.hrv ?? '',
    energyLevel: checkin?.energy_level ?? '',
    moodLevel: checkin?.mood_level ?? '',
    sorenessHours: checkin?.soreness_hours ?? '',
    hungerLevel: checkin?.hunger_level ?? '',
    hrvLowSignal: !!checkin?.hrv_low_signal,
    notes: checkin?.notes || '',
  };
}

function getTodayString() {
  const now = new Date();
  const local = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 10);
}

function formatDateShort(date) {
  return new Date(`${date}T12:00:00`).toLocaleDateString('nl-NL', { day: 'numeric', month: 'short' });
}

function getAlarmSignals(form, t = makeT('nl')) {
  const alarms = [];
  if (Number(form.restingHr) >= 61) alarms.push(t('alarmRestingHr'));
  if (Number(form.sleepHours) > 0 && Number(form.sleepHours) < 7) alarms.push(t('alarmSleep'));
  if (Number(form.moodLevel) > 0 && Number(form.moodLevel) <= 2) alarms.push(t('alarmMood'));
  if (Number(form.sorenessHours) > 72) alarms.push(t('alarmSoreness'));
  if (Number(form.hungerLevel) >= 5) alarms.push(t('alarmHunger'));
  if (form.hrvLowSignal) alarms.push(t('alarmHrv'));
  return alarms;
}

function LogView({ logs, setShowLogForm, deleteLog, t }) {
  const cycleLogs = logs.filter(l => l.type === 'cycle' && l.distance && l.duration);
  const avgSpeed = cycleLogs.length
    ? cycleLogs.reduce((s, l) => s + (l.distance / (l.duration / 60)), 0) / cycleLogs.length : 0;
  const avgHR = cycleLogs.filter(l => l.avg_hr).length
    ? cycleLogs.filter(l => l.avg_hr).reduce((s, l) => s + Number(l.avg_hr), 0) / cycleLogs.filter(l => l.avg_hr).length : 0;

  return (
    <div>
      {logs.length > 0 && (
        <div className="premium-card" style={{
          padding: '20px', borderRadius: '12px',
          marginBottom: '20px',
        }}>
          <div style={{ fontSize: '11px', opacity: 0.85, fontWeight: 700, letterSpacing: '1px' }}>{t('yourStats')}</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginTop: '12px' }}>
            <div>
              <div style={{ fontSize: '12px', opacity: 0.75 }}>{t('workoutsLogged')}</div>
              <div style={{ fontSize: '24px', fontWeight: 700 }}>{logs.length}</div>
            </div>
            <div>
              <div style={{ fontSize: '12px', opacity: 0.75 }}>{t('avgSpeed')}</div>
              <div style={{ fontSize: '24px', fontWeight: 700 }}>
                {avgSpeed > 0 ? avgSpeed.toFixed(1) : '-'} <span style={{ fontSize: '14px', opacity: 0.7 }}>km/h</span>
              </div>
            </div>
            <div>
              <div style={{ fontSize: '12px', opacity: 0.75 }}>{t('avgHr')}</div>
              <div style={{ fontSize: '24px', fontWeight: 700 }}>
                {avgHR > 0 ? Math.round(avgHR) : '-'} <span style={{ fontSize: '14px', opacity: 0.7 }}>bpm</span>
              </div>
            </div>
            <div>
              <div style={{ fontSize: '12px', opacity: 0.75 }}>{t('cycleRides')}</div>
              <div style={{ fontSize: '24px', fontWeight: 700 }}>{cycleLogs.length}</div>
            </div>
          </div>
        </div>
      )}

      {logs.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--muted)' }}>
          <BarChart3 size={48} aria-hidden="true" style={{ marginBottom: '12px', color: 'var(--accent)' }} />
          <div style={{ fontSize: '17px', fontWeight: 600, marginBottom: '6px' }}>{t('noWorkouts')}</div>
          <div style={{ fontSize: '14px', color: 'var(--muted-2)', marginBottom: '20px' }}>
            {t('noWorkoutsHelp')}
          </div>
        </div>
      ) : (
        <div>{logs.map(log => <LogCard key={log.id} log={log} deleteLog={deleteLog} t={t} />)}</div>
      )}
    </div>
  );
}

function LogCard({ log, deleteLog, t }) {
  const speed = log.distance && log.duration ? (log.distance / (log.duration / 60)).toFixed(1) : null;
  let zone = null;
  if (log.avg_hr) {
    const hr = Number(log.avg_hr);
    if (hr < 121) zone = 'Onder Z1';
    else if (hr < 134) zone = 'Z1';
    else if (hr < 147) zone = 'Z2';
    else if (hr < 160) zone = 'Z3';
    else if (hr < 173) zone = 'Z4';
    else zone = 'Z5';
  }

  return (
    <div className="log-card" style={{
      background: 'var(--surface)', borderRadius: '12px', padding: '14px', marginBottom: '10px',
      borderLeft: `4px solid ${log.type === 'cycle' ? '#003D7A' : '#7A3000'}`,
    }}>
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
          {log.notes && (
            <div style={{ fontSize: '13px', color: '#666', marginTop: '8px', fontStyle: 'italic' }}>"{log.notes}"</div>
          )}
        </div>
        <button type="button" aria-label={t('deleteLog')} onClick={() => deleteLog(log.id)} style={{
          background: 'transparent', border: 'none', color: '#999',
          fontSize: '16px', cursor: 'pointer', padding: '4px 8px',
        }}><Trash2 size={16} aria-hidden="true" /></button>
      </div>
    </div>
  );
}

function StatItem({ icon: Icon, label }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
      <Icon size={14} aria-hidden="true" />
      {label}
    </span>
  );
}

function LogForm({ onSave, onClose, todayPlan, t }) {
  const [form, setForm] = useState({
    date: new Date().toISOString().slice(0, 10),
    type: todayPlan?.type === 'strength' ? 'strength' : 'cycle',
    duration: '',
    distance: '',
    avgHR: '',
    maxHR: '',
    kcal: '',
    notes: '',
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
    <div role="presentation" onClick={onClose} style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 200,
      display: 'flex', alignItems: 'flex-end',
    }}>
      <div role="dialog" aria-modal="true" aria-labelledby="log-form-title" onClick={e => e.stopPropagation()} style={{
        background: 'var(--surface)', width: '100%', maxHeight: '90vh', overflowY: 'auto',
        borderTopLeftRadius: '12px', borderTopRightRadius: '12px', padding: '24px',
      }}>
        <div style={{ width: '40px', height: '4px', background: '#ddd', borderRadius: '2px', margin: '0 auto 20px' }} />
        <h2 id="log-form-title" style={{ margin: '0 0 4px', fontSize: '22px', fontWeight: 700 }}>{t('workoutLog')}</h2>
        <p style={{ margin: '0 0 20px', fontSize: '13px', color: 'var(--muted)' }}>
          {t('logSubtitle')}
        </p>

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
              <button key={option.key} type="button" aria-pressed={form.type === option.key} onClick={() => setForm({ ...form, type: option.key })} style={{
                flex: 1, padding: '10px', borderRadius: '10px',
                border: form.type === option.key ? '2px solid var(--accent)' : '2px solid var(--line)',
                background: form.type === option.key ? '#e8f4f1' : 'white',
                fontSize: '14px', fontWeight: 600, cursor: 'pointer',
              }}><option.Icon size={16} aria-hidden="true" style={{ verticalAlign: '-3px', marginRight: '6px' }} />{option.label}</button>
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
          <div style={{
            background: '#F0F4FA', borderRadius: '12px', padding: '14px',
            marginBottom: '16px', borderLeft: '4px solid #003D7A',
          }}>
            <div style={{ fontSize: '11px', color: '#003D7A', fontWeight: 700, letterSpacing: '1px', marginBottom: '8px' }}>
              {t('analysis')}
            </div>
            <div style={{ fontSize: '14px', lineHeight: 1.6 }}>
              {t('avgSpeed')} <strong>{analysis.speed} km/h</strong> in <strong>{analysis.zone}</strong> ({t('expected', { speed: analysis.expectedSpeed })})
              <div style={{ marginTop: '6px', color: '#444' }}>{analysis.verdict}</div>
            </div>
          </div>
        )}

        <div style={{ display: 'flex', gap: '8px' }}>
          <button type="button" onClick={onClose} style={{
            flex: 1, padding: '14px', borderRadius: '8px', border: '2px solid var(--line)',
            background: 'white', fontSize: '15px', fontWeight: 600, cursor: 'pointer',
          }}>{t('cancel')}</button>
          <button type="button" onClick={handleSubmit} style={{
            flex: 2, padding: '14px', borderRadius: '8px', border: 'none',
            background: 'var(--accent)', color: 'white', fontSize: '15px', fontWeight: 600, cursor: 'pointer',
          }}>{t('save')}</button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children, htmlFor, help }) {
  return (
    <div style={{ marginBottom: '14px' }}>
      {htmlFor ? (
        <label htmlFor={htmlFor} style={{ display: 'block', fontSize: '13px', color: 'var(--muted)', fontWeight: 700, marginBottom: '6px' }}>{label}</label>
      ) : (
        <div style={{ fontSize: '13px', color: 'var(--muted)', fontWeight: 700, marginBottom: '6px' }}>{label}</div>
      )}
      {help && <div style={{ fontSize: '12px', color: 'var(--muted-2)', margin: '-2px 0 6px' }}>{help}</div>}
      {children}
    </div>
  );
}

const inputStyle = {
  width: '100%', padding: '12px', borderRadius: '8px',
  border: '2px solid var(--line)', fontSize: '15px',
  outline: 'none', background: 'white', boxSizing: 'border-box',
};

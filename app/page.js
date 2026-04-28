'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { PLAN_DATA, TYPE_META } from '../lib/plan-data';
import {
  END_GOALS,
  HEART_ZONES,
  NUTRITION_GUIDE,
  PRACTICAL_TIPS,
  STRENGTH_GUIDE,
  getWeekOverview,
} from '../lib/plan-content';

export default function Home() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

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

  if (loading) return <Loading />;
  if (!session) return <Auth />;
  return <App user={session.user} />;
}

function Loading() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#eef2f7' }}>
      <div style={{ color: '#003D7A', fontSize: '16px' }}>Laden...</div>
    </div>
  );
}

function Auth() {
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
        setMsg('Check je mail voor bevestigingslink!');
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
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #003D7A 0%, #0058B0 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
    }}>
      <div style={{
        background: 'white',
        borderRadius: '24px',
        padding: '32px 24px',
        width: '100%',
        maxWidth: '400px',
        boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
      }}>
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{ fontSize: '48px', marginBottom: '8px' }}>🚴‍♂️</div>
          <h1 style={{ margin: 0, fontSize: '24px', fontWeight: 700, color: '#003D7A' }}>6-Weken Plan</h1>
          <p style={{ margin: '6px 0 0', fontSize: '14px', color: '#888' }}>
            {mode === 'signup' ? 'Maak een account' : 'Log in om te starten'}
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="E-mail"
            required
            style={inputStyle}
          />
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="Wachtwoord (min 6 tekens)"
            required
            minLength={6}
            style={{ ...inputStyle, marginTop: '12px' }}
          />
          <button
            type="submit"
            disabled={busy}
            style={{
              width: '100%',
              padding: '14px',
              borderRadius: '12px',
              border: 'none',
              background: busy ? '#999' : '#003D7A',
              color: 'white',
              fontSize: '15px',
              fontWeight: 600,
              cursor: busy ? 'not-allowed' : 'pointer',
              marginTop: '16px',
            }}
          >
            {busy ? 'Bezig...' : mode === 'signup' ? 'Maak account' : 'Inloggen'}
          </button>
        </form>

        {msg && (
          <div style={{
            marginTop: '14px',
            padding: '12px',
            borderRadius: '10px',
            background: msg.includes('Check') ? '#E0F0E0' : '#FFE5E5',
            color: msg.includes('Check') ? '#2C7A2C' : '#DC3545',
            fontSize: '13px',
            textAlign: 'center',
          }}>{msg}</div>
        )}

        <button
          onClick={() => { setMode(mode === 'signin' ? 'signup' : 'signin'); setMsg(''); }}
          style={{
            width: '100%',
            padding: '12px',
            border: 'none',
            background: 'transparent',
            color: '#003D7A',
            fontSize: '13px',
            cursor: 'pointer',
            marginTop: '8px',
          }}
        >
          {mode === 'signin' ? 'Nog geen account? Maak er een' : 'Heb je al een account? Inloggen'}
        </button>
      </div>
    </div>
  );
}

function App({ user }) {
  const [completed, setCompleted] = useState({});
  const [logs, setLogs] = useState([]);
  const [checkins, setCheckins] = useState([]);
  const [view, setView] = useState('today');
  const [todayId, setTodayId] = useState(1);
  const [selectedDay, setSelectedDay] = useState(null);
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
    const today = new Date().toISOString().slice(0, 10);
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
    if (!confirm('Verwijder deze log?')) return;
    await supabase.from('workout_logs').delete().eq('id', id);
    setLogs(logs.filter(l => l.id !== id));
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

  return (
    <div style={{
      background: 'linear-gradient(180deg, #f8f9fb 0%, #eef2f7 100%)',
      minHeight: '100vh',
      paddingBottom: '90px',
      color: '#1a1a1a',
    }}>
      <header style={{
        background: 'linear-gradient(135deg, #003D7A 0%, #0058B0 100%)',
        color: 'white',
        padding: '20px 20px 18px',
        borderBottomLeftRadius: '24px',
        borderBottomRightRadius: '24px',
        boxShadow: '0 4px 20px rgba(0, 61, 122, 0.15)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
          <div>
            <div style={{ fontSize: '12px', opacity: 0.85, fontWeight: 500, letterSpacing: '0.5px' }}>WEEK {currentWeek} VAN 6</div>
            <div style={{ fontSize: '22px', fontWeight: 700, marginTop: '4px' }}>6-Weken Plan</div>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <div style={{
              background: 'rgba(255,255,255,0.15)', padding: '6px 12px',
              borderRadius: '16px', fontSize: '13px', fontWeight: 600,
            }}>
              {completedCount}/{totalCount} ✓
            </div>
            <button onClick={() => setShowMenu(!showMenu)} style={{
              background: 'rgba(255,255,255,0.15)', border: 'none', color: 'white',
              padding: '6px 10px', borderRadius: '16px', fontSize: '14px',
              cursor: 'pointer', fontWeight: 600,
            }}>⋯</button>
          </div>
        </div>
        <div style={{ background: 'rgba(255,255,255,0.2)', borderRadius: '6px', height: '6px', overflow: 'hidden' }}>
          <div style={{ background: '#FFC72C', height: '100%', width: `${progressPct}%`, borderRadius: '6px', transition: 'width 0.4s ease' }} />
        </div>
        <div style={{ fontSize: '11px', opacity: 0.85, marginTop: '6px', display: 'flex', justifyContent: 'space-between' }}>
          <span>{Math.round(progressPct)}% voltooid</span>
          {syncing && <span>↻ Synchroniseren...</span>}
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
            <button onClick={() => { setShowMenu(false); signOut(); }} style={{
              width: '100%', padding: '12px 16px', border: 'none', background: 'transparent',
              textAlign: 'left', fontSize: '14px', cursor: 'pointer', borderRadius: '8px',
            }}>🚪 Uitloggen</button>
          </div>
        </div>
      )}

      <nav style={{
        display: 'flex', background: 'white', margin: '20px 16px 0',
        borderRadius: '14px', padding: '4px', boxShadow: '0 2px 10px rgba(0,0,0,0.04)',
      }}>
        {[
          { key: 'today', label: 'Vandaag' },
          { key: 'week', label: `Wk ${currentWeek}` },
          { key: 'plan', label: 'Plan' },
          { key: 'checkin', label: 'Check-in' },
          { key: 'log', label: 'Log' },
        ].map(t => (
          <button key={t.key} onClick={() => setView(t.key)} style={{
            flex: 1, padding: '10px', border: 'none',
            background: view === t.key ? '#003D7A' : 'transparent',
            color: view === t.key ? 'white' : '#555',
            borderRadius: '10px', fontSize: '14px',
            fontWeight: view === t.key ? 600 : 500, cursor: 'pointer',
          }}>{t.label}</button>
        ))}
      </nav>

      <main style={{ padding: '20px 16px' }}>
        {view === 'today' && <TodayView day={today} completed={completed} toggleComplete={toggleComplete} overview={currentOverview} />}
        {view === 'week' && <WeekView days={weekDays} completed={completed} toggleComplete={toggleComplete} setSelectedDay={setSelectedDay} weekNum={currentWeek} />}
        {view === 'plan' && <PlanView completed={completed} toggleComplete={toggleComplete} setSelectedDay={setSelectedDay} currentWeek={currentWeek} />}
        {view === 'checkin' && <CheckInView checkins={checkins} onSave={saveCheckin} currentWeek={currentWeek} />}
        {view === 'log' && <LogView logs={logs} setShowLogForm={setShowLogForm} deleteLog={deleteLog} />}
      </main>

      {selectedDay && <DayDetail day={selectedDay} onClose={() => setSelectedDay(null)} completed={completed} toggleComplete={toggleComplete} />}
      {showLogForm && <LogForm onSave={saveLog} onClose={() => setShowLogForm(false)} todayPlan={today} />}

      <button onClick={() => setShowLogForm(true)} style={{
        position: 'fixed', bottom: '24px', right: '20px', width: '60px', height: '60px',
        borderRadius: '50%', background: 'linear-gradient(135deg, #FFC72C 0%, #FFB300 100%)',
        border: 'none', color: '#003D7A', fontSize: '28px', fontWeight: 700,
        boxShadow: '0 6px 20px rgba(255, 199, 44, 0.4)', cursor: 'pointer', zIndex: 100,
      }}>+</button>
    </div>
  );
}

function TodayView({ day, completed, toggleComplete, overview }) {
  const meta = TYPE_META[day.type];
  const isComplete = !!completed[day.id];

  return (
    <div>
      <div style={{
        background: 'white', borderRadius: '20px', padding: '24px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.06)',
        border: `2px solid ${isComplete ? '#2C7A2C' : meta.color}`,
      }}>
        <div style={{ marginBottom: '16px' }}>
          <div style={{ fontSize: '12px', color: meta.color, fontWeight: 700, letterSpacing: '1px' }}>
            {day.day.toUpperCase()} {new Date(day.date).toLocaleDateString('nl-NL', { day: 'numeric', month: 'long' }).toUpperCase()}
          </div>
          <div style={{ fontSize: '26px', fontWeight: 700, marginTop: '4px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '34px' }}>{meta.icon}</span>
            {day.title}
          </div>
        </div>

        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '16px' }}>
          {day.dur > 0 && <Tag label={`⏱ ${day.dur} min`} bg={meta.bg} color={meta.color} />}
          {day.hr && <Tag label={`❤️ HR ${day.hr}`} bg="#FFE5E5" color="#DC3545" />}
          {day.speed && <Tag label={`💨 ${day.speed}`} bg="#E5F0FF" color="#003D7A" />}
          {day.target && <Tag label={`🎯 ${day.target}`} bg="#FFF4DD" color="#B86E00" />}
        </div>

        {day.desc && (
          <div style={{ fontSize: '15px', color: '#444', lineHeight: 1.5, marginBottom: '20px' }}>
            {day.desc}
          </div>
        )}

        <button onClick={() => toggleComplete(day.id)} style={{
          width: '100%', padding: '14px', borderRadius: '14px', border: 'none',
          background: isComplete ? '#2C7A2C' : meta.color,
          color: 'white', fontSize: '16px', fontWeight: 600, cursor: 'pointer',
        }}>{isComplete ? '✓ Voltooid' : 'Markeer voltooid'}</button>
      </div>

      <div style={{
        marginTop: '20px', background: 'white', borderRadius: '16px',
        padding: '18px', boxShadow: '0 2px 10px rgba(0,0,0,0.04)',
      }}>
        <div style={{ fontSize: '11px', color: '#999', fontWeight: 700, letterSpacing: '1px', marginBottom: '10px' }}>
          VANDAAG NIET VERGETEN
        </div>
        <ul style={{ margin: 0, paddingLeft: '20px', fontSize: '14px', color: '#444', lineHeight: 1.7 }}>
          <li>130g eiwit (verdeel over 4-5 momenten)</li>
          <li>2L water</li>
          <li>{overview.kcal} kcal target</li>
          {day.type === 'strength' && <li>25-30g eiwit binnen 1u na sessie</li>}
          {day.type === 'cycle' && day.dur >= 60 && <li>Snack + water mee voor lange rit</li>}
          {day.week === 6 && <li>Extra zout + water, herstel prioriteit</li>}
        </ul>
      </div>
    </div>
  );
}

function WeekView({ days, completed, toggleComplete, setSelectedDay, weekNum }) {
  return (
    <div>
      <div style={{ marginBottom: '12px', fontSize: '13px', color: '#666', fontWeight: 500 }}>
        Week {weekNum} • {days.filter(d => completed[d.id]).length}/{days.length} dagen voltooid
      </div>
      {days.map(d => <DayCard key={d.id} day={d} completed={completed} toggleComplete={toggleComplete} setSelectedDay={setSelectedDay} />)}
    </div>
  );
}

function AllView({ completed, toggleComplete, setSelectedDay }) {
  return (
    <div>
      {[1, 2, 3, 4, 5, 6].map(w => {
        const wd = PLAN_DATA.filter(d => d.week === w);
        const compl = wd.filter(d => completed[d.id]).length;
        return (
          <div key={w} style={{ marginBottom: '24px' }}>
            <div style={{
              fontSize: '11px', fontWeight: 700, color: '#003D7A',
              letterSpacing: '1.5px', marginBottom: '10px', padding: '0 4px',
            }}>WEEK {w} • {compl}/{wd.length}</div>
            {wd.map(d => <DayCard key={d.id} day={d} completed={completed} toggleComplete={toggleComplete} setSelectedDay={setSelectedDay} compact />)}
          </div>
        );
      })}
    </div>
  );
}

function PlanView({ completed, toggleComplete, setSelectedDay, currentWeek }) {
  const [section, setSection] = useState('days');
  const overview = getWeekOverview(currentWeek);
  const sections = [
    { key: 'days', label: 'Dagen' },
    { key: 'zones', label: 'Zones' },
    { key: 'food', label: 'Voeding' },
    { key: 'strength', label: 'Kracht' },
    { key: 'tips', label: 'Tips' },
  ];

  return (
    <div>
      <InfoCard>
        <div style={{ fontSize: '11px', color: '#003D7A', fontWeight: 700, letterSpacing: '1px' }}>WEEK {currentWeek} FOCUS</div>
        <div style={{ fontSize: '20px', fontWeight: 700, marginTop: '6px' }}>{overview.focus}</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', marginTop: '14px' }}>
          <MetricTile label="Periode" value={overview.period} />
          <MetricTile label="Lange rit" value={overview.longRide} />
          <MetricTile label="Voeding" value={`${overview.kcal} kcal`} />
        </div>
      </InfoCard>

      <Segmented options={sections} value={section} onChange={setSection} />

      {section === 'days' && <AllView completed={completed} toggleComplete={toggleComplete} setSelectedDay={setSelectedDay} />}
      {section === 'zones' && <ZonesSection />}
      {section === 'food' && <NutritionSection currentWeek={currentWeek} />}
      {section === 'strength' && <StrengthSection />}
      {section === 'tips' && <TipsSection />}
    </div>
  );
}

function ZonesSection() {
  return (
    <div>
      <SectionTitle title="Hartslagzones" subtitle="Hartslag is leidend; snelheid is referentie." />
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
    </div>
  );
}

function NutritionSection({ currentWeek }) {
  const overview = getWeekOverview(currentWeek);
  return (
    <div>
      <SectionTitle title="Voeding" subtitle={`${overview.kcal} kcal deze week, 130g eiwit per dag.`} />
      <InfoCard>
        <SimpleList items={NUTRITION_GUIDE.rules} />
      </InfoCard>
      <SectionTitle title="Eiwitbronnen" />
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
      <SectionTitle title="Voorbeelddag" />
      <InfoCard>
        <SimpleList items={NUTRITION_GUIDE.sampleDay} />
      </InfoCard>
    </div>
  );
}

function StrengthSection() {
  return (
    <div>
      <SectionTitle title="Krachttraining" subtitle={STRENGTH_GUIDE.intro} />
      <StrengthTable title="Schema A - woensdag" rows={STRENGTH_GUIDE.A} />
      <StrengthTable title="Schema B - zondag" rows={STRENGTH_GUIDE.B} />
    </div>
  );
}

function StrengthTable({ title, rows }) {
  return (
    <div>
      <SectionTitle title={title} />
      {rows.map(([exercise, sets, rest, notes]) => (
        <InfoCard key={exercise}>
          <div style={{ fontWeight: 700 }}>{exercise}</div>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '8px' }}>
            <Tag label={sets} bg="#F0F4FA" color="#003D7A" />
            <Tag label={rest} bg="#FFF4DD" color="#B86E00" />
          </div>
          <div style={{ fontSize: '13px', color: '#555', marginTop: '8px', lineHeight: 1.5 }}>{notes}</div>
        </InfoCard>
      ))}
    </div>
  );
}

function TipsSection() {
  return (
    <div>
      {PRACTICAL_TIPS.map(group => (
        <InfoCard key={group.title}>
          <div style={{ fontSize: '16px', fontWeight: 700, marginBottom: '8px' }}>{group.title}</div>
          <SimpleList items={group.items} />
        </InfoCard>
      ))}
      <SectionTitle title="Reeel eindbeeld" />
      <InfoCard>
        <SimpleList items={END_GOALS} />
      </InfoCard>
    </div>
  );
}

function DayCard({ day, completed, toggleComplete, setSelectedDay, compact }) {
  const meta = TYPE_META[day.type];
  const isComplete = !!completed[day.id];
  const dateStr = new Date(day.date).toLocaleDateString('nl-NL', { day: 'numeric', month: 'short' });

  return (
    <div onClick={() => setSelectedDay(day)} style={{
      background: 'white', borderRadius: '14px', padding: '14px', marginBottom: '10px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.04)', borderLeft: `4px solid ${meta.color}`,
      cursor: 'pointer', opacity: isComplete ? 0.6 : 1,
      display: 'flex', alignItems: 'center', gap: '12px',
    }}>
      <div style={{
        width: '48px', height: '48px', borderRadius: '12px', background: meta.bg,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: '24px', flexShrink: 0,
      }}>{meta.icon}</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: '11px', color: meta.color, fontWeight: 700, letterSpacing: '0.5px' }}>
          {day.day.toUpperCase()} {dateStr.toUpperCase()} {day.dur > 0 ? `• ${day.dur} MIN` : ''}
        </div>
        <div style={{
          fontSize: '15px', fontWeight: 600, marginTop: '2px',
          textDecoration: isComplete ? 'line-through' : 'none',
        }}>
          {day.title} {day.intense && '🔥'} {day.big && '⭐'}
        </div>
        {!compact && day.target && (
          <div style={{ fontSize: '12px', color: '#888', marginTop: '2px' }}>{day.target}</div>
        )}
      </div>
      <button onClick={(e) => { e.stopPropagation(); toggleComplete(day.id); }} style={{
        width: '32px', height: '32px', borderRadius: '50%',
        border: `2px solid ${isComplete ? '#2C7A2C' : '#ddd'}`,
        background: isComplete ? '#2C7A2C' : 'white',
        color: 'white', cursor: 'pointer', fontSize: '14px', fontWeight: 700,
        flexShrink: 0,
      }}>{isComplete ? '✓' : ''}</button>
    </div>
  );
}

function DayDetail({ day, onClose, completed, toggleComplete }) {
  const meta = TYPE_META[day.type];
  const isComplete = !!completed[day.id];

  return (
    <div onClick={onClose} style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 200,
      display: 'flex', alignItems: 'flex-end',
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        background: 'white', width: '100%', maxHeight: '85vh', overflowY: 'auto',
        borderTopLeftRadius: '24px', borderTopRightRadius: '24px', padding: '24px',
      }}>
        <div style={{ width: '40px', height: '4px', background: '#ddd', borderRadius: '2px', margin: '0 auto 20px' }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
          <span style={{ fontSize: '32px' }}>{meta.icon}</span>
          <div>
            <div style={{ fontSize: '12px', color: meta.color, fontWeight: 700, letterSpacing: '1px' }}>
              {day.day.toUpperCase()} {new Date(day.date).toLocaleDateString('nl-NL', { day: 'numeric', month: 'long', year: 'numeric' }).toUpperCase()}
            </div>
            <div style={{ fontSize: '24px', fontWeight: 700 }}>{day.title}</div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '16px' }}>
          {day.dur > 0 && <Tag label={`⏱ ${day.dur} min`} bg={meta.bg} color={meta.color} />}
          {day.hr && <Tag label={`❤️ ${day.hr}`} bg="#FFE5E5" color="#DC3545" />}
          {day.speed && <Tag label={`💨 ${day.speed}`} bg="#E5F0FF" color="#003D7A" />}
          {day.target && <Tag label={`🎯 ${day.target}`} bg="#FFF4DD" color="#B86E00" />}
        </div>
        {day.desc && (
          <div style={{ fontSize: '15px', color: '#444', lineHeight: 1.6, marginBottom: '20px',
            background: '#f8f9fb', padding: '16px', borderRadius: '12px' }}>
            {day.desc}
          </div>
        )}
        <button onClick={() => { toggleComplete(day.id); onClose(); }} style={{
          width: '100%', padding: '14px', borderRadius: '12px', border: 'none',
          background: isComplete ? '#666' : meta.color,
          color: 'white', fontSize: '15px', fontWeight: 600, cursor: 'pointer',
        }}>{isComplete ? '✗ Markeer als niet voltooid' : '✓ Voltooi deze dag'}</button>
      </div>
    </div>
  );
}

function Tag({ label, bg, color }) {
  return (
    <div style={{ background: bg, color, padding: '6px 12px', borderRadius: '10px', fontSize: '13px', fontWeight: 600 }}>
      {label}
    </div>
  );
}

function InfoCard({ children, style }) {
  return (
    <div style={{
      background: 'white',
      borderRadius: '14px',
      padding: '16px',
      marginBottom: '12px',
      boxShadow: '0 2px 10px rgba(0,0,0,0.04)',
      ...style,
    }}>
      {children}
    </div>
  );
}

function SectionTitle({ title, subtitle }) {
  return (
    <div style={{ margin: '18px 4px 10px' }}>
      <div style={{ fontSize: '12px', fontWeight: 700, color: '#003D7A', letterSpacing: '1px', textTransform: 'uppercase' }}>{title}</div>
      {subtitle && <div style={{ fontSize: '13px', color: '#666', marginTop: '4px', lineHeight: 1.4 }}>{subtitle}</div>}
    </div>
  );
}

function Segmented({ options, value, onChange }) {
  return (
    <div style={{
      display: 'flex',
      overflowX: 'auto',
      gap: '4px',
      background: 'white',
      borderRadius: '12px',
      padding: '4px',
      margin: '14px 0',
      boxShadow: '0 2px 10px rgba(0,0,0,0.04)',
    }}>
      {options.map(option => (
        <button key={option.key} onClick={() => onChange(option.key)} style={{
          flex: '1 0 auto',
          padding: '9px 10px',
          border: 'none',
          borderRadius: '9px',
          background: value === option.key ? '#003D7A' : 'transparent',
          color: value === option.key ? 'white' : '#555',
          fontSize: '13px',
          fontWeight: 600,
          cursor: 'pointer',
        }}>{option.label}</button>
      ))}
    </div>
  );
}

function MetricTile({ label, value }) {
  return (
    <div style={{ background: '#F0F4FA', borderRadius: '10px', padding: '10px' }}>
      <div style={{ fontSize: '11px', color: '#666', fontWeight: 600 }}>{label}</div>
      <div style={{ fontSize: '14px', fontWeight: 700, marginTop: '4px', color: '#003D7A' }}>{value}</div>
    </div>
  );
}

function SimpleList({ items }) {
  return (
    <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '13px', color: '#444', lineHeight: 1.65 }}>
      {items.map(item => <li key={item}>{item}</li>)}
    </ul>
  );
}

function CheckInView({ checkins, onSave, currentWeek }) {
  const today = new Date().toISOString().slice(0, 10);
  const [date, setDate] = useState(today);
  const current = checkins.find(item => item.date === date);
  const [form, setForm] = useState(() => checkinToForm(current, today));
  const [message, setMessage] = useState('');

  useEffect(() => {
    setForm(checkinToForm(current, date));
  }, [current, date]);

  const alarms = getAlarmSignals(form);
  const overview = getWeekOverview(currentWeek);
  const advice = alarms.length >= 2
    ? currentWeek === 6
      ? '2+ signalen: herstel prioriteit, houd 2700 kcal aan en push niet.'
      : '2+ signalen: schakel terug naar ongeveer 2550 kcal en push niet.'
    : 'Onder de drempel: houd het plan aan en blijf meten.';

  const update = (key, value) => setForm({ ...form, [key]: value });
  const submit = async (e) => {
    e.preventDefault();
    const { error } = await onSave(form);
    setMessage(error ? error.message : 'Check-in opgeslagen');
  };

  return (
    <div>
      <InfoCard style={{ borderLeft: `4px solid ${alarms.length >= 2 ? '#DC3545' : '#2C7A2C'}` }}>
        <div style={{ fontSize: '11px', color: '#003D7A', fontWeight: 700, letterSpacing: '1px' }}>DAGELIJKSE CHECK-IN</div>
        <div style={{ fontSize: '20px', fontWeight: 700, marginTop: '6px' }}>{alarms.length} alarmsignalen</div>
        <div style={{ fontSize: '13px', color: '#555', marginTop: '6px', lineHeight: 1.5 }}>{advice}</div>
        <div style={{ fontSize: '12px', color: '#777', marginTop: '8px' }}>Weekdoel: {overview.kcal} kcal, 130g eiwit</div>
      </InfoCard>

      {alarms.length > 0 && (
        <InfoCard>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {alarms.map(alarm => <Tag key={alarm} label={alarm} bg="#FFE5E5" color="#DC3545" />)}
          </div>
        </InfoCard>
      )}

      <form onSubmit={submit}>
        <InfoCard>
          <Field label="Datum">
            <input type="date" value={date} onChange={e => setDate(e.target.value)} style={inputStyle} />
          </Field>
          <MetricInput label="Gewicht (kg)" value={form.weightKg} onChange={v => update('weightKg', v)} placeholder="bijv. 88.4" />
          <MetricInput label="Buikomtrek (cm)" value={form.waistCm} onChange={v => update('waistCm', v)} placeholder="bijv. 96" />
          <MetricInput label="Slaap (uren)" value={form.sleepHours} onChange={v => update('sleepHours', v)} placeholder="bijv. 7.5" />
          <MetricInput label="Rusthartslag" value={form.restingHr} onChange={v => update('restingHr', v)} placeholder="bijv. 56" />
          <MetricInput label="HRV" value={form.hrv} onChange={v => update('hrv', v)} placeholder="optioneel" />
          <MetricInput label="Energie (1-5)" value={form.energyLevel} onChange={v => update('energyLevel', v)} placeholder="3" />
          <MetricInput label="Stemming (1-5)" value={form.moodLevel} onChange={v => update('moodLevel', v)} placeholder="3" />
          <MetricInput label="Spierpijn (uren)" value={form.sorenessHours} onChange={v => update('sorenessHours', v)} placeholder="bijv. 24" />
          <MetricInput label="Honger (1-5)" value={form.hungerLevel} onChange={v => update('hungerLevel', v)} placeholder="3" />
          <label style={{ display: 'flex', gap: '10px', alignItems: 'center', fontSize: '13px', color: '#444', margin: '10px 0 14px' }}>
            <input type="checkbox" checked={form.hrvLowSignal} onChange={e => update('hrvLowSignal', e.target.checked)} />
            HRV 3 dagen meer dan 20% laag
          </label>
          <Field label="Notities">
            <textarea value={form.notes} onChange={e => update('notes', e.target.value)} rows={3} placeholder="Hoe voel je je?" style={{ ...inputStyle, resize: 'vertical', fontFamily: 'inherit' }} />
          </Field>
          <button type="submit" style={{
            width: '100%', padding: '14px', borderRadius: '12px', border: 'none',
            background: '#003D7A', color: 'white', fontSize: '15px', fontWeight: 600, cursor: 'pointer',
          }}>Check-in opslaan</button>
          {message && <div style={{ fontSize: '13px', color: message.includes('opgeslagen') ? '#2C7A2C' : '#DC3545', marginTop: '10px', textAlign: 'center' }}>{message}</div>}
        </InfoCard>
      </form>

      <SectionTitle title="Historie" />
      {checkins.length === 0 ? (
        <InfoCard><div style={{ fontSize: '13px', color: '#666' }}>Nog geen check-ins opgeslagen.</div></InfoCard>
      ) : checkins.slice(0, 10).map(item => (
        <InfoCard key={item.id || item.date}>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px' }}>
            <div style={{ fontWeight: 700 }}>{new Date(item.date).toLocaleDateString('nl-NL', { day: 'numeric', month: 'short' })}</div>
            <div style={{ fontSize: '13px', color: '#666' }}>{[item.weight_kg && `${item.weight_kg} kg`, item.waist_cm && `${item.waist_cm} cm`, item.sleep_hours && `${item.sleep_hours}u slaap`].filter(Boolean).join(' · ')}</div>
          </div>
        </InfoCard>
      ))}
    </div>
  );
}

function MetricInput({ label, value, onChange, placeholder }) {
  return (
    <Field label={label}>
      <input type="number" inputMode="decimal" value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} style={inputStyle} />
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

function getAlarmSignals(form) {
  const alarms = [];
  if (Number(form.restingHr) >= 61) alarms.push('Rusthartslag +5 bpm');
  if (Number(form.sleepHours) > 0 && Number(form.sleepHours) < 7) alarms.push('Slaap < 7 uur');
  if (Number(form.moodLevel) > 0 && Number(form.moodLevel) <= 2) alarms.push('Lage stemming');
  if (Number(form.sorenessHours) > 72) alarms.push('Spierpijn > 72u');
  if (Number(form.hungerLevel) >= 5) alarms.push('Constante honger');
  if (form.hrvLowSignal) alarms.push('HRV 3 dagen laag');
  return alarms;
}

function LogView({ logs, setShowLogForm, deleteLog }) {
  const cycleLogs = logs.filter(l => l.type === 'cycle' && l.distance && l.duration);
  const avgSpeed = cycleLogs.length
    ? cycleLogs.reduce((s, l) => s + (l.distance / (l.duration / 60)), 0) / cycleLogs.length : 0;
  const avgHR = cycleLogs.filter(l => l.avg_hr).length
    ? cycleLogs.filter(l => l.avg_hr).reduce((s, l) => s + Number(l.avg_hr), 0) / cycleLogs.filter(l => l.avg_hr).length : 0;

  return (
    <div>
      {logs.length > 0 && (
        <div style={{
          background: 'linear-gradient(135deg, #003D7A 0%, #0058B0 100%)',
          color: 'white', padding: '20px', borderRadius: '16px',
          marginBottom: '20px', boxShadow: '0 4px 20px rgba(0, 61, 122, 0.15)',
        }}>
          <div style={{ fontSize: '11px', opacity: 0.85, fontWeight: 700, letterSpacing: '1px' }}>JOUW STATS</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginTop: '12px' }}>
            <div>
              <div style={{ fontSize: '12px', opacity: 0.75 }}>Workouts gelogd</div>
              <div style={{ fontSize: '24px', fontWeight: 700 }}>{logs.length}</div>
            </div>
            <div>
              <div style={{ fontSize: '12px', opacity: 0.75 }}>Gem. snelheid</div>
              <div style={{ fontSize: '24px', fontWeight: 700 }}>
                {avgSpeed > 0 ? avgSpeed.toFixed(1) : '-'} <span style={{ fontSize: '14px', opacity: 0.7 }}>km/h</span>
              </div>
            </div>
            <div>
              <div style={{ fontSize: '12px', opacity: 0.75 }}>Gem. HR</div>
              <div style={{ fontSize: '24px', fontWeight: 700 }}>
                {avgHR > 0 ? Math.round(avgHR) : '-'} <span style={{ fontSize: '14px', opacity: 0.7 }}>bpm</span>
              </div>
            </div>
            <div>
              <div style={{ fontSize: '12px', opacity: 0.75 }}>Fiets ritten</div>
              <div style={{ fontSize: '24px', fontWeight: 700 }}>{cycleLogs.length}</div>
            </div>
          </div>
        </div>
      )}

      {logs.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px 20px', color: '#666' }}>
          <div style={{ fontSize: '48px', marginBottom: '12px' }}>📊</div>
          <div style={{ fontSize: '17px', fontWeight: 600, marginBottom: '6px' }}>Nog geen workouts gelogd</div>
          <div style={{ fontSize: '14px', color: '#888', marginBottom: '20px' }}>
            Tik op de + knop om je eerste Apple Watch workout in te voeren.
          </div>
        </div>
      ) : (
        <div>{logs.map(log => <LogCard key={log.id} log={log} deleteLog={deleteLog} />)}</div>
      )}
    </div>
  );
}

function LogCard({ log, deleteLog }) {
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
    <div style={{
      background: 'white', borderRadius: '14px', padding: '14px', marginBottom: '10px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
      borderLeft: `4px solid ${log.type === 'cycle' ? '#003D7A' : '#7A3000'}`,
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '11px', color: '#888', fontWeight: 700, letterSpacing: '0.5px' }}>
            {new Date(log.date).toLocaleDateString('nl-NL', { weekday: 'short', day: 'numeric', month: 'short' }).toUpperCase()}
          </div>
          <div style={{ fontSize: '16px', fontWeight: 600, marginTop: '4px' }}>
            {log.type === 'cycle' ? '🚴 Fiets' : log.type === 'strength' ? '💪 Kracht' : '🚶 Wandelen'} • {log.duration} min
          </div>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', marginTop: '8px', fontSize: '13px', color: '#555' }}>
            {log.distance && <span>📏 {log.distance} km</span>}
            {speed && <span>💨 {speed} km/h</span>}
            {log.avg_hr && <span>❤️ {log.avg_hr} bpm {zone && `(${zone})`}</span>}
            {log.kcal && <span>🔥 {log.kcal} kcal</span>}
          </div>
          {log.notes && (
            <div style={{ fontSize: '13px', color: '#666', marginTop: '8px', fontStyle: 'italic' }}>"{log.notes}"</div>
          )}
        </div>
        <button onClick={() => deleteLog(log.id)} style={{
          background: 'transparent', border: 'none', color: '#999',
          fontSize: '16px', cursor: 'pointer', padding: '4px 8px',
        }}>🗑</button>
      </div>
    </div>
  );
}

function LogForm({ onSave, onClose, todayPlan }) {
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
    if (!form.duration) return alert('Vul minstens duur in');
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
    if (speed >= low && speed <= high) verdict = '✓ Perfect, in lijn met je plan';
    else if (speed > high) verdict = '🔥 Sneller dan verwacht — sterker dan plan';
    else if (speed < low * 0.8) verdict = '⚠️ Trager dan verwacht — wind, vermoeidheid, of fiets-issue?';
    else verdict = '↘ Iets onder verwachting, prima';
    analysis = { speed: speed.toFixed(1), zone, expectedSpeed, verdict };
  }

  return (
    <div onClick={onClose} style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 200,
      display: 'flex', alignItems: 'flex-end',
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        background: 'white', width: '100%', maxHeight: '90vh', overflowY: 'auto',
        borderTopLeftRadius: '24px', borderTopRightRadius: '24px', padding: '24px',
      }}>
        <div style={{ width: '40px', height: '4px', background: '#ddd', borderRadius: '2px', margin: '0 auto 20px' }} />
        <h2 style={{ margin: '0 0 4px', fontSize: '22px', fontWeight: 700 }}>Workout loggen</h2>
        <p style={{ margin: '0 0 20px', fontSize: '13px', color: '#888' }}>
          Voer in van je Apple Watch. Krijg direct inzicht hoe het past bij je plan.
        </p>

        <Field label="Datum">
          <input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} style={inputStyle} />
        </Field>

        <Field label="Type">
          <div style={{ display: 'flex', gap: '8px' }}>
            {[
              { key: 'cycle', label: '🚴 Fiets' },
              { key: 'strength', label: '💪 Kracht' },
              { key: 'walk', label: '🚶 Wandelen' },
            ].map(t => (
              <button key={t.key} onClick={() => setForm({ ...form, type: t.key })} style={{
                flex: 1, padding: '10px', borderRadius: '10px',
                border: form.type === t.key ? '2px solid #003D7A' : '2px solid #e5e5e5',
                background: form.type === t.key ? '#E5EDF7' : 'white',
                fontSize: '14px', fontWeight: 600, cursor: 'pointer',
              }}>{t.label}</button>
            ))}
          </div>
        </Field>

        <Field label="Duur (min) *">
          <input type="number" inputMode="decimal" value={form.duration} onChange={e => setForm({ ...form, duration: e.target.value })} placeholder="bijv. 45" style={inputStyle} />
        </Field>

        {form.type === 'cycle' && (
          <Field label="Afstand (km)">
            <input type="number" inputMode="decimal" step="0.1" value={form.distance} onChange={e => setForm({ ...form, distance: e.target.value })} placeholder="bijv. 12.5" style={inputStyle} />
          </Field>
        )}

        <Field label="Gemiddelde HR (bpm)">
          <input type="number" inputMode="numeric" value={form.avgHR} onChange={e => setForm({ ...form, avgHR: e.target.value })} placeholder="bijv. 142" style={inputStyle} />
        </Field>

        <Field label="Max HR (bpm)">
          <input type="number" inputMode="numeric" value={form.maxHR} onChange={e => setForm({ ...form, maxHR: e.target.value })} placeholder="bijv. 168" style={inputStyle} />
        </Field>

        <Field label="Calorieën">
          <input type="number" inputMode="numeric" value={form.kcal} onChange={e => setForm({ ...form, kcal: e.target.value })} placeholder="bijv. 380" style={inputStyle} />
        </Field>

        <Field label="Notities (optioneel)">
          <textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} placeholder="Hoe voelde het? Wind? Stops?" rows={2} style={{ ...inputStyle, resize: 'vertical', fontFamily: 'inherit' }} />
        </Field>

        {analysis && (
          <div style={{
            background: '#F0F4FA', borderRadius: '12px', padding: '14px',
            marginBottom: '16px', borderLeft: '4px solid #003D7A',
          }}>
            <div style={{ fontSize: '11px', color: '#003D7A', fontWeight: 700, letterSpacing: '1px', marginBottom: '8px' }}>
              ANALYSE
            </div>
            <div style={{ fontSize: '14px', lineHeight: 1.6 }}>
              Gemiddeld <strong>{analysis.speed} km/h</strong> in <strong>{analysis.zone}</strong> ({analysis.expectedSpeed} km/h verwacht)
              <div style={{ marginTop: '6px', color: '#444' }}>{analysis.verdict}</div>
            </div>
          </div>
        )}

        <div style={{ display: 'flex', gap: '8px' }}>
          <button onClick={onClose} style={{
            flex: 1, padding: '14px', borderRadius: '12px', border: '2px solid #e5e5e5',
            background: 'white', fontSize: '15px', fontWeight: 600, cursor: 'pointer',
          }}>Annuleren</button>
          <button onClick={handleSubmit} style={{
            flex: 2, padding: '14px', borderRadius: '12px', border: 'none',
            background: '#003D7A', color: 'white', fontSize: '15px', fontWeight: 600, cursor: 'pointer',
          }}>Opslaan</button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div style={{ marginBottom: '14px' }}>
      <div style={{ fontSize: '12px', color: '#666', fontWeight: 600, marginBottom: '6px' }}>{label}</div>
      {children}
    </div>
  );
}

const inputStyle = {
  width: '100%', padding: '12px', borderRadius: '10px',
  border: '2px solid #e5e5e5', fontSize: '15px',
  outline: 'none', background: 'white', boxSizing: 'border-box',
};

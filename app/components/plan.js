'use client';

import { useState } from 'react';
import {
  Activity, Bike, CheckCircle2, Clock3, Dumbbell, Flame,
  Gauge, HeartPulse, Star, Target,
} from 'lucide-react';
import { PLAN_DATA, TYPE_META } from '../../lib/plan-data';
import {
  HEART_ZONES, MEASUREMENT_MOMENTS, NUTRITION_GUIDE, PERFORMANCE_REFERENCES,
  PRACTICAL_TIPS, STRENGTH_GUIDE, END_GOALS,
  getMeasurementMomentByDate, getMeasurementTitle, getWeekOverview,
} from '../../lib/plan-content';
import { withDefaultSettings } from '../../lib/insights';
import { formatDate, formatDateShort, getTodayString } from '../../lib/utils';
import {
  IconBadge, InfoCard, MetricTile, SectionTitle, Segmented, SimpleList, Tag,
} from './ui';
import { CyclingWeatherCard, getWeatherQualityLabel, WeatherConditionIcon } from './weather';
import { CyclingRouteCard } from './cycling-route-card';
import { ModalShell } from './ModalShell';

export function DashboardStrip({ today, overview, progressPct, dueMeasurement, t }) {
  const meta = TYPE_META[today.type];
  const measurementLabel = dueMeasurement
    ? `${formatDateShort(dueMeasurement.date, t('localeTag'))} - ${dueMeasurement.title}`
    : t('noOpenMeasurement');
  return (
    <section className="dashboard-strip" aria-label={t('trainingDashboard')}>
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

export function AdaptiveAdviceCard({ advice, t }) {
  const color = advice.level === 'warning' ? 'var(--danger)' : advice.level === 'caution' ? 'var(--warn)' : 'var(--success)';
  const bg = advice.level === 'warning' ? 'var(--danger-tint)' : advice.level === 'caution' ? 'var(--warn-tint)' : 'var(--success-tint)';
  return (
    <InfoCard style={{ borderLeft: `4px solid ${color}` }}>
      <div className="signal-kicker" style={{ color }}>{t('adaptiveAdvice')}</div>
      <div style={{ fontSize: '17px', fontWeight: 800, marginTop: '4px', color: 'var(--ink)' }}>{advice.title}</div>
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '10px' }}>
        {advice.alarms?.map(alarm => <Tag key={alarm} icon={Activity} label={alarm} bg={bg} color={color} />)}
      </div>
      <SimpleList items={advice.items} />
    </InfoCard>
  );
}

export function DailyHabitCard({ day, habit, settings, onToggle, t }) {
  const config = withDefaultSettings(settings);
  const items = [
    ['protein_done', t('proteinDone'), `${config.protein_target}g`],
    ['water_done', t('waterDone'), `${config.water_target}L`],
    ['kcal_done', t('kcalDone'), `${config.kcal_target} kcal`],
  ];
  if (['cycle', 'strength', 'walk'].includes(day.type)) {
    items.push(['post_workout_protein_done', t('postWorkoutDone'), '25-30g']);
  }
  return (
    <InfoCard>
      <div className="signal-kicker signal-kicker--accent">{t('dailyChecklist')}</div>
      <div style={{ display: 'grid', gap: '8px', marginTop: '10px' }}>
        {items.map(([key, label, hint]) => {
          const checked = !!habit[key];
          return (
            <label key={key} style={{ display: 'flex', alignItems: 'center', gap: '10px', minHeight: '44px', padding: '10px', borderRadius: 'var(--radius)', border: '1px solid var(--line)', background: checked ? 'var(--success-tint)' : 'var(--surface-2)', cursor: 'pointer' }}>
              <input type="checkbox" checked={checked} onChange={e => onToggle({ [key]: e.target.checked })} style={{ width: '18px', height: '18px', accentColor: 'var(--success)', cursor: 'pointer' }} />
              <span style={{ flex: 1, fontSize: '14px', fontWeight: 700, color: 'var(--ink)' }}>{label}</span>
              <span style={{ color: 'var(--muted)', fontSize: '12px' }}>{hint}</span>
            </label>
          );
        })}
      </div>
    </InfoCard>
  );
}

export function MeasurementBanner({ moment, onOpen, t }) {
  const isOverdue = moment.date < getTodayString();
  return (
    <InfoCard style={{ borderLeft: '4px solid var(--action)', marginBottom: 0, background: 'var(--warn-tint)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', alignItems: 'center' }}>
        <div>
          <div className="eyebrow" style={{ color: 'var(--warn)' }}>
            {isOverdue ? t('measurementOpen') : t('measurementToday')}
          </div>
          <div style={{ fontSize: '17px', fontWeight: 700, marginTop: '4px', color: 'var(--ink)' }}>{moment.title}</div>
          <div style={{ fontSize: '13px', color: 'var(--muted)', marginTop: '4px' }}>{formatDateShort(moment.date, t('localeTag'))} · {moment.focus}</div>
        </div>
        <button type="button" onClick={onOpen} style={{ border: 'none', background: 'var(--accent)', color: 'white', borderRadius: 'var(--radius)', padding: '12px 16px', fontSize: '13px', fontWeight: 700, cursor: 'pointer', flex: '0 0 auto', minHeight: '44px' }}>
          {t('open')}
        </button>
      </div>
    </InfoCard>
  );
}

export function TodayView({ day, completed, toggleComplete, overview, onOpenMeasurement, habit, saveDailyHabit, adaptiveAdvice, settings, cyclingWeather, onRetryWeather, logs, userEmail, t }) {
  const meta = TYPE_META[day.type];
  const isComplete = !!completed[day.id];
  const measurementMoment = day.type === 'check' ? getMeasurementMomentByDate(day.date) : null;
  const title = measurementMoment?.title || day.title;

  return (
    <div className="dashboard-grid">
      <div className="info-card hero-card" style={{ background: 'var(--surface)', borderRadius: 'var(--radius-lg)', padding: '24px', borderLeft: `4px solid ${isComplete ? 'var(--success)' : meta.color}` }}>
        <div style={{ marginBottom: '16px' }}>
          <div style={{ fontSize: '12px', color: meta.color, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            {day.day.toUpperCase()} {formatDate(day.date, t('localeTag'), { day: 'numeric', month: 'long' }).toUpperCase()}
          </div>
          <div style={{ fontFamily: 'var(--font-display), var(--font-body), sans-serif', fontSize: '26px', fontWeight: 800, marginTop: '4px', display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--ink)' }}>
            <IconBadge type={day.type} color={meta.color} bg={meta.bg} size={48} iconSize={26} />
            {title}
          </div>
        </div>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '16px' }}>
          {day.dur > 0 && <Tag icon={Clock3} label={`${day.dur} min`} bg={meta.bg} color={meta.color} />}
          {day.hr && <Tag icon={HeartPulse} label={`HR ${day.hr}`} bg="var(--danger-tint)" color="var(--danger)" />}
          {day.speed && <Tag icon={Gauge} label={day.speed} bg="var(--info-tint)" color="var(--accent)" />}
          {day.target && <Tag icon={Target} label={day.target} bg="var(--warn-tint)" color="var(--warn)" />}
        </div>
        {day.desc && <div style={{ fontSize: '15px', color: 'var(--muted)', lineHeight: 1.5, marginBottom: '20px' }}>{day.desc}</div>}
        {measurementMoment && (
          <div style={{ fontSize: '15px', color: 'var(--muted)', lineHeight: 1.5, marginBottom: '20px' }}>
            <div style={{ fontWeight: 700, marginBottom: '6px', color: 'var(--ink)' }}>{measurementMoment.focus}</div>
            <SimpleList items={measurementMoment.items} />
            <button type="button" onClick={() => onOpenMeasurement(day.date)} style={{ width: '100%', marginTop: '14px', padding: '14px', borderRadius: 'var(--radius)', border: 'none', background: 'var(--accent)', color: 'white', fontSize: '15px', fontWeight: 700, cursor: 'pointer', minHeight: '44px' }}>
              {t('openMeasurement')}
            </button>
          </div>
        )}
        <button type="button" onClick={() => toggleComplete(day.id)} style={{ width: '100%', padding: '14px', borderRadius: 'var(--radius)', border: 'none', background: isComplete ? 'var(--success)' : meta.color, color: 'white', fontSize: '16px', fontWeight: 600, cursor: 'pointer', minHeight: '44px' }}>
          {isComplete ? t('completed') : t('markComplete')}
        </button>
      </div>

      <div className="side-panel">
        <div className="premium-card" style={{ borderRadius: 'var(--radius-lg)', padding: '18px' }}>
          <div className="eyebrow" style={{ opacity: 0.78, marginBottom: '10px' }}>{t('dayGoals')}</div>
          <div className="metric-grid">
            <MetricTile icon={Flame} label="Kcal" value={overview.kcal} />
            <MetricTile icon={Dumbbell} label={t('protein')} value="130g" />
            <MetricTile icon={Activity} label={t('water')} value="2L" />
          </div>
        </div>
        <AdaptiveAdviceCard advice={adaptiveAdvice} t={t} />
        {day.type === 'cycle' && <CyclingWeatherCard recommendation={cyclingWeather.byDate?.[day.date]} status={cyclingWeather.status} location={cyclingWeather.location} onRetry={onRetryWeather} t={t} />}
        {day.type === 'cycle' && <CyclingRouteCard day={day} cycleLogs={logs} userEmail={userEmail} t={t} />}
        <DailyHabitCard day={day} habit={habit} settings={settings} onToggle={(patch) => saveDailyHabit(habit.date, patch)} t={t} />
        <div className="info-card" style={{ background: 'var(--surface)', borderRadius: 'var(--radius-lg)', padding: '18px' }}>
          <div className="eyebrow" style={{ color: 'var(--muted)', marginBottom: '10px' }}>{t('rememberToday')}</div>
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

export function DayCard({ day: rawDay, completed, toggleComplete, onSelectDay, cyclingWeather, compact, t }) {
  const day = rawDay.type === 'check' ? { ...rawDay, title: getMeasurementTitle(rawDay.date) } : rawDay;
  const meta = TYPE_META[day.type];
  const isComplete = !!completed[day.id];
  const dateStr = formatDate(day.date, t('localeTag'), { day: 'numeric', month: 'short' });
  const weather = day.type === 'cycle' ? cyclingWeather?.byDate?.[day.date] : null;

  return (
    <div className="day-card" style={{ background: 'var(--surface)', borderRadius: 'var(--radius-lg)', padding: '14px', marginBottom: '10px', borderLeft: `4px solid ${meta.color}`, opacity: isComplete ? 0.7 : 1, display: 'flex', alignItems: 'center', gap: '12px' }}>
      <button
        type="button"
        onClick={() => onSelectDay(day)}
        aria-label={`${day.title}, ${dateStr}`}
        style={{
          flex: 1, minWidth: 0, display: 'flex', alignItems: 'center', gap: '12px',
          background: 'transparent', border: 'none', padding: 0, cursor: 'pointer',
          textAlign: 'left', color: 'inherit', minHeight: '44px',
        }}
      >
        <IconBadge type={day.type} color={meta.color} bg={meta.bg} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: '11px', color: meta.color, fontWeight: 700, letterSpacing: '0.08em' }}>
            {day.day.toUpperCase()} {dateStr.toUpperCase()} {day.dur > 0 ? `· ${day.dur} MIN` : ''}
          </div>
          <div style={{ fontSize: '15px', fontWeight: 600, marginTop: '2px', textDecoration: isComplete ? 'line-through' : 'none', color: 'var(--ink)' }}>
            {day.title}
            {day.intense && <Flame size={15} aria-label={t('intenseLabel')} style={{ marginLeft: 6, verticalAlign: '-2px', color: 'var(--warn)' }} />}
            {day.big && <Star size={15} aria-label={t('importantLabel')} style={{ marginLeft: 6, verticalAlign: '-2px', color: 'var(--action)' }} />}
          </div>
          {!compact && day.target && <div style={{ fontSize: '12px', color: 'var(--muted-2)', marginTop: '2px' }}>{day.target}</div>}
          {!compact && weather && (
            <div style={{ display: 'flex', gap: '6px', alignItems: 'center', color: 'var(--accent-strong)', fontSize: '12px', fontWeight: 800, marginTop: '6px' }}>
              <WeatherConditionIcon weatherCode={weather.weatherCode} isDay={weather.isDay} size={14} />
              {weather.startTime}-{weather.endTime} · {getWeatherQualityLabel(weather.quality, t)}
            </div>
          )}
        </div>
      </button>
      <button
        type="button"
        aria-label={isComplete ? `${day.title} ${t('markIncomplete')}` : `${day.title} ${t('markComplete')}`}
        aria-pressed={isComplete}
        onClick={() => toggleComplete(day.id)}
        style={{
          width: '44px', height: '44px', minWidth: '44px', borderRadius: '999px',
          border: `2px solid ${isComplete ? 'var(--success)' : 'var(--line)'}`,
          background: isComplete ? 'var(--success)' : 'var(--surface)',
          color: 'white', cursor: 'pointer', fontSize: '14px', fontWeight: 700, flexShrink: 0,
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        }}
      >
        {isComplete ? <CheckCircle2 size={18} aria-hidden="true" /> : <span className="sr-only">{t('notCompleted')}</span>}
      </button>
    </div>
  );
}

export function DayDetail({ day, onClose, completed, toggleComplete, cyclingWeather, onRetryWeather, logs, userEmail, t }) {
  const meta = TYPE_META[day.type];
  const isComplete = !!completed[day.id];
  const weather = day.type === 'cycle' ? cyclingWeather?.byDate?.[day.date] : null;

  return (
    <ModalShell open onClose={onClose} titleId="day-detail-title" closeLabel={t('cancel')}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
        <IconBadge type={day.type} color={meta.color} bg={meta.bg} size={46} iconSize={24} />
        <div>
          <div style={{ fontSize: '12px', color: meta.color, fontWeight: 700, letterSpacing: '0.08em' }}>
            {day.day.toUpperCase()} {formatDate(day.date, t('localeTag'), { day: 'numeric', month: 'long', year: 'numeric' }).toUpperCase()}
          </div>
          <div id="day-detail-title" style={{ fontSize: '24px', fontWeight: 800, color: 'var(--ink)' }}>{day.title}</div>
        </div>
      </div>
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '16px' }}>
        {day.dur > 0 && <Tag icon={Clock3} label={`${day.dur} min`} bg={meta.bg} color={meta.color} />}
        {day.hr && <Tag icon={HeartPulse} label={day.hr} bg="var(--danger-tint)" color="var(--danger)" />}
        {day.speed && <Tag icon={Gauge} label={day.speed} bg="var(--info-tint)" color="var(--accent)" />}
        {day.target && <Tag icon={Target} label={day.target} bg="var(--warn-tint)" color="var(--warn)" />}
      </div>
      {day.desc && <div style={{ fontSize: '15px', color: 'var(--muted)', lineHeight: 1.6, marginBottom: '20px', background: 'var(--surface-2)', padding: '16px', borderRadius: 'var(--radius)' }}>{day.desc}</div>}
      {day.type === 'cycle' && <CyclingWeatherCard recommendation={weather} status={cyclingWeather?.status || 'idle'} location={cyclingWeather?.location} onRetry={onRetryWeather} t={t} />}
      {day.type === 'cycle' && <CyclingRouteCard day={day} cycleLogs={logs} userEmail={userEmail} t={t} />}
      <button type="button" onClick={() => { toggleComplete(day.id); onClose(); }} style={{ width: '100%', padding: '14px', borderRadius: 'var(--radius)', border: 'none', background: isComplete ? 'var(--muted)' : meta.color, color: 'white', fontSize: '15px', fontWeight: 700, cursor: 'pointer', minHeight: '44px' }}>
        {isComplete ? t('markIncomplete') : t('completeDay')}
      </button>
    </ModalShell>
  );
}

export function WeekView({ days, completed, toggleComplete, onSelectDay, weekNum, cyclingWeather, t }) {
  return (
    <div className="section-shell">
      <div className="signal-card" style={{ marginBottom: '4px' }}>
        <div className="signal-kicker">{t('weekPlanning')}</div>
        <div className="signal-value">Week {weekNum}</div>
        <div className="signal-note">{t('daysCompleted', { done: days.filter(d => completed[d.id]).length, total: days.length })}</div>
      </div>
      {days.map(d => <DayCard key={d.id} day={d} completed={completed} toggleComplete={toggleComplete} onSelectDay={onSelectDay} cyclingWeather={cyclingWeather} t={t} />)}
    </div>
  );
}

export function AllView({ completed, toggleComplete, onSelectDay, cyclingWeather, t }) {
  return (
    <div className="section-shell">
      {[...new Set(PLAN_DATA.map(d => d.week))].map(w => {
        const wd = PLAN_DATA.filter(d => d.week === w);
        const compl = wd.filter(d => completed[d.id]).length;
        return (
          <div key={w} style={{ marginBottom: '24px' }}>
            <div className="signal-kicker" style={{ color: 'var(--accent-strong)', margin: '0 4px 10px' }}>Week {w} · {compl}/{wd.length}</div>
            {wd.map(d => <DayCard key={d.id} day={d} completed={completed} toggleComplete={toggleComplete} onSelectDay={onSelectDay} cyclingWeather={cyclingWeather} compact t={t} />)}
          </div>
        );
      })}
    </div>
  );
}

// Agenda — week focus + the full 6-week plan. The reference manual moved to Gids.
export function AgendaView({ completed, toggleComplete, onSelectDay, currentWeek, cyclingWeather, t }) {
  const overview = getWeekOverview(currentWeek);
  return (
    <div>
      <InfoCard style={{ background: 'var(--surface-2)', borderLeft: '4px solid var(--accent)' }}>
        <div className="signal-kicker signal-kicker--accent">{t('weekFocusLabel', { week: currentWeek })}</div>
        <div style={{ fontFamily: 'var(--font-display), var(--font-body), sans-serif', fontSize: '22px', fontWeight: 800, marginTop: '6px' }}>{overview.focus}</div>
        <div className="metric-grid" style={{ marginTop: '14px' }}>
          <MetricTile icon={Clock3} label={t('period')} value={overview.period} />
          <MetricTile icon={Bike} label={t('longRide')} value={overview.longRide} />
          <MetricTile icon={Flame} label={t('nutrition')} value={`${overview.kcal} kcal`} />
        </div>
      </InfoCard>
      <div className="route-strip" aria-hidden="true" style={{ margin: '14px 4px' }}>
        <span className="route-line" />
      </div>
      <AllView completed={completed} toggleComplete={toggleComplete} onSelectDay={onSelectDay} cyclingWeather={cyclingWeather} t={t} />
    </div>
  );
}

// Gids — the reference manual (zones, nutrition, strength, tips), reachable from
// the header menu now that Agenda holds the calendar.
export function GuideView({ currentWeek, t }) {
  const [section, setSection] = useState('zones');
  const sections = [
    { key: 'zones', label: t('zones') },
    { key: 'food', label: t('nutrition') }, { key: 'strength', label: t('strength') },
    { key: 'tips', label: t('tips') },
  ];
  return (
    <div>
      <InfoCard style={{ background: 'var(--surface-2)', borderLeft: '4px solid var(--accent)' }}>
        <div className="signal-kicker signal-kicker--accent">{t('guide')}</div>
        <div style={{ fontSize: '14px', color: 'var(--muted)', marginTop: '6px', lineHeight: 1.5 }}>{t('guideSub')}</div>
      </InfoCard>
      <Segmented options={sections} value={section} onChange={setSection} ariaLabel={t('planSections')} idBase="guide" />
      <div role="tabpanel" id={`guide-panel-${section}`} aria-labelledby={`guide-tab-${section}`} tabIndex={0}>
        {section === 'zones' && <ZonesSection t={t} />}
        {section === 'food' && <NutritionSection currentWeek={currentWeek} t={t} />}
        {section === 'strength' && <StrengthSection t={t} />}
        {section === 'tips' && <TipsSection t={t} />}
      </div>
    </div>
  );
}

function ZonesSection({ t }) {
  return (
    <div>
      <SectionTitle title={t('heartZones')} subtitle={t('heartZonesSub')} />
      {HEART_ZONES.map((zone, i) => (
        <InfoCard key={zone.zone} style={{ borderLeft: `4px solid var(--zone-${Math.min(i + 1, 5)})` }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px' }}>
            <div>
              <div style={{ fontSize: '18px', fontWeight: 800, color: `var(--zone-${Math.min(i + 1, 5)})` }}>{zone.zone}</div>
              <div style={{ fontSize: '13px', color: 'var(--muted)', marginTop: '4px' }}>{zone.feel}</div>
            </div>
            <div style={{ textAlign: 'right', fontSize: '13px', color: 'var(--muted)' }}>
              <div style={{ fontWeight: 700, color: 'var(--ink)' }}>{zone.hr} bpm</div>
              <div>{zone.speed}</div>
            </div>
          </div>
          <div style={{ fontSize: '13px', color: 'var(--muted)', marginTop: '10px' }}>{zone.goal}</div>
        </InfoCard>
      ))}
      <SectionTitle title={t('yourReference')} subtitle={t('referenceSub')} />
      {PERFORMANCE_REFERENCES.map(item => (
        <InfoCard key={item.label}>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontSize: '15px', fontWeight: 800, color: 'var(--accent)' }}>{item.label}</div>
              <div style={{ fontSize: '13px', color: 'var(--muted)', marginTop: '4px' }}>{item.detail}</div>
            </div>
            <div style={{ fontSize: '13px', color: 'var(--ink)', fontWeight: 700, textAlign: 'right' }}>{item.value}</div>
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
      <InfoCard><SimpleList items={NUTRITION_GUIDE.rules} /></InfoCard>
      <SectionTitle title={t('proteinSources')} />
      {NUTRITION_GUIDE.proteinSources.map(([name, portion, protein, tip]) => (
        <InfoCard key={name}>
          <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 0.8fr 0.7fr', gap: '8px', alignItems: 'center' }}>
            <div style={{ fontWeight: 700, color: 'var(--ink)' }}>{name}</div>
            <div style={{ fontSize: '13px', color: 'var(--muted)' }}>{portion}</div>
            <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--accent)' }}>{protein}</div>
          </div>
          <div style={{ fontSize: '13px', color: 'var(--muted)', marginTop: '6px' }}>{tip}</div>
        </InfoCard>
      ))}
      <SectionTitle title={t('sampleDay')} />
      <InfoCard><SimpleList items={NUTRITION_GUIDE.sampleDay} /></InfoCard>
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
            <div style={{ fontWeight: 700, color: 'var(--ink)' }}>{exercise.name}</div>
            {exercise.guideUrl && (
              <a href={exercise.guideUrl} target="_blank" rel="noopener noreferrer" style={{ flex: '0 0 auto', padding: '10px 14px', borderRadius: 'var(--radius)', background: 'var(--accent)', color: 'white', fontSize: '12px', fontWeight: 800, textDecoration: 'none', minHeight: '36px', display: 'inline-flex', alignItems: 'center' }}>
                {t('explanation', { source: exercise.guideSource })}
              </a>
            )}
          </div>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '8px' }}>
            <Tag icon={Dumbbell} label={exercise.sets} bg="var(--info-tint)" color="var(--accent)" />
            <Tag icon={Clock3} label={exercise.rest} bg="var(--warn-tint)" color="var(--warn)" />
          </div>
          <div style={{ fontSize: '13px', color: 'var(--muted)', marginTop: '8px', lineHeight: 1.5 }}>{exercise.notes}</div>
          {exercise.steps && (
            <div style={{ marginTop: '12px' }}>
              <div className="eyebrow" style={{ color: 'var(--accent)', marginBottom: '8px' }}>{t('execution')}</div>
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
          <div style={{ fontSize: '16px', fontWeight: 700, marginBottom: '8px', color: 'var(--ink)' }}>{group.title}</div>
          <SimpleList items={group.items} />
        </InfoCard>
      ))}
      <SectionTitle title={t('realisticEnd')} />
      <InfoCard><SimpleList items={END_GOALS} /></InfoCard>
    </div>
  );
}

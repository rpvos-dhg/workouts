import { PLAN_DATA } from './plan-data.js';

export const DEFAULT_USER_SETTINGS = {
  kcal_target: 2400,
  protein_target: 130,
  water_target: 2,
  resting_hr_baseline: 56,
  reminder_enabled: true,
  reminder_time: '20:00',
  timezone: 'Europe/Amsterdam',
  heart_zones: [
    { zone: 'Z1', min: 121, max: 134 },
    { zone: 'Z2', min: 134, max: 147 },
    { zone: 'Z3', min: 147, max: 160 },
    { zone: 'Z4', min: 160, max: 173 },
    { zone: 'Z5', min: 173, max: 186 },
  ],
};

export function withDefaultSettings(settings = {}) {
  return {
    ...DEFAULT_USER_SETTINGS,
    ...(settings || {}),
    heart_zones: Array.isArray(settings?.heart_zones) && settings.heart_zones.length
      ? settings.heart_zones
      : DEFAULT_USER_SETTINGS.heart_zones,
  };
}

export function getHeartZone(avgHr, settings = DEFAULT_USER_SETTINGS) {
  const hr = Number(avgHr);
  if (!Number.isFinite(hr)) return null;
  const zones = withDefaultSettings(settings).heart_zones;
  const match = zones.find(zone => hr >= Number(zone.min) && hr < Number(zone.max));
  if (match) return match.zone;
  if (hr < Number(zones[0]?.min || 121)) return 'Onder Z1';
  return zones[zones.length - 1]?.zone || 'Z5';
}

function sortedByDate(rows = []) {
  return [...rows].filter(row => row?.date).sort((a, b) => String(a.date).localeCompare(String(b.date)));
}

function trend(rows, key) {
  return sortedByDate(rows)
    .map(row => ({ date: row.date, value: Number(row[key]) }))
    .filter(point => Number.isFinite(point.value) && point.value > 0);
}

function avg(values) {
  const clean = values.map(Number).filter(Number.isFinite);
  return clean.length ? clean.reduce((sum, value) => sum + value, 0) / clean.length : 0;
}

export function calculateTrendStats({ logs = [], checkins = [], completed = {}, planData = PLAN_DATA } = {}) {
  const cycleLogs = logs.filter(log => log.type === 'cycle' && Number(log.distance) > 0 && Number(log.duration) > 0);
  const speeds = cycleLogs.map(log => Number(log.distance) / (Number(log.duration) / 60));
  const hrValues = logs.map(log => Number(log.avg_hr)).filter(Number.isFinite);
  const weekProgress = [1, 2, 3, 4, 5, 6].map(week => {
    const days = planData.filter(day => day.week === week);
    const done = days.filter(day => completed[day.id]).length;
    return { date: `W${week}`, value: days.length ? Math.round((done / days.length) * 100) : 0 };
  });

  return {
    weight: trend(checkins, 'weight_kg'),
    waist: trend(checkins, 'waist_cm'),
    sleep: trend(checkins, 'sleep_hours'),
    restingHr: trend(checkins, 'resting_hr'),
    speed: sortedByDate(cycleLogs).map(log => ({
      date: log.date,
      value: Number(log.distance) / (Number(log.duration) / 60),
    })),
    avgHr: sortedByDate(logs).map(log => ({ date: log.date, value: Number(log.avg_hr) })).filter(point => Number.isFinite(point.value)),
    weekProgress,
    summary: {
      workouts: logs.length,
      cycleRides: cycleLogs.length,
      avgSpeed: avg(speeds),
      avgHr: avg(hrValues),
      latestWeight: trend(checkins, 'weight_kg').at(-1)?.value || 0,
      latestWaist: trend(checkins, 'waist_cm').at(-1)?.value || 0,
    },
  };
}

export function getAdaptiveAdvice({
  today,
  completed = {},
  logs = [],
  checkins = [],
  settings = DEFAULT_USER_SETTINGS,
  todayString = new Date().toISOString().slice(0, 10),
} = {}) {
  const config = withDefaultSettings(settings);
  const latestCheckin = sortedByDate(checkins).at(-1);
  const missedRecent = PLAN_DATA
    .filter(day => ['cycle', 'strength', 'walk'].includes(day.type) && day.date < todayString)
    .slice(-7)
    .filter(day => !completed[day.id]).length;
  const recentLogs = sortedByDate(logs).slice(-4);
  const recentCycleSpeeds = recentLogs
    .filter(log => log.type === 'cycle' && Number(log.distance) > 0 && Number(log.duration) > 0)
    .map(log => Number(log.distance) / (Number(log.duration) / 60));
  const baselineHr = Number(config.resting_hr_baseline) || DEFAULT_USER_SETTINGS.resting_hr_baseline;
  const alarms = [];

  if (latestCheckin) {
    if (Number(latestCheckin.sleep_hours) > 0 && Number(latestCheckin.sleep_hours) < 7) alarms.push('Slaap onder 7 uur');
    if (Number(latestCheckin.resting_hr) >= baselineHr + 5) alarms.push('Rusthartslag boven baseline');
    if (Number(latestCheckin.mood_level) > 0 && Number(latestCheckin.mood_level) <= 2) alarms.push('Lage stemming');
    if (Number(latestCheckin.soreness_hours) > 72) alarms.push('Spierpijn langer dan 72 uur');
    if (Number(latestCheckin.hunger_level) >= 5) alarms.push('Honger hoog');
    if (latestCheckin.hrv_low_signal) alarms.push('HRV-signaal laag');
  }

  if (missedRecent >= 2) alarms.push('Meerdere recente trainingen gemist');

  const avgRecentSpeed = avg(recentCycleSpeeds);
  const todayIsHard = today?.intense || today?.big;
  if (alarms.length >= 2) {
    return {
      level: 'warning',
      title: 'Herstel eerst',
      items: [
        'Houd de training vandaag bewust rustig of maak er herstel van.',
        `Blijf rond ${config.kcal_target} kcal en ${config.protein_target}g eiwit.`,
        'Check slaap, rusthartslag en spierpijn opnieuw voor je intensiteit opvoert.',
      ],
      alarms,
    };
  }

  if (todayIsHard && latestCheckin && Number(latestCheckin.sleep_hours) > 0 && Number(latestCheckin.sleep_hours) < 7.5) {
    return {
      level: 'caution',
      title: 'Intensiteit bewaken',
      items: [
        'Start de sessie conservatief en stop als hartslag of gevoel niet klopt.',
        'Gebruik hartslagzones als limiet; snelheid is vandaag secundair.',
      ],
      alarms,
    };
  }

  if (avgRecentSpeed > 0) {
    return {
      level: 'ok',
      title: 'Plan vasthouden',
      items: [
        `Recente fietssnelheid gemiddeld ${avgRecentSpeed.toFixed(1)} km/h.`,
        'Geen duidelijke alarmsignalen: rond de geplande training af.',
      ],
      alarms,
    };
  }

  return {
    level: 'ok',
    title: 'Rustige opbouw',
    items: [
      'Volg het schema en log je workout voor betere analyse.',
      'Meetmomenten blijven leidend voor aanpassingen.',
    ],
    alarms,
  };
}

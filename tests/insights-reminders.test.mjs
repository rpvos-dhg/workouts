import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateTrendStats, getAdaptiveAdvice, getHeartZone } from '../lib/insights.js';
import { getReminderTargets } from '../lib/reminders.js';

test('calculates trend stats from logs and checkins', () => {
  const stats = calculateTrendStats({
    logs: [
      { date: '2026-05-01', type: 'cycle', duration: 60, distance: 15, avg_hr: 140 },
      { date: '2026-05-02', type: 'cycle', duration: 30, distance: 10, avg_hr: 150 },
    ],
    checkins: [
      { date: '2026-04-28', weight_kg: 90, waist_cm: 100, sleep_hours: 7, resting_hr: 56 },
      { date: '2026-05-18', weight_kg: 88, waist_cm: 97, sleep_hours: 6.5, resting_hr: 62 },
    ],
    completed: { 1: true },
  });

  assert.equal(stats.weight.length, 2);
  assert.equal(stats.summary.cycleRides, 2);
  assert.equal(Math.round(stats.summary.avgSpeed), 18);
});

test('uses custom heart zones', () => {
  assert.equal(getHeartZone(130, { heart_zones: [{ zone: 'Easy', min: 120, max: 140 }] }), 'Easy');
});

test('raises adaptive recovery advice on multiple alarms', () => {
  const advice = getAdaptiveAdvice({
    today: { type: 'cycle', intense: true },
    completed: {},
    logs: [],
    todayString: '2026-05-20',
    settings: { resting_hr_baseline: 55, kcal_target: 2400, protein_target: 130 },
    checkins: [{ date: '2026-05-18', sleep_hours: 6, resting_hr: 62, mood_level: 2 }],
  });

  assert.equal(advice.level, 'warning');
  assert.ok(advice.alarms.length >= 2);
});

test('selects open training and measurement reminder targets', () => {
  const targets = getReminderTargets({
    now: new Date('2026-05-18T18:00:00Z'),
    settings: { timezone: 'Europe/Amsterdam', reminder_enabled: true },
    completedDayIds: [],
    checkinDates: ['2026-04-28'],
  });

  assert.ok(targets.some(target => target.kind === 'measurement'));
});

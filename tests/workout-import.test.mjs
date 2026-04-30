import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeWorkoutImport, parseWorkoutCsv } from '../lib/workout-import.js';

test('normalizes iOS Shortcut workout payloads', () => {
  const workout = normalizeWorkoutImport({
    source: 'ios_shortcut',
    externalId: 'abc',
    startedAt: '2026-05-02T20:00:00+02:00',
    endedAt: '2026-05-02T21:00:00+02:00',
    type: 'cycling',
    distanceKm: 18.2,
    kcal: 530,
    avgHr: 142,
    maxHr: 168,
    notes: 'Imported from Apple Health',
  });

  assert.equal(workout.date, '2026-05-02');
  assert.equal(workout.type, 'cycle');
  assert.equal(workout.duration, 60);
  assert.equal(workout.distance, 18.2);
  assert.equal(workout.avg_hr, 142);
  assert.equal(workout.max_hr, 168);
  assert.equal(workout.external_id, 'abc');
});

test('uses stable dedupe keys for identical external ids', () => {
  const first = normalizeWorkoutImport({ source: 'ios_shortcut', externalId: 'same', date: '2026-05-02', type: 'cycling', durationMin: 45 });
  const second = normalizeWorkoutImport({ source: 'ios_shortcut', externalId: 'same', date: '2026-05-03', type: 'cycling', durationMin: 60 });
  assert.equal(first.dedupe_key, second.dedupe_key);
});

test('parses HealthFit-style CSV rows', () => {
  const rows = parseWorkoutCsv('date,type,durationMin,distanceKm,kcal,avgHr\n2026-05-02,cycling,60,18.2,530,142', { source: 'csv' });
  assert.equal(rows.length, 1);
  assert.equal(rows[0].source, 'csv');
  assert.equal(rows[0].type, 'cycle');
  assert.equal(rows[0].duration, 60);
});

test('rejects imports without duration', () => {
  assert.throws(() => normalizeWorkoutImport({ date: '2026-05-02', type: 'cycling' }), /duration/i);
});

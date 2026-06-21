import test from 'node:test';
import assert from 'node:assert/strict';
import { computeStreak, computeProgress, upsertLogList } from '../lib/progress.js';

const plan = [
  { id: 1, date: '2026-04-28', type: 'cycle' },
  { id: 2, date: '2026-04-29', type: 'strength' },
  { id: 3, date: '2026-04-30', type: 'rest' },
  { id: 4, date: '2026-05-01', type: 'cycle' },
  { id: 5, date: '2026-05-02', type: 'cycle' }, // "today"
];

test('streak counts consecutive completed training days', () => {
  const completed = { 1: true, 2: true, 4: true, 5: true };
  assert.equal(computeStreak(completed, '2026-05-02', plan), 4);
});

test('streak skips rest days without breaking', () => {
  // rest day (id 3) is not completed but must not break the run
  const completed = { 1: true, 2: true, 4: true, 5: true };
  assert.equal(computeStreak(completed, '2026-05-02', plan), 4);
});

test('an open day today does not reset the prior streak', () => {
  const completed = { 1: true, 2: true, 4: true }; // today (5) not done yet
  assert.equal(computeStreak(completed, '2026-05-02', plan), 3);
});

test('a missed past training day breaks the streak', () => {
  const completed = { 1: true, 5: true }; // id 4 missed
  assert.equal(computeStreak(completed, '2026-05-02', plan), 1);
});

test('progress counts every completed day over the total', () => {
  const { done, total, pct } = computeProgress({ 1: true, 3: true }, plan);
  assert.equal(done, 2);
  assert.equal(total, 5);
  assert.equal(pct, 40);
});

test('upsertLogList prepends new logs newest-first', () => {
  const list = [{ id: 2, date: '2026-05-01' }];
  const next = upsertLogList(list, { id: 3, date: '2026-05-03' });
  assert.deepEqual(next.map(l => l.id), [3, 2]);
});

test('upsertLogList de-dupes by id (realtime vs optimistic insert)', () => {
  const list = [{ id: 3, date: '2026-05-03' }];
  const next = upsertLogList(list, { id: 3, date: '2026-05-03' });
  assert.equal(next.length, 1);
});

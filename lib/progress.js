import { PLAN_DATA } from './plan-data.js';

/**
 * Consecutive completed training days up to and including today.
 * Rest days are skipped (they don't count and don't break the run), and a
 * still-open *today* does not reset a streak earned on previous days.
 */
export function computeStreak(completed = {}, todayString, planData = PLAN_DATA) {
  const past = planData
    .filter(day => day.date <= todayString)
    .sort((a, b) => b.date.localeCompare(a.date));
  let count = 0;
  for (const day of past) {
    if (day.type === 'rest') continue;
    if (completed[day.id]) count++;
    else if (day.date === todayString) continue; // today not done yet shouldn't break it
    else break;
  }
  return count;
}

/** Overall plan completion. Every day type can be marked complete. */
export function computeProgress(completed = {}, planData = PLAN_DATA) {
  const total = planData.length;
  const done = planData.reduce((sum, day) => sum + (completed[day.id] ? 1 : 0), 0);
  return { done, total, pct: total ? (done / total) * 100 : 0 };
}

/** Insert a log into a list, newest-first by date, de-duped by id. */
export function upsertLogList(list = [], log) {
  if (!log) return list;
  if (list.some(item => item.id === log.id)) return list;
  return [log, ...list].sort((a, b) => String(b.date).localeCompare(String(a.date)));
}

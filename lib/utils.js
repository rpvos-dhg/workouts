import { makeT } from './i18n.js';

export function getTodayString() {
  const now = new Date();
  const local = new Date(now.getTime() - now.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 10);
}

export function addDaysString(dateString, days) {
  const date = new Date(`${dateString}T12:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return date.toISOString().slice(0, 10);
}

// Parse a YYYY-MM-DD string at local noon so the rendered calendar day is
// timezone- and DST-safe (avoids the UTC-midnight off-by-one).
export function parseLocalDate(date) {
  return new Date(`${date}T12:00:00`);
}

export function formatDate(date, locale = 'nl-NL', options = { day: 'numeric', month: 'short' }) {
  return parseLocalDate(date).toLocaleDateString(locale, options);
}

export function formatDateShort(date, locale = 'nl-NL') {
  return formatDate(date, locale, { day: 'numeric', month: 'short' });
}

// Neutralise spreadsheet formula injection: a cell starting with = + - @ (or a
// tab/CR) is treated as a formula by Excel/Sheets. Prefix with an apostrophe.
export function escapeCsvValue(value) {
  const str = value == null ? '' : String(value);
  const needsGuard = /^[=+\-@\t\r]/.test(str);
  const guarded = needsGuard ? `'${str}` : str;
  return /[";\n]/.test(guarded) ? `"${guarded.replace(/"/g, '""')}"` : guarded;
}

export function safeStorageSet(key, value) {
  try {
    if (typeof window !== 'undefined') window.localStorage.setItem(key, value);
  } catch { /* quota / private mode — non-fatal */ }
}

export function safeStorageGet(key) {
  try {
    return typeof window !== 'undefined' ? window.localStorage.getItem(key) : null;
  } catch {
    return null;
  }
}

export function normalizeEmail(email = '') {
  const [local, domain] = email.toLowerCase().split('@');
  if (!domain) return email.toLowerCase();
  return `${domain === 'gmail.com' ? local.replace(/\./g, '') : local}@${domain}`;
}

export function getAlarmSignals(form, t = makeT('nl')) {
  const alarms = [];
  if (Number(form.restingHr) >= 61) alarms.push(t('alarmRestingHr'));
  if (Number(form.sleepHours) > 0 && Number(form.sleepHours) < 7) alarms.push(t('alarmSleep'));
  if (Number(form.moodLevel) > 0 && Number(form.moodLevel) <= 2) alarms.push(t('alarmMood'));
  if (Number(form.sorenessHours) > 72) alarms.push(t('alarmSoreness'));
  if (Number(form.hungerLevel) >= 5) alarms.push(t('alarmHunger'));
  if (form.hrvLowSignal) alarms.push(t('alarmHrv'));
  return alarms;
}

export function checkinToForm(checkin, fallbackDate) {
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

export function exportLogsCSV(logs) {
  const headers = ['Datum', 'Type', 'Duur (min)', 'Afstand (km)', 'Gem. HR (bpm)', 'Max HR (bpm)', 'Kcal', 'Notities'];
  const typeLabel = { cycle: 'Fietsen', strength: 'Krachttraining', walk: 'Wandelen' };
  const rows = logs.map(l => [
    l.date,
    typeLabel[l.type] || l.type,
    l.duration ?? '',
    l.distance ?? '',
    l.avg_hr ?? '',
    l.max_hr ?? '',
    l.kcal ?? '',
    l.notes ?? '',
  ]);
  const csv = [headers, ...rows]
    .map(r => r.map(escapeCsvValue).join(';'))
    .join('\n');
  const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `workouts_${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = `${base64String}${padding}`.replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  return Uint8Array.from([...rawData].map(char => char.charCodeAt(0)));
}

export async function subscribeToPush(authFetch) {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator) || !('PushManager' in window) || !('Notification' in window)) {
    throw new Error('Web Push wordt hier niet ondersteund');
  }
  const keyResponse = await fetch('/api/push/public-key');
  const keyData = await keyResponse.json();
  if (!keyData.publicKey) throw new Error('Web Push mist serverconfiguratie');
  const permission = await Notification.requestPermission();
  if (permission !== 'granted') throw new Error('Melding niet aangezet');
  const registration = await navigator.serviceWorker.register('/sw.js');
  const existing = await registration.pushManager.getSubscription();
  const subscription = existing || await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(keyData.publicKey),
  });
  const response = await authFetch('/api/push/subscribe', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ subscription }),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'Push subscribe failed');
  return subscription;
}

const TYPE_MAP = {
  bike: 'cycle',
  biking: 'cycle',
  bicycle: 'cycle',
  cycling: 'cycle',
  cycle: 'cycle',
  fiets: 'cycle',
  wandelen: 'walk',
  walking: 'walk',
  walk: 'walk',
  run: 'walk',
  running: 'walk',
  strength: 'strength',
  kracht: 'strength',
  functionalstrengthtraining: 'strength',
  traditionalstrengthtraining: 'strength',
};

function cleanKey(key) {
  return String(key || '').toLowerCase().replace(/[^a-z0-9]/g, '');
}

function toNumber(value) {
  if (value === null || value === undefined || value === '') return null;
  const normalized = String(value).trim().replace(',', '.');
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : null;
}

function toInt(value) {
  const parsed = toNumber(value);
  return parsed === null ? null : Math.round(parsed);
}

function dateFromPayload(payload) {
  if (payload.date) return String(payload.date).slice(0, 10);
  const start = payload.startedAt || payload.start || payload.startTime || payload.started_at;
  if (start && /^\d{4}-\d{2}-\d{2}/.test(String(start))) return String(start).slice(0, 10);
  return new Date().toISOString().slice(0, 10);
}

function durationFromPayload(payload) {
  const explicit = toNumber(payload.durationMin ?? payload.duration ?? payload.duration_min ?? payload.minutes);
  if (explicit !== null) return explicit;
  const start = payload.startedAt || payload.start || payload.startTime || payload.started_at;
  const end = payload.endedAt || payload.end || payload.endTime || payload.ended_at;
  if (!start || !end) return null;
  const startMs = new Date(start).getTime();
  const endMs = new Date(end).getTime();
  if (!Number.isFinite(startMs) || !Number.isFinite(endMs) || endMs <= startMs) return null;
  return Math.round((endMs - startMs) / 60000);
}

export function normalizeWorkoutType(type) {
  const key = cleanKey(type);
  return TYPE_MAP[key] || 'cycle';
}

export function stableStringify(value) {
  if (Array.isArray(value)) return `[${value.map(stableStringify).join(',')}]`;
  if (value && typeof value === 'object') {
    return `{${Object.keys(value).sort().map(key => `${JSON.stringify(key)}:${stableStringify(value[key])}`).join(',')}}`;
  }
  return JSON.stringify(value);
}

export function makePayloadHash(value) {
  const input = stableStringify(value);
  let hash = 0x811c9dc5;
  for (let index = 0; index < input.length; index += 1) {
    hash ^= input.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193);
  }
  return (hash >>> 0).toString(16).padStart(8, '0');
}

export function normalizeWorkoutImport(payload = {}) {
  const source = payload.source || 'ios_shortcut';
  const date = dateFromPayload(payload);
  const duration = durationFromPayload(payload);
  const distance = toNumber(payload.distanceKm ?? payload.distance ?? payload.distance_km);
  const normalized = {
    date,
    type: normalizeWorkoutType(payload.type || payload.workoutType || payload.activity),
    duration,
    distance,
    avg_hr: toInt(payload.avgHr ?? payload.averageHeartRate ?? payload.avg_hr),
    max_hr: toInt(payload.maxHr ?? payload.maximumHeartRate ?? payload.max_hr),
    kcal: toInt(payload.kcal ?? payload.calories ?? payload.activeEnergyBurned),
    notes: payload.notes || payload.note || null,
    source,
    external_id: payload.externalId || payload.external_id || null,
  };

  if (!normalized.duration || normalized.duration <= 0) {
    throw new Error('Workout import requires a positive duration.');
  }

  const dedupeKey = normalized.external_id || `${date}-${normalized.type}-${normalized.duration}-${distance ?? ''}-${normalized.kcal ?? ''}-${normalized.avg_hr ?? ''}`;
  normalized.payload_hash = makePayloadHash(payload);
  normalized.dedupe_key = makePayloadHash({ source, dedupeKey });
  return normalized;
}

function parseCsvLine(line) {
  const cells = [];
  let value = '';
  let quoted = false;
  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    const next = line[index + 1];
    if (char === '"' && quoted && next === '"') {
      value += '"';
      index += 1;
    } else if (char === '"') {
      quoted = !quoted;
    } else if (char === ',' && !quoted) {
      cells.push(value.trim());
      value = '';
    } else {
      value += char;
    }
  }
  cells.push(value.trim());
  return cells;
}

export function parseWorkoutCsv(csvText, defaults = {}) {
  const rows = String(csvText || '').split(/\r?\n/).filter(line => line.trim());
  if (rows.length < 2) return [];
  const headers = parseCsvLine(rows[0]).map(cleanKey);
  return rows.slice(1).map(line => {
    const cells = parseCsvLine(line);
    const record = { ...defaults };
    headers.forEach((header, index) => {
      record[header] = cells[index] ?? '';
    });
    return normalizeWorkoutImport({
      source: defaults.source || 'csv',
      externalId: record.externalid || record.id,
      date: record.date || record.workoutdate,
      startedAt: record.startedat || record.starttime || record.start,
      endedAt: record.endedat || record.endtime || record.end,
      type: record.type || record.activity || record.workouttype,
      durationMin: record.durationmin || record.duration || record.minutes,
      distanceKm: record.distancekm || record.distance,
      kcal: record.kcal || record.calories || record.activeenergy,
      avgHr: record.avghr || record.averageheartrate,
      maxHr: record.maxhr || record.maximumheartrate,
      notes: record.notes || record.note,
    });
  });
}

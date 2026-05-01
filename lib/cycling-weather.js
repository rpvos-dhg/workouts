export const OPEN_METEO_HOURLY_FIELDS = [
  'temperature_2m',
  'precipitation_probability',
  'precipitation',
  'weather_code',
  'wind_speed_10m',
  'wind_gusts_10m',
  'is_day',
];

function toNumber(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function average(values) {
  const clean = values.map(toNumber).filter(value => value !== null);
  return clean.length ? clean.reduce((sum, value) => sum + value, 0) / clean.length : null;
}

function maxValue(values) {
  const clean = values.map(toNumber).filter(value => value !== null);
  return clean.length ? Math.max(...clean) : null;
}

function sumValues(values) {
  return values.map(toNumber).filter(value => value !== null).reduce((sum, value) => sum + value, 0);
}

function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function formatTimeFromMinutes(minutes) {
  const normalized = ((Math.round(minutes) % 1440) + 1440) % 1440;
  const hours = Math.floor(normalized / 60);
  const mins = normalized % 60;
  return `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
}

function weatherCodePenalty(code) {
  if (code === null || code === undefined) return 0;
  if (code >= 95) return 45;
  if (code >= 80) return 30;
  if (code >= 71) return 34;
  if (code >= 61) return 28;
  if (code >= 51) return 20;
  if (code >= 45) return 8;
  if (code >= 3) return 3;
  return 0;
}

function getQuality(score) {
  if (score >= 78) return 'good';
  if (score >= 58) return 'ok';
  return 'poor';
}

function getRisks(windowStats) {
  const risks = [];
  if ((windowStats.precipitationProbability ?? 0) >= 40 || (windowStats.precipitation ?? 0) >= 0.5 || weatherCodePenalty(windowStats.weatherCode) >= 20) {
    risks.push('rain');
  }
  if ((windowStats.windSpeed ?? 0) >= 22 || (windowStats.windGusts ?? 0) >= 32) {
    risks.push('wind');
  }
  if ((windowStats.temperature ?? 12) <= 7) {
    risks.push('cold');
  }
  if ((windowStats.temperature ?? 20) >= 26) {
    risks.push('heat');
  }
  if (!windowStats.isDay) {
    risks.push('dark');
  }
  return risks.length ? risks : ['calm'];
}

export function buildOpenMeteoForecastUrl({
  latitude,
  longitude,
  timezone = 'Europe/Amsterdam',
  startDate,
  endDate,
} = {}) {
  const params = new URLSearchParams({
    latitude: String(latitude),
    longitude: String(longitude),
    hourly: OPEN_METEO_HOURLY_FIELDS.join(','),
    timezone,
    wind_speed_unit: 'kmh',
    precipitation_unit: 'mm',
    timeformat: 'iso8601',
  });
  if (startDate) params.set('start_date', startDate);
  if (endDate) params.set('end_date', endDate);
  return `https://api.open-meteo.com/v1/forecast?${params.toString()}`;
}

export function normalizeHourlyForecast(forecast = {}) {
  const hourly = forecast.hourly || {};
  const times = Array.isArray(hourly.time) ? hourly.time : [];
  return times.map((time, index) => ({
    time,
    date: String(time).slice(0, 10),
    hour: Number(String(time).slice(11, 13)),
    temperature: toNumber(hourly.temperature_2m?.[index]),
    precipitationProbability: toNumber(hourly.precipitation_probability?.[index]),
    precipitation: toNumber(hourly.precipitation?.[index]),
    windSpeed: toNumber(hourly.wind_speed_10m?.[index]),
    windGusts: toNumber(hourly.wind_gusts_10m?.[index]),
    weatherCode: toNumber(hourly.weather_code?.[index]),
    isDay: hourly.is_day?.[index] === 1,
  })).filter(hour => hour.date && Number.isFinite(hour.hour));
}

export function scoreCyclingWindow(hours, startMinutes, durationMin = 60) {
  const stats = {
    temperature: average(hours.map(hour => hour.temperature)),
    precipitationProbability: maxValue(hours.map(hour => hour.precipitationProbability)) ?? 0,
    precipitation: sumValues(hours.map(hour => hour.precipitation)),
    windSpeed: average(hours.map(hour => hour.windSpeed)) ?? 0,
    windGusts: maxValue(hours.map(hour => hour.windGusts)) ?? 0,
    weatherCode: maxValue(hours.map(hour => hour.weatherCode)),
    isDay: hours.every(hour => hour.isDay),
  };

  const temperature = stats.temperature ?? 14;
  const centerHour = (startMinutes + durationMin / 2) / 60;
  let score = 100;

  score -= clamp(stats.precipitationProbability * 0.55, 0, 45);
  score -= clamp(stats.precipitation * 15, 0, 32);
  score -= stats.windSpeed > 18 ? (stats.windSpeed - 18) * 2.4 : clamp((stats.windSpeed - 12) * 0.6, 0, 8);
  score -= stats.windGusts > 32 ? (stats.windGusts - 32) * 2 : clamp((stats.windGusts - 24) * 0.8, 0, 10);
  score -= temperature < 8 ? (8 - temperature) * 3 : clamp((12 - temperature) * 1.2, 0, 8);
  score -= temperature > 25 ? (temperature - 25) * 2.5 : 0;
  score -= weatherCodePenalty(stats.weatherCode);
  score -= stats.isDay ? 0 : 38;
  score -= centerHour < 9 ? (9 - centerHour) * 1.3 : 0;
  score -= centerHour > 19 ? (centerHour - 19) * 1.2 : 0;

  const roundedScore = Math.round(clamp(score, 0, 100));
  return {
    ...stats,
    score: roundedScore,
    quality: getQuality(roundedScore),
    risks: getRisks(stats),
  };
}

export function getCyclingWeatherRecommendation(forecast, day = {}) {
  const durationMin = Math.max(30, Number(day.durationMin || day.dur || 60) || 60);
  const windowHours = Math.max(1, Math.ceil(durationMin / 60));
  const dateHours = normalizeHourlyForecast(forecast).filter(hour => hour.date === day.date);
  const candidates = [];

  for (let index = 0; index <= dateHours.length - windowHours; index += 1) {
    const start = dateHours[index];
    const startMinutes = start.hour * 60;
    const endMinutes = startMinutes + durationMin;
    const hours = dateHours.slice(index, index + windowHours);
    if (hours.some(hour => hour.date !== day.date)) continue;

    candidates.push({
      date: day.date,
      startTime: formatTimeFromMinutes(startMinutes),
      endTime: formatTimeFromMinutes(endMinutes),
      durationMin,
      ...scoreCyclingWindow(hours, startMinutes, durationMin),
    });
  }

  const ranked = [...candidates].sort((a, b) => b.score - a.score || a.startTime.localeCompare(b.startTime));
  const topRanks = new Map(ranked.slice(0, 3).map((candidate, index) => [candidate.startTime, index + 1]));
  const scoreRanks = new Map(ranked.map((candidate, index) => [candidate.startTime, index + 1]));
  const best = ranked[0] || null;
  if (!best) return null;
  const summarizeCandidate = candidate => ({
    startTime: candidate.startTime,
    endTime: candidate.endTime,
    score: candidate.score,
    quality: candidate.quality,
    temperature: candidate.temperature,
    precipitationProbability: candidate.precipitationProbability,
    precipitation: candidate.precipitation,
    windSpeed: candidate.windSpeed,
    windGusts: candidate.windGusts,
    weatherCode: candidate.weatherCode,
    isDay: candidate.isDay,
    risks: candidate.risks,
  });

  return {
    ...best,
    alternatives: ranked.slice(1, 3).map(summarizeCandidate),
    hourlyScores: candidates
      .sort((a, b) => a.startTime.localeCompare(b.startTime))
      .map(candidate => ({
        ...summarizeCandidate(candidate),
        rank: topRanks.get(candidate.startTime) || null,
        scoreRank: scoreRanks.get(candidate.startTime) || null,
      })),
  };
}

export function getCyclingWeatherRecommendations(forecast, days = []) {
  return days.reduce((recommendations, day) => {
    const recommendation = getCyclingWeatherRecommendation(forecast, day);
    if (recommendation) recommendations[day.date] = recommendation;
    return recommendations;
  }, {});
}

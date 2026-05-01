import { buildOpenMeteoForecastUrl, getCyclingWeatherRecommendations } from '../../../../lib/cycling-weather.js';

const DEFAULT_LOCATION = {
  latitude: 52.0863030066,
  longitude: 4.316264301,
  label: '2596EC',
};

function readNumber(value, fallback) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function getLocation(body = {}) {
  return {
    latitude: readNumber(body.latitude ?? process.env.WEATHER_LATITUDE, DEFAULT_LOCATION.latitude),
    longitude: readNumber(body.longitude ?? process.env.WEATHER_LONGITUDE, DEFAULT_LOCATION.longitude),
    label: String(body.locationLabel || process.env.WEATHER_LOCATION_LABEL || DEFAULT_LOCATION.label),
  };
}

function sanitizeDays(days) {
  if (!Array.isArray(days)) return [];
  return days
    .map(day => ({
      date: String(day?.date || '').slice(0, 10),
      durationMin: Math.max(30, Math.min(240, Number(day?.durationMin || day?.dur || 60) || 60)),
    }))
    .filter(day => /^\d{4}-\d{2}-\d{2}$/.test(day.date))
    .slice(0, 24);
}

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'Invalid JSON payload' }, { status: 400 });
  }

  const days = sanitizeDays(body.days);
  if (!days.length) return Response.json({ error: 'No cycling days provided' }, { status: 400 });

  const timezone = String(body.timezone || 'Europe/Amsterdam');
  const location = getLocation(body);
  const sortedDates = days.map(day => day.date).sort();
  const url = buildOpenMeteoForecastUrl({
    latitude: location.latitude,
    longitude: location.longitude,
    timezone,
    startDate: sortedDates[0],
    endDate: sortedDates[sortedDates.length - 1],
  });

  const response = await fetch(url, { next: { revalidate: 1800 } });
  if (!response.ok) {
    return Response.json({ error: `Open-Meteo returned ${response.status}` }, { status: 502 });
  }

  const forecast = await response.json();
  return Response.json({
    source: 'open-meteo',
    location,
    fetchedAt: new Date().toISOString(),
    recommendations: getCyclingWeatherRecommendations(forecast, days),
  });
}

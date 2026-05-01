import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildOpenMeteoForecastUrl,
  getCyclingWeatherRecommendation,
  scoreCyclingWindow,
} from '../lib/cycling-weather.js';

function makeForecast() {
  const time = [];
  const temperature = [];
  const precipitationProbability = [];
  const precipitation = [];
  const windSpeed = [];
  const windGusts = [];
  const weatherCode = [];
  const isDay = [];

  for (let hour = 0; hour < 24; hour += 1) {
    time.push(`2026-05-09T${String(hour).padStart(2, '0')}:00`);
    temperature.push(hour < 8 ? 9 : 16);
    precipitationProbability.push(hour >= 15 && hour <= 18 ? 70 : 10);
    precipitation.push(hour >= 15 && hour <= 18 ? 1.2 : 0);
    windSpeed.push(hour >= 11 && hour <= 13 ? 14 : 28);
    windGusts.push(hour >= 11 && hour <= 13 ? 22 : 42);
    weatherCode.push(hour >= 15 && hour <= 18 ? 61 : 1);
    isDay.push(hour >= 6 && hour <= 21 ? 1 : 0);
  }

  return {
    hourly: {
      time,
      temperature_2m: temperature,
      precipitation_probability: precipitationProbability,
      precipitation,
      wind_speed_10m: windSpeed,
      wind_gusts_10m: windGusts,
      weather_code: weatherCode,
      is_day: isDay,
    },
  };
}

test('builds an Open-Meteo forecast URL for hourly cycling variables', () => {
  const url = buildOpenMeteoForecastUrl({
    latitude: 52.0863030066,
    longitude: 4.316264301,
    timezone: 'Europe/Amsterdam',
    startDate: '2026-05-09',
    endDate: '2026-05-09',
  });

  assert.match(url, /api\.open-meteo\.com\/v1\/forecast/);
  assert.match(url, /latitude=52\.0863030066/);
  assert.match(url, /wind_speed_10m/);
  assert.match(url, /precipitation_probability/);
  assert.match(url, /timezone=Europe%2FAmsterdam/);
});

test('prefers the calm dry window for a cycling workout', () => {
  const recommendation = getCyclingWeatherRecommendation(makeForecast(), {
    date: '2026-05-09',
    durationMin: 75,
  });

  assert.equal(recommendation.startTime, '11:00');
  assert.equal(recommendation.endTime, '12:15');
  assert.equal(recommendation.quality, 'good');
  assert.equal(recommendation.risks[0], 'calm');
  assert.equal(recommendation.alternatives.length, 2);
  assert.ok(recommendation.alternatives[0].score > 0);
  assert.ok(recommendation.hourlyScores.length >= 20);
  assert.equal(recommendation.hourlyScores.filter(item => item.rank).length, 3);
  const bestHour = recommendation.hourlyScores.find(item => item.startTime === '11:00');
  assert.equal(bestHour.scoreRank, 1);
  assert.equal(bestHour.temperature, 16);
  assert.equal(bestHour.windSpeed, 14);
  assert.equal(bestHour.precipitationProbability, 10);
  assert.equal(bestHour.weatherCode, 1);
  assert.equal(bestHour.isDay, true);
});

test('penalizes rain and wind in weather scoring', () => {
  const good = scoreCyclingWindow([
    { temperature: 16, precipitationProbability: 5, precipitation: 0, windSpeed: 12, windGusts: 18, weatherCode: 1, isDay: true },
  ], 10 * 60, 60);
  const poor = scoreCyclingWindow([
    { temperature: 7, precipitationProbability: 80, precipitation: 2, windSpeed: 30, windGusts: 45, weatherCode: 61, isDay: true },
  ], 10 * 60, 60);

  assert.ok(good.score > poor.score);
  assert.equal(poor.quality, 'poor');
  assert.ok(poor.risks.includes('rain'));
  assert.ok(poor.risks.includes('wind'));
});

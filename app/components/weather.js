'use client';

import { useEffect, useRef } from 'react';
import {
  Cloud, CloudDrizzle, CloudFog, CloudLightning, CloudMoon,
  CloudRain, CloudSnow, CloudSun, Cloudy, Moon, Sun,
  Thermometer, Wind, CloudRain as CloudRainIcon,
} from 'lucide-react';
import { InfoCard, Tag } from './ui';

export function getWeatherQualityLabel(quality, t) {
  if (quality === 'good') return t('weatherGood');
  if (quality === 'ok') return t('weatherOk');
  return t('weatherPoor');
}

export function getWeatherQualityColor(quality) {
  if (quality === 'good') return 'var(--success)';
  if (quality === 'ok') return '#B86E00';
  return 'var(--danger)';
}

export function getWeatherIconComponent(weatherCode, isDay = true) {
  const code = Number(weatherCode);
  if (!Number.isFinite(code)) return Cloud;
  if (code >= 95) return CloudLightning;
  if ((code >= 71 && code <= 77) || code === 85 || code === 86) return CloudSnow;
  if ((code >= 61 && code <= 67) || (code >= 80 && code <= 82)) return CloudRain;
  if (code >= 51 && code <= 57) return CloudDrizzle;
  if (code === 45 || code === 48) return CloudFog;
  if (code === 3) return Cloudy;
  if (code === 1 || code === 2) return isDay ? CloudSun : CloudMoon;
  if (code === 0) return isDay ? Sun : Moon;
  return Cloud;
}

export function WeatherConditionIcon({ weatherCode, isDay, color = 'currentColor', size = 16 }) {
  const Icon = getWeatherIconComponent(weatherCode, isDay);
  return <Icon size={size} aria-hidden="true" style={{ color, flexShrink: 0 }} />;
}

export function roundedWeatherValue(value) {
  const number = Number(value);
  return Number.isFinite(number) ? Math.round(number) : '-';
}

export function getWeatherRiskLabels(risks = [], t) {
  const labels = {
    calm: t('weatherRiskCalm'), rain: t('weatherRiskRain'), wind: t('weatherRiskWind'),
    cold: t('weatherRiskCold'), heat: t('weatherRiskHeat'), dark: t('weatherRiskDark'),
  };
  return risks.map(risk => labels[risk]).filter(Boolean);
}

export function formatWeatherMetrics(recommendation, t) {
  return t('weatherMetrics', {
    temp: roundedWeatherValue(recommendation.temperature),
    wind: roundedWeatherValue(recommendation.windSpeed),
    gust: roundedWeatherValue(recommendation.windGusts),
    rain: roundedWeatherValue(recommendation.precipitationProbability),
  });
}

export function CyclingWeatherCard({ recommendation, status, location, onRetry, t }) {
  if (status === 'loading' && !recommendation) {
    return (
      <InfoCard>
        <div className="signal-kicker" style={{ color: 'var(--accent-strong)' }}>{t('cyclingWeather')}</div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginTop: '8px', color: 'var(--muted)', fontSize: '14px' }}>
          <CloudSun size={16} aria-hidden="true" />
          {t('weatherLoading')}
        </div>
      </InfoCard>
    );
  }

  if (!recommendation) {
    return (
      <InfoCard>
        <div className="signal-kicker" style={{ color: 'var(--accent-strong)' }}>{t('cyclingWeather')}</div>
        <div style={{ color: status === 'error' ? 'var(--danger)' : 'var(--muted)', marginTop: '8px', fontSize: '14px', fontWeight: 700 }}>
          {status === 'error' ? t('weatherError') : t('weatherUnavailable')}
        </div>
        <div style={{ color: 'var(--muted)', marginTop: '4px', fontSize: '13px' }}>
          {status === 'error' ? 'Weerdata kon niet geladen worden.' : t('weatherNoForecast')}
        </div>
        {status === 'error' && onRetry && (
          <button type="button" onClick={onRetry} style={{
            marginTop: '10px', border: '1px solid var(--line)', background: 'var(--surface-2)',
            color: 'var(--accent-strong)', borderRadius: '8px', padding: '7px 10px',
            fontSize: '13px', fontWeight: 800, cursor: 'pointer',
          }}>
            Opnieuw proberen
          </button>
        )}
      </InfoCard>
    );
  }

  const qualityColor = getWeatherQualityColor(recommendation.quality);
  const rankedHours = [...(recommendation.hourlyScores || [])]
    .sort((a, b) => b.score - a.score || a.startTime.localeCompare(b.startTime))
    .map((window, index) => ({ ...window, label: index < 3 ? t('weatherTopRank', { rank: index + 1 }) : `#${index + 1}` }));

  return (
    <InfoCard style={{ borderLeft: `4px solid ${qualityColor}` }}>
      <div className="signal-kicker" style={{ color: qualityColor }}>{t('weatherBestTime')}</div>
      <div style={{ color: 'var(--muted)', fontSize: '11px', fontWeight: 800, marginTop: '8px', textTransform: 'uppercase' }}>
        {t('weatherRankedHours')}
      </div>
      <div style={{
        display: 'flex', gap: '8px', marginTop: '10px', overflowX: 'auto', maxWidth: '100%', minWidth: 0,
        padding: '2px 2px 10px', scrollSnapType: 'x mandatory', scrollbarWidth: 'thin',
        WebkitOverflowScrolling: 'touch', overscrollBehaviorX: 'contain',
      }}>
        {rankedHours.map((window, index) => {
          const windowColor = getWeatherQualityColor(window.quality);
          const isTopWindow = index < 3;
          return (
            <div key={`${window.startTime}-${index}`} style={{
              flex: '0 0 156px', minWidth: '156px',
              border: `${isTopWindow ? 2 : 1}px solid ${isTopWindow ? windowColor : 'var(--line)'}`,
              background: isTopWindow ? 'var(--surface-2)' : 'white',
              borderRadius: '8px', padding: '9px', display: 'grid', gap: '7px',
              alignContent: 'start', scrollSnapAlign: 'start',
            }}>
              <div style={{ minWidth: 0 }}>
                <div style={{ display: 'flex', gap: '7px', alignItems: 'center', flexWrap: 'wrap' }}>
                  <WeatherConditionIcon weatherCode={window.weatherCode} isDay={window.isDay} color={windowColor} />
                  <span style={{ fontSize: '14px', fontWeight: 800 }}>{window.startTime}-{window.endTime}</span>
                </div>
                <div style={{ fontSize: '11px', color: windowColor, fontWeight: 800, marginTop: '2px' }}>
                  {window.label} · {getWeatherQualityLabel(window.quality, t)}
                </div>
              </div>
              <div style={{ borderRadius: '999px', padding: '5px 7px', background: windowColor, color: 'white', fontSize: '11px', fontWeight: 800, whiteSpace: 'nowrap', justifySelf: 'start' }}>
                {t('weatherScore', { score: window.score })}
              </div>
              <div style={{ display: 'grid', gap: '5px', color: 'var(--muted)', fontSize: '12px', fontWeight: 700 }}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', minWidth: 0 }}>
                  <Thermometer size={13} aria-hidden="true" style={{ color: 'var(--accent-strong)', flexShrink: 0 }} />
                  {t('weatherTemp', { temp: roundedWeatherValue(window.temperature) })}
                </span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', minWidth: 0 }}>
                  <Wind size={13} aria-hidden="true" style={{ color: 'var(--accent-strong)', flexShrink: 0 }} />
                  {t('weatherWind', { wind: roundedWeatherValue(window.windSpeed) })}
                </span>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', minWidth: 0 }}>
                  <CloudRainIcon size={13} aria-hidden="true" style={{ color: 'var(--accent-strong)', flexShrink: 0 }} />
                  {t('weatherRainChance', { rain: roundedWeatherValue(window.precipitationProbability) })}
                </span>
              </div>
            </div>
          );
        })}
      </div>
      <CyclingWeatherBarGraph hourlyScores={recommendation.hourlyScores || []} t={t} />
      <div style={{ fontSize: '13px', color: 'var(--muted)', marginTop: '10px', lineHeight: 1.5 }}>
        {formatWeatherMetrics(recommendation, t)}
      </div>
      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '10px' }}>
        {getWeatherRiskLabels(recommendation.risks, t).map(label => (
          <Tag key={label} icon={Wind} label={label} bg="var(--surface-2)" color="var(--accent-strong)" />
        ))}
      </div>
      {location?.label && (
        <div style={{ color: 'var(--muted-2)', fontSize: '12px', marginTop: '10px' }}>
          {t('weatherLocation', { location: location.label })}
        </div>
      )}
    </InfoCard>
  );
}

export function CyclingWeatherBarGraph({ hourlyScores, t }) {
  const scrollRef = useRef(null);
  const bestIndex = hourlyScores.findIndex(item => item.rank === 1);
  const bestStart = bestIndex >= 0 ? hourlyScores[bestIndex].startTime : '';

  useEffect(() => {
    const container = scrollRef.current;
    if (!container || bestIndex < 0) return;
    const item = container.querySelector(`[data-weather-index="${bestIndex}"]`);
    if (!item) return;
    const left = item.offsetLeft - ((container.clientWidth - item.clientWidth) / 2);
    container.scrollTo({ left: Math.max(0, left), behavior: 'auto' });
  }, [bestIndex, bestStart]);

  if (!hourlyScores.length) return null;

  const getBarColor = (item) => {
    if (item.rank === 1) return 'var(--action)';
    if (item.rank === 2) return 'var(--accent)';
    if (item.rank === 3) return 'var(--success)';
    if (item.quality === 'good') return '#8abda6';
    if (item.quality === 'ok') return '#d8b86c';
    return '#d98989';
  };

  return (
    <div style={{ marginTop: '12px' }}>
      <div style={{ fontSize: '11px', color: 'var(--muted)', fontWeight: 800, textTransform: 'uppercase', marginBottom: '8px' }}>
        {t('weatherDayScores')}
      </div>
      <div ref={scrollRef} role="img" aria-label={t('weatherDayScores')} style={{
        display: 'flex', gap: '6px', overflowX: 'auto', maxWidth: '100%', minWidth: 0,
        padding: '4px 2px 10px', scrollSnapType: 'x mandatory', scrollPadding: '2px',
        scrollbarWidth: 'thin', WebkitOverflowScrolling: 'touch', overscrollBehaviorX: 'contain',
      }}>
        {hourlyScores.map((item, index) => {
          const barHeight = Math.max(12, Math.round(item.score * 0.78));
          const highlighted = !!item.rank;
          const barColor = getBarColor(item);
          return (
            <div key={item.startTime} data-weather-index={index} title={`${item.startTime}-${item.endTime}: ${item.score}/100`} style={{
              flex: '0 0 42px', minWidth: '42px', display: 'grid', gap: '4px', justifyItems: 'center',
              scrollSnapAlign: 'center',
              border: highlighted ? `2px solid ${barColor}` : '1px solid var(--line)',
              background: highlighted ? 'rgba(244, 182, 63, 0.10)' : 'var(--surface-2)',
              borderRadius: '8px', padding: '7px 4px',
            }}>
              <div style={{ height: '74px', width: '100%', display: 'flex', alignItems: 'flex-end', justifyContent: 'center', borderRadius: '6px', background: 'white', border: '1px solid rgba(213, 222, 219, 0.8)', padding: '4px' }}>
                <div style={{ width: '12px', height: `${Math.min(66, barHeight)}px`, borderRadius: '999px 999px 4px 4px', background: barColor, boxShadow: highlighted ? '0 4px 10px rgba(11,24,34,0.18)' : 'none' }} />
              </div>
              <div style={{ fontSize: '11px', color: 'var(--ink)', fontWeight: 900 }}>{item.startTime.slice(0, 2)}u</div>
              {highlighted && <div style={{ fontSize: '10px', color: 'var(--accent-strong)', fontWeight: 900, whiteSpace: 'nowrap' }}>#{item.rank}</div>}
              {!highlighted && <div style={{ fontSize: '11px', color: 'var(--muted-2)', fontWeight: 900 }}>{item.score}</div>}
            </div>
          );
        })}
      </div>
    </div>
  );
}

'use client';

import { BarChart3, Gauge, HeartPulse } from 'lucide-react';
import { calculateTrendStats } from '../../lib/insights';
import { withDefaultSettings } from '../../lib/insights';
import { InfoCard, SectionTitle, MetricTile, SimpleList, TrendCard } from './ui';

export function InsightsView({ logs, checkins, completed, settings, adaptiveAdvice, t }) {
  const stats = calculateTrendStats({ logs, checkins, completed });
  const cards = [
    { title: t('weight'), unit: 'kg', points: stats.weight, color: 'var(--accent)' },
    { title: t('waist'), unit: 'cm', points: stats.waist, color: 'var(--copper)' },
    { title: t('sleep'), unit: 'u', points: stats.sleep, color: '#2C7A2C' },
    { title: t('restingHr'), unit: 'bpm', points: stats.restingHr, color: '#DC3545' },
    { title: t('avgSpeed'), unit: 'km/h', points: stats.speed, color: '#003D7A' },
    { title: t('avgHr'), unit: 'bpm', points: stats.avgHr, color: '#B86E00' },
  ];

  return (
    <div className="dashboard-grid">
      <div>
        <InfoCard className="hero-card">
          <div className="signal-kicker" style={{ color: 'var(--accent-strong)' }}>{t('insights')}</div>
          <div style={{ fontFamily: 'var(--font-display), var(--font-body), sans-serif', fontSize: '24px', fontWeight: 800, marginTop: '6px' }}>{adaptiveAdvice.title}</div>
          <div style={{ fontSize: '13px', color: 'var(--muted)', marginTop: '8px' }}>{adaptiveAdvice.items[0]}</div>
          <div className="metric-grid" style={{ marginTop: '14px' }}>
            <MetricTile icon={BarChart3} label={t('workoutsLogged')} value={stats.summary.workouts} />
            <MetricTile icon={Gauge} label={t('avgSpeed')} value={stats.summary.avgSpeed ? `${stats.summary.avgSpeed.toFixed(1)} km/h` : '-'} />
            <MetricTile icon={HeartPulse} label={t('avgHr')} value={stats.summary.avgHr ? `${Math.round(stats.summary.avgHr)} bpm` : '-'} />
          </div>
        </InfoCard>

        <SectionTitle title={t('trends')} />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '12px' }}>
          {cards.map(card => <TrendCard key={card.title} {...card} t={t} />)}
        </div>
      </div>

      <aside className="side-panel">
        <TrendCard title="Week %" unit="%" points={stats.weekProgress} color="var(--accent)" t={t} />
        <InfoCard>
          <div className="signal-kicker" style={{ color: 'var(--accent-strong)' }}>{t('settings')}</div>
          <SimpleList items={[
            `${t('kcalGoal')}: ${withDefaultSettings(settings).kcal_target}`,
            `${t('proteinGoal')}: ${withDefaultSettings(settings).protein_target}g`,
            `${t('baselineHr')}: ${withDefaultSettings(settings).resting_hr_baseline} bpm`,
          ]} />
        </InfoCard>
      </aside>
    </div>
  );
}

'use client';

import {
  Activity,
  BarChart3,
  Bed,
  Bike,
  Clock3,
  Dumbbell,
  Footprints,
  Trophy,
} from 'lucide-react';
import { inputStyle } from './styles';

const TYPE_ICONS = {
  cycle: Bike,
  strength: Dumbbell,
  walk: Footprints,
  rest: Bed,
  check: BarChart3,
  goal: Trophy,
};

export function TypeIcon({ type, size = 22, color = 'currentColor', strokeWidth = 2.2 }) {
  const Icon = TYPE_ICONS[type] || Activity;
  return <Icon size={size} color={color} strokeWidth={strokeWidth} aria-hidden="true" />;
}

export function IconBadge({ type, color, bg, size = 48, iconSize = 24 }) {
  return (
    <span style={{
      width: size, height: size, minWidth: size,
      borderRadius: 'var(--radius)', background: bg, color,
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
    }}>
      <TypeIcon type={type} size={iconSize} color={color} />
    </span>
  );
}

export function Tag({ label, bg, color, icon: Icon }) {
  return (
    <span style={{ background: bg, color, padding: '6px 12px', borderRadius: '999px', fontSize: '13px', fontWeight: 700, display: 'inline-flex', alignItems: 'center' }}>
      {Icon && <Icon size={14} aria-hidden="true" style={{ marginRight: '6px' }} />}
      {label}
    </span>
  );
}

export function InfoCard({ children, style, className = '' }) {
  return (
    <div className={`info-card ${className}`.trim()} style={{
      padding: '16px', marginBottom: '12px', ...style,
    }}>
      {children}
    </div>
  );
}

export function SectionTitle({ title, subtitle }) {
  return (
    <div style={{ margin: '18px 4px 10px' }}>
      <div style={{ fontSize: '12px', fontWeight: 800, color: 'var(--accent-strong)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>{title}</div>
      {subtitle && <div style={{ fontSize: '13px', color: 'var(--muted)', marginTop: '4px', lineHeight: 1.4 }}>{subtitle}</div>}
    </div>
  );
}

export function Segmented({ options, value, onChange, ariaLabel = 'Tabs' }) {
  return (
    <div role="tablist" aria-label={ariaLabel} style={{
      display: 'flex', overflowX: 'auto', gap: '4px',
      background: 'var(--surface)', borderRadius: 'var(--radius-lg)', padding: '4px',
      margin: '14px 0', border: '1px solid var(--line)', scrollbarWidth: 'thin',
    }}>
      {options.map(option => (
        <button key={option.key} type="button" role="tab" aria-selected={value === option.key} onClick={() => onChange(option.key)} style={{
          flex: '1 0 auto', padding: '10px 14px', border: 'none', borderRadius: 'var(--radius)',
          background: value === option.key ? 'var(--accent)' : 'transparent',
          color: value === option.key ? 'white' : 'var(--muted)',
          fontSize: '13px', fontWeight: 700, cursor: 'pointer', minHeight: '40px',
          whiteSpace: 'nowrap',
        }}>{option.label}</button>
      ))}
    </div>
  );
}

export function MetricTile({ label, value, icon: Icon }) {
  return (
    <div style={{ background: 'var(--surface-2)', borderRadius: 'var(--radius)', padding: '10px 12px', border: '1px solid var(--line)' }}>
      <div style={{ fontSize: '11px', color: 'var(--muted)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
        {Icon && <Icon size={13} aria-hidden="true" />}
        {label}
      </div>
      <div style={{ fontSize: '15px', fontWeight: 800, marginTop: '4px', color: 'var(--accent-strong)' }}>{value}</div>
    </div>
  );
}

export function SimpleList({ items }) {
  return (
    <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '13px', color: 'var(--muted)', lineHeight: 1.65 }}>
      {items.map(item => <li key={item}>{item}</li>)}
    </ul>
  );
}

export function StatItem({ icon: Icon, label }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
      <Icon size={14} aria-hidden="true" />
      {label}
    </span>
  );
}

export function Field({ label, children, htmlFor, help }) {
  return (
    <div style={{ marginBottom: '14px' }}>
      {htmlFor
        ? <label htmlFor={htmlFor} style={{ display: 'block', fontSize: '13px', color: 'var(--muted)', fontWeight: 700, marginBottom: '6px' }}>{label}</label>
        : <div style={{ fontSize: '13px', color: 'var(--muted)', fontWeight: 700, marginBottom: '6px' }}>{label}</div>
      }
      {help && <div style={{ fontSize: '12px', color: 'var(--muted-2)', margin: '-2px 0 6px' }}>{help}</div>}
      {children}
    </div>
  );
}

export function MetricInput({ label, value, onChange, placeholder }) {
  const id = `metric-${label.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
  return (
    <Field label={label} htmlFor={id}>
      <input id={id} type="number" inputMode="decimal" value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} style={inputStyle} />
    </Field>
  );
}

export function BellIcon() {
  return <Clock3 size={16} aria-hidden="true" />;
}

export function MiniChart({ points, color, emptyLabel }) {
  if (!points || points.length < 2) {
    return <div style={{ minHeight: '120px', display: 'grid', placeItems: 'center', color: 'var(--muted)', fontSize: '13px' }}>{emptyLabel}</div>;
  }
  const values = points.map(p => Number(p.value)).filter(Number.isFinite);
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  const width = 320, height = 120, pad = 16;
  const coordPairs = points.map((p, i) => ({
    x: pad + (i / Math.max(points.length - 1, 1)) * (width - pad * 2),
    y: height - pad - ((Number(p.value) - min) / range) * (height - pad * 2),
  }));
  const polylinePoints = coordPairs.map(c => `${c.x},${c.y}`).join(' ');
  return (
    <svg viewBox={`0 0 ${width} ${height}`} role="img" aria-label="Trendgrafiek" style={{ width: '100%', height: '120px', display: 'block' }}>
      <line x1={pad} y1={height - pad} x2={width - pad} y2={height - pad} stroke="var(--line)" strokeWidth="2" />
      <polyline fill="none" stroke={color} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" points={polylinePoints} />
      {points.map((p, i) => (
        <circle key={`${p.date}-${i}`} cx={coordPairs[i].x} cy={coordPairs[i].y} r="4" fill="white" stroke={color} strokeWidth="3" />
      ))}
    </svg>
  );
}

export function TrendCard({ title, unit, points, color, t }) {
  const latest = points.at(-1)?.value;
  const first = points[0]?.value;
  const delta = Number.isFinite(latest) && Number.isFinite(first) && points.length > 1 ? latest - first : null;
  return (
    <InfoCard>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', alignItems: 'flex-start', marginBottom: '10px' }}>
        <div>
          <div style={{ fontSize: '13px', color: 'var(--muted)', fontWeight: 800 }}>{title}</div>
          <div style={{ fontSize: '22px', fontWeight: 800, color }}>{Number.isFinite(latest) ? `${latest.toFixed(unit === '%' ? 0 : 1)} ${unit}` : '—'}</div>
        </div>
        {delta !== null && (
          <Tag label={`${delta >= 0 ? '+' : ''}${delta.toFixed(unit === '%' ? 0 : 1)} ${unit}`} bg="var(--info-tint)" color="var(--accent)" />
        )}
      </div>
      <MiniChart points={points} color={color} emptyLabel={t('noTrendData')} />
    </InfoCard>
  );
}

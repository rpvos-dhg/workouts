'use client';

import { Activity, CheckCircle2, Dumbbell } from 'lucide-react';
import { ModalShell } from './ModalShell';

function RecordAction({ icon: Icon, title, hint, color, bg, onClick, disabled }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      style={{
        display: 'flex', alignItems: 'center', gap: '14px', width: '100%',
        textAlign: 'left', padding: '14px 16px', borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--line)', borderLeft: `4px solid ${color}`,
        background: 'var(--surface)', cursor: disabled ? 'default' : 'pointer',
        minHeight: '64px', opacity: disabled ? 0.55 : 1,
      }}
    >
      <span style={{
        width: '44px', height: '44px', minWidth: '44px', borderRadius: 'var(--radius)',
        background: bg, color, display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <Icon size={22} aria-hidden="true" />
      </span>
      <span style={{ minWidth: 0 }}>
        <span style={{ display: 'block', fontSize: '15px', fontWeight: 700, color: 'var(--ink)' }}>{title}</span>
        <span style={{ display: 'block', fontSize: '13px', color: 'var(--muted)', marginTop: '2px' }}>{hint}</span>
      </span>
    </button>
  );
}

export function RecordSheet({ onClose, onLogWorkout, onLogMeasurement, onMarkToday, todayTitle, todayComplete, t }) {
  return (
    <ModalShell open onClose={onClose} titleId="record-sheet-title" closeLabel={t('cancel')}>
      <div id="record-sheet-title" style={{ fontSize: '20px', fontWeight: 800, color: 'var(--ink)', marginBottom: '4px' }}>
        {t('recordTitle')}
      </div>
      <div className="route-strip" aria-hidden="true" style={{ margin: '10px 0 16px' }}>
        <span className="route-line" />
      </div>
      <div style={{ display: 'grid', gap: '10px' }}>
        <RecordAction
          icon={Dumbbell}
          title={t('recordLogWorkout')}
          hint={t('recordLogWorkoutHint')}
          color="var(--accent)"
          bg="var(--accent-tint)"
          onClick={onLogWorkout}
        />
        <RecordAction
          icon={Activity}
          title={t('recordMeasurement')}
          hint={t('recordMeasurementHint')}
          color="var(--warn)"
          bg="var(--warn-tint)"
          onClick={onLogMeasurement}
        />
        <RecordAction
          icon={CheckCircle2}
          title={todayComplete ? t('recordTodayDone') : t('recordMarkToday')}
          hint={todayTitle}
          color="var(--success)"
          bg="var(--success-tint)"
          onClick={onMarkToday}
          disabled={todayComplete}
        />
      </div>
    </ModalShell>
  );
}

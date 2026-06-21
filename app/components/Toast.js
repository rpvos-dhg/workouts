'use client';

import { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';

const ToastContext = createContext(null);

let idCounter = 0;
const nextId = () => `t-${Date.now()}-${++idCounter}`;

export function ToastProvider({ children, t }) {
  const tr = typeof t === 'function' ? t : (k) => ({ notificationsRegion: 'Notifications', closeNotificationLabel: 'Close notification' }[k] || k);
  const [toasts, setToasts] = useState([]);
  const timers = useRef(new Map());

  const dismiss = useCallback((id) => {
    setToasts(current => current.filter(t => t.id !== id));
    const timer = timers.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timers.current.delete(id);
    }
  }, []);

  const show = useCallback((message, options = {}) => {
    const id = nextId();
    const tone = options.tone || 'info';
    const duration = options.duration ?? 4000;
    const toast = { id, message, tone, action: options.action };
    setToasts(current => [...current, toast]);
    if (duration > 0) {
      const timer = setTimeout(() => dismiss(id), duration);
      timers.current.set(id, timer);
    }
    return id;
  }, [dismiss]);

  useEffect(() => () => {
    timers.current.forEach(clearTimeout);
    timers.current.clear();
  }, []);

  const value = {
    show,
    success: (m, o) => show(m, { ...o, tone: 'success' }),
    error:   (m, o) => show(m, { ...o, tone: 'error' }),
    info:    (m, o) => show(m, { ...o, tone: 'info' }),
    dismiss,
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="toast-stack" role="region" aria-label={tr('notificationsRegion')} aria-live="polite">
        {toasts.map(t => (
          <div key={t.id} className={`toast toast--${t.tone}`} role={t.tone === 'error' ? 'alert' : 'status'}>
            <span style={{ flex: 1 }}>{t.message}</span>
            {t.action && (
              <button type="button" onClick={() => { t.action.onClick?.(); dismiss(t.id); }}>
                {t.action.label}
              </button>
            )}
            <button type="button" onClick={() => dismiss(t.id)} aria-label={tr('closeNotificationLabel')}>×</button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    return {
      show: () => {}, success: () => {}, error: () => {}, info: () => {}, dismiss: () => {},
    };
  }
  return ctx;
}

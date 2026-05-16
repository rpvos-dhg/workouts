'use client';

import { createContext, useCallback, useContext, useRef, useState } from 'react';
import { ModalShell } from './ModalShell';
import { ghostButtonStyle, dangerButtonStyle, primaryButtonStyle } from './styles';

const ConfirmContext = createContext(null);

export function ConfirmProvider({ children }) {
  const [state, setState] = useState(null);
  const resolverRef = useRef(null);

  const confirm = useCallback((options) => {
    return new Promise((resolve) => {
      resolverRef.current = resolve;
      setState({
        title: options.title || 'Weet je het zeker?',
        message: options.message || '',
        confirmLabel: options.confirmLabel || 'Bevestigen',
        cancelLabel: options.cancelLabel || 'Annuleren',
        tone: options.tone || 'danger',
      });
    });
  }, []);

  const handle = (value) => {
    resolverRef.current?.(value);
    resolverRef.current = null;
    setState(null);
  };

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      {state && (
        <ModalShell open onClose={() => handle(false)} titleId="confirm-title" closeLabel="Annuleren">
          <h2 id="confirm-title" style={{ margin: '0 0 8px', fontSize: '20px', fontWeight: 800, color: 'var(--ink)' }}>{state.title}</h2>
          {state.message && (
            <p style={{ margin: '0 0 20px', fontSize: '14px', color: 'var(--muted)', lineHeight: 1.5 }}>{state.message}</p>
          )}
          <div style={{ display: 'flex', gap: '8px' }}>
            <button type="button" onClick={() => handle(false)} style={ghostButtonStyle}>{state.cancelLabel}</button>
            <button type="button" onClick={() => handle(true)} style={state.tone === 'danger' ? { ...dangerButtonStyle, flex: 2 } : { ...primaryButtonStyle, flex: 2 }} autoFocus>{state.confirmLabel}</button>
          </div>
        </ModalShell>
      )}
    </ConfirmContext.Provider>
  );
}

export function useConfirm() {
  const ctx = useContext(ConfirmContext);
  return ctx || (() => Promise.resolve(true));
}

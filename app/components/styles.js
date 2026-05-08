export const inputStyle = {
  width: '100%', padding: '12px', borderRadius: '8px',
  border: '2px solid var(--line)', fontSize: '15px',
  outline: 'none', background: 'white', boxSizing: 'border-box',
};

export const primaryButtonStyle = {
  flex: 1,
  padding: '12px',
  borderRadius: '8px',
  border: 'none',
  background: 'var(--accent)',
  color: 'white',
  fontSize: '14px',
  fontWeight: 800,
  cursor: 'pointer',
};

export const secondaryButtonStyle = {
  ...primaryButtonStyle,
  background: 'var(--surface-3)',
  color: 'var(--accent-strong)',
  border: '1px solid var(--line)',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '6px',
};

export const pillButtonStyle = {
  border: '1px solid rgba(255,255,255,0.3)',
  borderRadius: '999px',
  padding: '6px 14px',
  fontSize: '13px',
  fontWeight: 700,
  cursor: 'pointer',
  background: 'rgba(255,255,255,0.15)',
  color: 'white',
  display: 'inline-flex',
  alignItems: 'center',
  gap: '6px',
};

export const smallActionStyle = {
  border: '1px solid var(--line)',
  background: 'var(--surface-2)',
  color: 'var(--accent-strong)',
  borderRadius: '8px',
  padding: '9px 10px',
  fontSize: '13px',
  fontWeight: 800,
  cursor: 'pointer',
  display: 'inline-flex',
  alignItems: 'center',
  gap: '6px',
};

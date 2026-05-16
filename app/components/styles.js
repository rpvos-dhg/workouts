export const inputStyle = {
  width: '100%', padding: '12px 14px', borderRadius: '10px',
  border: '2px solid var(--line)', fontSize: '15px',
  outline: 'none', background: 'var(--surface)', boxSizing: 'border-box',
  transition: 'border-color 160ms ease',
};

export const primaryButtonStyle = {
  flex: 1,
  padding: '12px 16px',
  borderRadius: '10px',
  border: 'none',
  background: 'var(--accent)',
  color: 'white',
  fontSize: '14px',
  fontWeight: 700,
  cursor: 'pointer',
  letterSpacing: '0.01em',
  transition: 'opacity 150ms ease, transform 120ms ease',
};

export const secondaryButtonStyle = {
  ...primaryButtonStyle,
  background: 'var(--surface)',
  color: 'var(--accent)',
  border: '1.5px solid var(--line)',
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '6px',
};

export const pillButtonStyle = {
  border: '1px solid rgba(255,255,255,0.28)',
  borderRadius: '999px',
  padding: '6px 14px',
  fontSize: '13px',
  fontWeight: 600,
  cursor: 'pointer',
  background: 'rgba(255,255,255,0.14)',
  color: 'white',
  display: 'inline-flex',
  alignItems: 'center',
  gap: '6px',
  letterSpacing: '0.01em',
};

export const smallActionStyle = {
  border: '1.5px solid var(--line)',
  background: 'var(--surface-2)',
  color: 'var(--accent)',
  borderRadius: '10px',
  padding: '9px 12px',
  fontSize: '13px',
  fontWeight: 700,
  cursor: 'pointer',
  display: 'inline-flex',
  alignItems: 'center',
  gap: '6px',
  transition: 'border-color 150ms ease, background 150ms ease',
};

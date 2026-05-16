export const inputStyle = {
  width: '100%',
  padding: '12px 14px',
  borderRadius: 'var(--radius)',
  border: '2px solid var(--line)',
  fontSize: '15px',
  background: 'var(--surface)',
  color: 'var(--ink)',
  boxSizing: 'border-box',
  transition: 'border-color 160ms ease',
  minHeight: '44px',
};

export const primaryButtonStyle = {
  flex: 1,
  padding: '14px 18px',
  borderRadius: 'var(--radius)',
  border: 'none',
  background: 'var(--accent)',
  color: 'white',
  fontSize: '15px',
  fontWeight: 700,
  cursor: 'pointer',
  letterSpacing: '0.01em',
  transition: 'opacity 150ms ease, transform 120ms ease, background 150ms ease',
  minHeight: '44px',
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

export const dangerButtonStyle = {
  ...primaryButtonStyle,
  background: 'var(--danger)',
};

export const ghostButtonStyle = {
  flex: 1,
  padding: '14px 18px',
  borderRadius: 'var(--radius)',
  border: '2px solid var(--line)',
  background: 'var(--surface)',
  color: 'var(--ink)',
  fontSize: '15px',
  fontWeight: 700,
  cursor: 'pointer',
  minHeight: '44px',
};

export const pillButtonStyle = {
  border: '1px solid rgba(255,255,255,0.28)',
  borderRadius: '999px',
  padding: '8px 14px',
  fontSize: '13px',
  fontWeight: 600,
  cursor: 'pointer',
  background: 'rgba(255,255,255,0.14)',
  color: 'white',
  display: 'inline-flex',
  alignItems: 'center',
  gap: '6px',
  letterSpacing: '0.01em',
  minHeight: '36px',
};

export const smallActionStyle = {
  border: '1.5px solid var(--line)',
  background: 'var(--surface-2)',
  color: 'var(--accent)',
  borderRadius: 'var(--radius)',
  padding: '10px 14px',
  fontSize: '13px',
  fontWeight: 700,
  cursor: 'pointer',
  display: 'inline-flex',
  alignItems: 'center',
  gap: '6px',
  transition: 'border-color 150ms ease, background 150ms ease',
  minHeight: '44px',
};

'use client';

import { Component } from 'react';

export class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    if (typeof window !== 'undefined' && window.console) {
      console.error('App error:', error, info);
    }
  }

  reset = () => this.setState({ hasError: false, error: null });

  render() {
    if (!this.state.hasError) return this.props.children;
    const label = this.props.label || 'Er ging iets mis.';
    const detail = this.state.error?.message;
    return (
      <div role="alert" className="error-fallback">
        <div style={{ fontWeight: 800, fontSize: '17px', marginBottom: '6px' }}>{label}</div>
        {detail && <div style={{ fontSize: '13px', color: 'var(--muted)', marginBottom: '8px' }}>{detail}</div>}
        <button type="button" onClick={() => { this.reset(); if (typeof window !== 'undefined') window.location.reload(); }}>
          Pagina herladen
        </button>
      </div>
    );
  }
}

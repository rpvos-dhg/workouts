'use client';

import { X } from 'lucide-react';
import { useModal } from './useModal';

export function ModalShell({ open = true, onClose, titleId, ariaLabel, children, closeLabel = 'Sluiten', as = 'div', ...rest }) {
  const ref = useModal({ open, onClose });
  if (!open) return null;

  const Sheet = as;
  const ariaProps = titleId ? { 'aria-labelledby': titleId } : { 'aria-label': ariaLabel };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <Sheet
        ref={ref}
        tabIndex={-1}
        role="dialog"
        aria-modal="true"
        {...ariaProps}
        onClick={e => e.stopPropagation()}
        className="modal-sheet"
        {...rest}
      >
        <div className="modal-handle" aria-hidden="true" />
        <button
          type="button"
          className="modal-close"
          onClick={onClose}
          aria-label={closeLabel}
        >
          <X size={18} aria-hidden="true" />
        </button>
        {children}
      </Sheet>
    </div>
  );
}

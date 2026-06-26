// ============================================================
// components/ToastContainer.tsx — Notifications toast
// ============================================================

import type { FC } from 'react';
import type { Toast } from '@/types';

interface ToastContainerProps {
  toasts: Toast[];
  onRemove: (id: string) => void;
}

const TOAST_ICONS: Record<Toast['type'], string> = {
  success: '✅',
  error:   '❌',
  info:    'ℹ️',
};

const ToastContainer: FC<ToastContainerProps> = ({ toasts, onRemove }) => {
  if (toasts.length === 0) return null;

  return (
    <div className="toast-container" role="region" aria-live="polite" aria-label="Notifications">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`toast toast--${toast.type}`}
          role="alert"
        >
          <span className="toast__icon" aria-hidden="true">
            {TOAST_ICONS[toast.type]}
          </span>
          <span className="toast__text">{toast.message}</span>
          <button
            onClick={() => onRemove(toast.id)}
            aria-label="Fermer la notification"
            style={{
              marginLeft: 'auto',
              background: 'none',
              color: 'var(--color-text-muted)',
              fontSize: '1rem',
              padding: '2px 6px',
              borderRadius: '4px',
              cursor: 'pointer',
            }}
          >
            ×
          </button>
        </div>
      ))}
    </div>
  );
};

export default ToastContainer;

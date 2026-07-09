// ============================================================
// components/admin/EditGlassModal.tsx
// ============================================================

import { useState, useEffect, useCallback, type FC } from 'react';
import { editGlass } from '@/services/api';
import type { Glass } from '@/types';

interface EditGlassModalProps {
  glass: Glass | null;
  onClose: () => void;
  onSuccess: (updated: Glass) => void;
  onError: (message: string) => void;
}

const EditGlassModal: FC<EditGlassModalProps> = ({
  glass,
  onClose,
  onSuccess,
  onError,
}) => {
  const [state, setState] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  useEffect(() => {
    if (glass) {
      setState(glass.state);
    }
  }, [glass]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && glass) onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [glass, onClose]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!glass) return;

      setIsSubmitting(true);
      try {
        await editGlass(glass.id, state);
        onSuccess({ ...glass, state });
        onClose();
      } catch (err: any) {
        onError(err.message || "Erreur lors de la modification");
      } finally {
        setIsSubmitting(false);
      }
    },
    [glass, state, onSuccess, onClose, onError],
  );

  if (!glass) return null;

  return (
    <div
      className="modal-backdrop"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
    >
      <div className="modal">
        <div className="modal__header">
          <button className="modal__close" onClick={onClose}>×</button>
        </div>
        <div style={{ padding: '0 28px 4px' }}>
          <h2 className="modal__title">Modifier le verre #{glass.id}</h2>
          <p className="modal__subtitle">Changez la disponibilité de ce verre.</p>
        </div>
        <form className="modal__body" onSubmit={handleSubmit}>
          <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <input
              id="glass-state"
              type="checkbox"
              checked={state}
              onChange={(e) => setState(e.target.checked)}
              style={{ width: '20px', height: '20px' }}
            />
            <label className="form-label" htmlFor="glass-state" style={{ margin: 0 }}>
              Disponible (State)
            </label>
          </div>
          <div style={{ display: 'flex', gap: '12px', marginTop: '16px' }}>
            <button
              type="button"
              className="btn btn--secondary btn--full"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Annuler
            </button>
            <button
              type="submit"
              className="btn btn--primary btn--full"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Enregistrement...' : 'Enregistrer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditGlassModal;

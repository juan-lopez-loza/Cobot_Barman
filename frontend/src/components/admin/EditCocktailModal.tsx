// ============================================================
// components/admin/EditCocktailModal.tsx
// ============================================================

import { useState, useEffect, useCallback, type FC } from 'react';
import { updateCocktail } from '@/services/api';
import type { Cocktail } from '@/types';

interface EditCocktailModalProps {
  cocktail: Cocktail | null;
  onClose: () => void;
  onSuccess: (updated: Cocktail) => void;
  onError: (message: string) => void;
}

const EditCocktailModal: FC<EditCocktailModalProps> = ({
  cocktail,
  onClose,
  onSuccess,
  onError,
}) => {
  const [name, setName] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  useEffect(() => {
    if (cocktail) {
      setName(cocktail.name);
    }
  }, [cocktail]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && cocktail) onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [cocktail, onClose]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!cocktail || !name.trim()) return;

      setIsSubmitting(true);
      try {
        await updateCocktail(cocktail.id, { name: name.trim() });
        // Mettre à jour l'état local
        onSuccess({ id: cocktail.id, name: name.trim() });
        onClose();
      } catch (err: any) {
        onError(err.message || "Erreur lors de la modification");
      } finally {
        setIsSubmitting(false);
      }
    },
    [cocktail, name, onSuccess, onClose, onError],
  );

  if (!cocktail) return null;

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
          <h2 className="modal__title">Modifier le cocktail</h2>
          <p className="modal__subtitle">Renommez "{cocktail.name}" ci-dessous.</p>
        </div>
        <form className="modal__body" onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Nom du cocktail</label>
            <input
              type="text"
              className="form-input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoFocus
            />
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
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
              disabled={!name.trim() || isSubmitting}
            >
              {isSubmitting ? 'Enregistrement...' : 'Enregistrer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditCocktailModal;

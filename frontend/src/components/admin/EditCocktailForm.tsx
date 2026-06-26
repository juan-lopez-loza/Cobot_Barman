// ============================================================
// components/admin/EditCocktailForm.tsx
// Formulaire d'édition d'un cocktail — PUT /cocktail/:id
// ============================================================

import { useState, useEffect, useCallback, type FC } from 'react';
import { updateCocktail } from '@/services/api';
import type { Cocktail } from '@/types';

interface EditCocktailFormProps {
  cocktails: Cocktail[];
  onSuccess: (updatedCocktail: Cocktail) => void;
  onError: (message: string) => void;
}

const EditCocktailForm: FC<EditCocktailFormProps> = ({
  cocktails,
  onSuccess,
  onError,
}) => {
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [name, setName] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [validationError, setValidationError] = useState<string>('');

  // Pré-remplir le champ nom quand on sélectionne un cocktail
  useEffect(() => {
    if (selectedId !== null) {
      const found = cocktails.find((c) => c.id === selectedId);
      if (found) setName(found.name);
    } else {
      setName('');
    }
    setValidationError('');
  }, [selectedId, cocktails]);

  const validate = useCallback((): boolean => {
    if (!selectedId) {
      setValidationError('Sélectionnez un cocktail à modifier.');
      return false;
    }
    if (!name.trim()) {
      setValidationError('Le nouveau nom ne peut pas être vide.');
      return false;
    }
    if (name.trim().length < 2) {
      setValidationError('Le nom doit comporter au moins 2 caractères.');
      return false;
    }
    setValidationError('');
    return true;
  }, [selectedId, name]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!validate() || isSubmitting || !selectedId) return;

      setIsSubmitting(true);
      try {
        const updated = await updateCocktail(selectedId, { name: name.trim() });
        onSuccess(updated);
        setSelectedId(null);
        setName('');
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Erreur lors de la mise à jour';
        onError(message);
      } finally {
        setIsSubmitting(false);
      }
    },
    [validate, isSubmitting, selectedId, name, onSuccess, onError],
  );

  return (
    <form onSubmit={handleSubmit} noValidate aria-label="Formulaire de modification de cocktail">
      {/* Liste de sélection */}
      <div className="form-group">
        <label className="form-label" htmlFor="edit-cocktail-select">
          Sélectionner un cocktail
        </label>

        {cocktails.length === 0 ? (
          <p className="form-error" role="status">
            Aucun cocktail disponible pour la modification.
          </p>
        ) : (
          <div
            className="cocktail-list"
            role="listbox"
            aria-label="Liste des cocktails"
            id="edit-cocktail-select"
          >
            {cocktails.map((cocktail) => (
              <div
                key={cocktail.id}
                className={`cocktail-list-item ${selectedId === cocktail.id ? 'cocktail-list-item--selected' : ''}`}
                role="option"
                aria-selected={selectedId === cocktail.id}
                tabIndex={0}
                onClick={() =>
                  setSelectedId(selectedId === cocktail.id ? null : cocktail.id)
                }
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setSelectedId(selectedId === cocktail.id ? null : cocktail.id);
                  }
                }}
              >
                <span className="cocktail-list-item__name">{cocktail.name}</span>
                <span className="cocktail-list-item__id">ID #{cocktail.id}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Champ nouveau nom (visible seulement si un cocktail est sélectionné) */}
      {selectedId !== null && (
        <div className="form-group" style={{ animation: 'slideUp 0.3s ease' }}>
          <label className="form-label" htmlFor="edit-cocktail-name">
            Nouveau nom
          </label>
          <input
            id="edit-cocktail-name"
            type="text"
            className="form-input"
            placeholder="Entrez le nouveau nom…"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setValidationError('');
            }}
            disabled={isSubmitting}
            maxLength={50}
            autoFocus
            aria-describedby={validationError ? 'edit-cocktail-error' : undefined}
            aria-invalid={!!validationError}
          />
          {validationError && (
            <p id="edit-cocktail-error" className="form-error" role="alert">
              <span aria-hidden="true">⚠️</span>
              {validationError}
            </p>
          )}
        </div>
      )}

      <div className="divider" aria-hidden="true" />

      <button
        type="submit"
        id="btn-update-cocktail"
        className="btn btn--primary btn--full"
        disabled={isSubmitting || !selectedId || !name.trim()}
      >
        {isSubmitting ? (
          <>
            <div
              className="spinner"
              style={{ width: '18px', height: '18px', borderWidth: '2px' }}
              aria-hidden="true"
            />
            Mise à jour…
          </>
        ) : (
          '✏️ Enregistrer les modifications'
        )}
      </button>
    </form>
  );
};

export default EditCocktailForm;

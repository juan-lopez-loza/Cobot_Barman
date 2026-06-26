// ============================================================
// components/admin/AddCocktailForm.tsx
// Formulaire d'ajout d'un nouveau cocktail — POST /cocktails/new_cocktail
// ============================================================

import { useState, useCallback, type FC } from 'react';
import { createCocktail } from '@/services/api';
import type { Cocktail } from '@/types';

interface AddCocktailFormProps {
  onSuccess: (updatedList: Cocktail[]) => void;
  onError: (message: string) => void;
}

const AddCocktailForm: FC<AddCocktailFormProps> = ({ onSuccess, onError }) => {
  const [name, setName] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [validationError, setValidationError] = useState<string>('');

  const validate = useCallback((): boolean => {
    if (!name.trim()) {
      setValidationError('Le nom du cocktail est requis.');
      return false;
    }
    if (name.trim().length < 2) {
      setValidationError('Le nom doit comporter au moins 2 caractères.');
      return false;
    }
    setValidationError('');
    return true;
  }, [name]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!validate() || isSubmitting) return;

      setIsSubmitting(true);
      try {
        const updatedList = await createCocktail({ name: name.trim() });
        onSuccess(updatedList);
        setName('');
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Erreur lors de la création';
        onError(message);
      } finally {
        setIsSubmitting(false);
      }
    },
    [name, validate, isSubmitting, onSuccess, onError],
  );

  return (
    <form onSubmit={handleSubmit} noValidate aria-label="Formulaire d'ajout de cocktail">
      <div className="form-group">
        <label className="form-label" htmlFor="new-cocktail-name">
          Nom du cocktail
        </label>
        <input
          id="new-cocktail-name"
          type="text"
          className="form-input"
          placeholder="Ex: Mojito, Pina Colada…"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            setValidationError('');
          }}
          disabled={isSubmitting}
          maxLength={50}
          aria-describedby={validationError ? 'new-cocktail-name-error' : undefined}
          aria-invalid={!!validationError}
        />
        {validationError && (
          <p id="new-cocktail-name-error" className="form-error" role="alert">
            <span aria-hidden="true">⚠️</span>
            {validationError}
          </p>
        )}
      </div>

      <div className="divider" aria-hidden="true" />

      <button
        type="submit"
        id="btn-add-cocktail"
        className="btn btn--primary btn--full"
        disabled={isSubmitting || !name.trim()}
      >
        {isSubmitting ? (
          <>
            <div
              className="spinner"
              style={{ width: '18px', height: '18px', borderWidth: '2px' }}
              aria-hidden="true"
            />
            Création en cours…
          </>
        ) : (
          '+ Ajouter le cocktail'
        )}
      </button>
    </form>
  );
};

export default AddCocktailForm;

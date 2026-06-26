// ============================================================
// components/AdminModal.tsx — Modale d'authentification Admin
// ============================================================

import { useState, useEffect, useCallback, type FC } from 'react';

// Mot de passe admin (côté frontend uniquement — le backend n'a pas d'endpoint auth)
const ADMIN_PASSWORD = 'cobot2024';

interface AdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const AdminModal: FC<AdminModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [isShaking, setIsShaking] = useState<boolean>(false);

  // Reset du formulaire à l'ouverture
  useEffect(() => {
    if (isOpen) {
      setPassword('');
      setError('');
    }
  }, [isOpen]);

  // Fermer avec Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();

      if (password === ADMIN_PASSWORD) {
        setError('');
        onSuccess();
        onClose();
      } else {
        setError('Mot de passe incorrect. Réessayez.');
        setIsShaking(true);
        setTimeout(() => setIsShaking(false), 500);
        setPassword('');
      }
    },
    [password, onSuccess, onClose],
  );

  if (!isOpen) return null;

  return (
    <div
      className="modal-backdrop"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="admin-modal-title"
    >
      <div
        className="modal"
        style={
          isShaking
            ? { animation: 'scaleIn 0.3s ease, shake 0.5s ease' }
            : undefined
        }
      >
        {/* Header */}
        <div className="modal__header">
          <div>
            <div className="modal__icon" aria-hidden="true">🔐</div>
          </div>
          <button
            id="btn-close-admin-modal"
            className="modal__close"
            onClick={onClose}
            aria-label="Fermer la fenêtre"
          >
            ×
          </button>
        </div>

        {/* Titre & sous-titre */}
        <div style={{ padding: '0 28px 4px' }}>
          <h2 id="admin-modal-title" className="modal__title">
            Accès <span className="gradient-text">Administrateur</span>
          </h2>
          <p className="modal__subtitle">
            Entrez le mot de passe pour accéder à l'espace de gestion des cocktails.
          </p>
        </div>

        {/* Formulaire */}
        <form className="modal__body" onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label className="form-label" htmlFor="admin-password">
              Mot de passe
            </label>
            <input
              id="admin-password"
              type="password"
              className="form-input"
              placeholder="••••••••"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value);
                setError('');
              }}
              autoFocus
              autoComplete="current-password"
              aria-describedby={error ? 'admin-password-error' : undefined}
              aria-invalid={!!error}
            />
            {error && (
              <p id="admin-password-error" className="form-error" role="alert">
                <span aria-hidden="true">⚠️</span>
                {error}
              </p>
            )}
          </div>

          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              type="button"
              id="btn-cancel-admin"
              className="btn btn--secondary btn--full"
              onClick={onClose}
            >
              Annuler
            </button>
            <button
              type="submit"
              id="btn-confirm-admin"
              className="btn btn--primary btn--full"
              disabled={!password.trim()}
            >
              Confirmer
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminModal;

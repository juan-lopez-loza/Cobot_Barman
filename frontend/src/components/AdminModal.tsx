// ============================================================
// components/AdminModal.tsx — Modale d'authentification Admin
// ============================================================

import { useState, useEffect, useCallback, type FC } from 'react';
import { loginAdmin } from '@/services/api';

interface AdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const AdminModal: FC<AdminModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isShaking, setIsShaking] = useState<boolean>(false);

  // Reset du formulaire à l'ouverture
  useEffect(() => {
    if (isOpen) {
      setUsername('');
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
    async (e: React.FormEvent) => {
      e.preventDefault();
      
      if (!username.trim() || !password.trim()) {
        setError('Veuillez remplir tous les champs.');
        return;
      }

      setIsLoading(true);
      try {
        await loginAdmin({ username, password });
        setError('');
        onSuccess();
        onClose();
      } catch (err: any) {
        setError('Identifiants incorrects. Réessayez.');
        setIsShaking(true);
        setTimeout(() => setIsShaking(false), 500);
        setPassword('');
      } finally {
        setIsLoading(false);
      }
    },
    [username, password, onSuccess, onClose],
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
        className={`modal ${isShaking ? 'modal--shake' : ''}`}
      >
        {/* Header */}
        <div className="modal__header">
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
            Entrez vos identifiants pour accéder à l'espace de gestion.
          </p>
        </div>

        {/* Formulaire */}
        <form className="modal__body" onSubmit={handleSubmit} noValidate>
          <div className="form-group">
            <label className="form-label" htmlFor="admin-username">
              Pseudo
            </label>
            <input
              id="admin-username"
              type="text"
              className="form-input"
              placeholder="Ex: admin"
              value={username}
              onChange={(e) => {
                setUsername(e.target.value);
                setError('');
              }}
              autoFocus
              autoComplete="username"
            />
          </div>

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
              disabled={isLoading}
            >
              Annuler
            </button>
            <button
              type="submit"
              id="btn-confirm-admin"
              className="btn btn--primary btn--full"
              disabled={!password.trim() || !username.trim() || isLoading}
            >
              {isLoading ? 'Connexion...' : 'Confirmer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AdminModal;

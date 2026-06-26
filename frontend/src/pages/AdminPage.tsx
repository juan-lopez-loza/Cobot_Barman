// ============================================================
// pages/AdminPage.tsx — Espace d'administration
// ============================================================

import { useState, useCallback, type FC } from 'react';
import { useCocktails } from '@/hooks/useCocktails';
import AddCocktailForm from '@/components/admin/AddCocktailForm';
import EditCocktailForm from '@/components/admin/EditCocktailForm';
import type { Cocktail } from '@/types';

interface AdminPageProps {
  onGoHome: () => void;
  onSuccess: (message: string) => void;
  onError: (message: string) => void;
}

const AdminPage: FC<AdminPageProps> = ({ onGoHome, onSuccess, onError }) => {
  const { cocktails, refetch } = useCocktails();
  const [localCocktails, setLocalCocktails] = useState<Cocktail[] | null>(null);

  // Liste active : préférer localCocktails (après opération) sinon la liste fetchée
  const activeCocktails = localCocktails ?? cocktails;

  const handleAddSuccess = useCallback(
    (updatedList: Cocktail[]) => {
      setLocalCocktails(updatedList);
      onSuccess('Cocktail ajouté avec succès ! 🍹');
      refetch();
    },
    [onSuccess, refetch],
  );

  const handleEditSuccess = useCallback(
    (updated: Cocktail) => {
      setLocalCocktails((prev) => {
        const base = prev ?? cocktails;
        return base.map((c) => (c.id === updated.id ? updated : c));
      });
      onSuccess(`"${updated.name}" mis à jour avec succès ! ✏️`);
      refetch();
    },
    [cocktails, onSuccess, refetch],
  );

  return (
    <div className="admin-layout">
      {/* En-tête Admin */}
      <header className="admin-header">
        <div
          className="admin-header__breadcrumb"
          role="button"
          tabIndex={0}
          onClick={onGoHome}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') onGoHome();
          }}
          aria-label="Retourner à la page d'accueil"
        >
          <span>← Retour à l'accueil</span>
        </div>

        <h1 className="admin-header__title">
          Espace <span className="gradient-text">Admin</span>
        </h1>
        <p className="admin-header__subtitle">
          Gérez la carte des cocktails proposés par le robot barman.
          {activeCocktails.length > 0 && (
            <> — <strong>{activeCocktails.length}</strong> cocktail{activeCocktails.length > 1 ? 's' : ''} enregistré{activeCocktails.length > 1 ? 's' : ''}</>
          )}
        </p>
      </header>

      {/* Contenu principal */}
      <div className="admin-content container">
        {/* Card — Ajouter un cocktail */}
        <div className="admin-card">
          <div className="admin-card__header">
            <div className="admin-card__header-icon" aria-hidden="true">➕</div>
            <div>
              <h2 className="admin-card__title">Nouveau cocktail</h2>
              <p className="admin-card__subtitle">Ajouter à la carte du robot</p>
            </div>
          </div>
          <div className="admin-card__body">
            <AddCocktailForm
              onSuccess={handleAddSuccess}
              onError={onError}
            />
          </div>
        </div>

        {/* Card — Modifier un cocktail */}
        <div className="admin-card">
          <div className="admin-card__header">
            <div className="admin-card__header-icon" aria-hidden="true">✏️</div>
            <div>
              <h2 className="admin-card__title">Modifier un cocktail</h2>
              <p className="admin-card__subtitle">Renommer un cocktail existant</p>
            </div>
          </div>
          <div className="admin-card__body">
            <EditCocktailForm
              cocktails={activeCocktails}
              onSuccess={handleEditSuccess}
              onError={onError}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminPage;

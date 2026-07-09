// ============================================================
// pages/AdminPage.tsx — Espace d'administration
// ============================================================

import { useState, useCallback, type FC } from 'react';
import { useCocktails } from '@/hooks/useCocktails';
import BentoGrid from '@/components/BentoGrid';
import GlassesTab from '@/components/admin/GlassesTab';
import EditCocktailModal from '@/components/admin/EditCocktailModal';
import type { Cocktail } from '@/types';

interface AdminPageProps {
  onGoHome: () => void;
  onSuccess: (message: string) => void;
  onError: (message: string) => void;
}

const AdminPage: FC<AdminPageProps> = ({ onGoHome, onSuccess, onError }) => {
  const [activeTab, setActiveTab] = useState<'boissons' | 'verres'>('boissons');
  const { cocktails, isLoading, error, refetch } = useCocktails();
  const [editingCocktail, setEditingCocktail] = useState<Cocktail | null>(null);

  const handleEditSuccess = useCallback(
    (updated: Cocktail) => {
      onSuccess(`"${updated.name}" mis à jour avec succès ! ✏️`);
      refetch();
    },
    [onSuccess, refetch],
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
          Gérez les verres et la carte des cocktails proposés par le robot barman.
        </p>

        {/* Navigation par Onglets */}
        <div style={{ marginTop: '24px', display: 'flex', gap: '12px', justifyContent: 'center' }}>
          <button
            className={`btn ${activeTab === 'boissons' ? 'btn--primary' : 'btn--secondary'}`}
            onClick={() => setActiveTab('boissons')}
          >
            🍹 Boissons
          </button>
          <button
            className={`btn ${activeTab === 'verres' ? 'btn--primary' : 'btn--secondary'}`}
            onClick={() => setActiveTab('verres')}
          >
            🥛 Verres
          </button>
        </div>
      </header>

      {/* Contenu principal */}
      <div className="admin-content container" style={{ marginTop: '32px' }}>
        {activeTab === 'boissons' && (
          <div>
            {isLoading && (
              <div className="spinner" style={{ margin: '32px auto' }} />
            )}
            {!isLoading && error && (
              <div className="state-container">
                <h2 className="state-container__title">Erreur</h2>
                <p className="state-container__text">{error}</p>
                <button className="btn btn--primary" onClick={refetch}>
                  Réessayer
                </button>
              </div>
            )}
            {!isLoading && !error && (
              <BentoGrid
                cocktails={cocktails}
                onOrderSuccess={() => {}}
                onOrderError={onError}
                isAdmin={true}
                onEditCocktail={setEditingCocktail}
              />
            )}
          </div>
        )}

        {activeTab === 'verres' && <GlassesTab />}
      </div>

      {/* Modale Édition Cocktail */}
      {editingCocktail && (
        <EditCocktailModal
          cocktail={editingCocktail}
          onClose={() => setEditingCocktail(null)}
          onSuccess={handleEditSuccess}
          onError={onError}
        />
      )}
    </div>
  );
};

export default AdminPage;

// ============================================================
// components/admin/GlassesTab.tsx
// ============================================================

import { useState, useEffect, type FC } from 'react';
import { fetchGlasses } from '@/services/api';
import type { Glass } from '@/types';
import EditGlassModal from './EditGlassModal';

const GlassesTab: FC = () => {
  const [glasses, setGlasses] = useState<Glass[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  
  const [editingGlass, setEditingGlass] = useState<Glass | null>(null);

  const loadGlasses = async () => {
    setIsLoading(true);
    setError('');
    try {
      const data = await fetchGlasses();
      setGlasses(data);
    } catch (err: any) {
      setError(err.message || 'Erreur lors du chargement des verres.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadGlasses();
  }, []);

  const handleEditSuccess = (updated: Glass) => {
    setGlasses((prev) => prev.map((g) => (g.id === updated.id ? updated : g)));
  };

  if (isLoading) {
    return (
      <div className="container" style={{ padding: '32px', textAlign: 'center' }}>
        <div className="spinner" style={{ margin: '0 auto 16px' }} />
        <p>Chargement des verres...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container state-container">
        <h2 className="state-container__title">Erreur</h2>
        <p className="state-container__text">{error}</p>
        <button className="btn btn--primary" onClick={loadGlasses}>
          Réessayer
        </button>
      </div>
    );
  }

  return (
    <section className="bento-section container">
      <header className="bento-section__header">
        <h2 className="bento-section__title">Gestion des Verres</h2>
        <span className="bento-section__count">{glasses.length} disponibles</span>
      </header>

      <div className="bento-grid" role="list">
        {glasses.map((glass, i) => (
          <article
            key={glass.id}
            className="cocktail-card"
            style={{ animationDelay: `${i * 0.06}s`, cursor: 'default' }}
          >
            <span className="cocktail-card__bg-icon" aria-hidden="true">🥛</span>
            <div className="cocktail-card__content">
              <h2 className="cocktail-card__name">Verre #{glass.id}</h2>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '16px' }}>
                État: {glass.state ? 'Disponible' : 'Indisponible'}
              </p>
              <div className="cocktail-card__footer">
                <button
                  className="btn btn--secondary"
                  style={{ padding: '6px 12px', fontSize: '0.9rem', zIndex: 10, position: 'relative' }}
                  onClick={() => setEditingGlass(glass)}
                >
                  Modifier ✏️
                </button>
              </div>
            </div>
          </article>
        ))}
      </div>

      {editingGlass && (
        <EditGlassModal
          glass={editingGlass}
          onClose={() => setEditingGlass(null)}
          onSuccess={handleEditSuccess}
          onError={(msg) => alert(msg)}
        />
      )}
    </section>
  );
};

export default GlassesTab;

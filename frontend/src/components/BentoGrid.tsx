// ============================================================
// components/BentoGrid.tsx
// ============================================================

import type { FC } from 'react';
import CocktailCard from './CocktailCard';
import type { Cocktail } from '@/types';

interface BentoGridProps {
  cocktails: Cocktail[];
  onOrderSuccess: (name: string) => void;
  onOrderError: (message: string) => void;
  isAdmin?: boolean;
  onEditCocktail?: (cocktail: Cocktail) => void;
}

const BentoGrid: FC<BentoGridProps> = ({
  cocktails,
  onOrderSuccess,
  onOrderError,
  isAdmin,
  onEditCocktail,
}) => {
  return (
    <section className="bento-section container">
      {/* En-tête section */}
      <header className="bento-section__header">
        <h2 className="bento-section__title">Nos Cocktails</h2>
        <span className="bento-section__count">{cocktails.length} disponibles</span>
      </header>

      {/* Grille Bento */}
      <div className="bento-grid" role="list" aria-label="Liste des cocktails disponibles">
        {cocktails.map((cocktail, index) => (
          <CocktailCard
            key={cocktail.id}
            cocktail={cocktail}
            index={index}
            onOrderSuccess={onOrderSuccess}
            onOrderError={onOrderError}
            isAdmin={isAdmin}
            onEditClick={() => onEditCocktail?.(cocktail)}
          />
        ))}
      </div>
    </section>
  );
};

export default BentoGrid;

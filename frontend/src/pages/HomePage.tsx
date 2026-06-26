// ============================================================
// pages/HomePage.tsx — Page principale Bento Grid
// ============================================================

import type { FC } from 'react';
import BentoGrid from '@/components/BentoGrid';
import { useCocktails } from '@/hooks/useCocktails';


interface HomePageProps {
  onOrderSuccess: (name: string) => void;
  onOrderError: (message: string) => void;
}

// ── État de chargement (skeleton Bento) ──────────────────────
const BentoSkeleton: FC = () => (
  <div className="bento-grid container" style={{ padding: '0 32px' }}>
    {Array.from({ length: 8 }).map((_, i) => (
      <div
        key={i}
        className="cocktail-card cocktail-card--loading"
        style={{ animationDelay: `${i * 0.1}s` }}
        aria-hidden="true"
      />
    ))}
  </div>
);

// ── État d'erreur ─────────────────────────────────────────────
const ErrorState: FC<{ message: string; onRetry: () => void }> = ({
  message,
  onRetry,
}) => (
  <div className="state-container">
    <div className="state-container__icon">⚡</div>
    <h2 className="state-container__title">Connexion impossible</h2>
    <p className="state-container__text">{message}</p>
    <button className="btn btn--primary" onClick={onRetry} id="btn-retry-load">
      Réessayer
    </button>
  </div>
);

// ── État vide ─────────────────────────────────────────────────
const EmptyState: FC = () => (
  <div className="state-container">
    <div className="state-container__icon">🍹</div>
    <h2 className="state-container__title">Aucun cocktail disponible</h2>
    <p className="state-container__text">
      L'espace Admin vous permet d'ajouter vos premiers cocktails à la carte.
    </p>
  </div>
);

// ── Page principale ───────────────────────────────────────────
const HomePage: FC<HomePageProps> = ({ onOrderSuccess, onOrderError }) => {
  const { cocktails, isLoading, error, refetch } = useCocktails();

  return (
    <main id="main-content">
    <section className="hero">
      <div className="hero__badge" aria-label="Propulsé par robotique">
        <span className="hero__badge-dot" aria-hidden="true" />
        Robotique industrielle
      </div>

      <h1 className="hero__title">
        Votre cocktail,{' '}
        <span className="gradient-text">préparé par un robot</span>
      </h1>

      <p className="hero__subtitle">
        Sélectionnez un cocktail et laissez notre bras robotisé
        le préparer automatiquement, en quelques secondes.
      </p>

      <div className="hero__divider" aria-hidden="true" />
    </section>

      {/* Grille de cocktails */}
      {isLoading && <BentoSkeleton />}

      {!isLoading && error && (
        <ErrorState message={error} onRetry={refetch} />
      )}

      {!isLoading && !error && cocktails.length === 0 && <EmptyState />}

      {!isLoading && !error && cocktails.length > 0 && (
        <BentoGrid
          cocktails={cocktails}
          onOrderSuccess={onOrderSuccess}
          onOrderError={onOrderError}
        />
      )}
    </main>
  );
};

export default HomePage;

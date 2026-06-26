// ============================================================
// components/CocktailCard.tsx
// ============================================================

import { useState, useCallback, type FC } from 'react';
import { sendOrder } from '@/services/api';
import type { Cocktail, CardStatus } from '@/types';

// Emojis décoratifs selon l'index de la carte
const CARD_ICONS = ['🍹', '🍸', '🥂', '🍾', '🍋', '🍓', '🫧', '🌺', '🥃', '🍊', '🍇', '✨'];

interface CocktailCardProps {
  cocktail: Cocktail;
  index: number;
  onOrderSuccess?: (cocktailName: string) => void;
  onOrderError?: (message: string) => void;
}

const CocktailCard: FC<CocktailCardProps> = ({
  cocktail,
  index,
  onOrderSuccess,
  onOrderError,
}) => {
  const [status, setStatus] = useState<CardStatus>('idle');

  const handleClick = useCallback(async () => {
    if (status !== 'idle') return;

    setStatus('loading');

    try {
      await sendOrder(cocktail.id);
      setStatus('success');
      onOrderSuccess?.(cocktail.name);

      // Retour à l'état initial après 2.5s
      setTimeout(() => setStatus('idle'), 2500);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Erreur lors de la commande';
      setStatus('error');
      onOrderError?.(message);
      setTimeout(() => setStatus('idle'), 3000);
    }
  }, [status, cocktail.id, cocktail.name, onOrderSuccess, onOrderError]);

  const icon = CARD_ICONS[index % CARD_ICONS.length];
  const cardNumber = String(index + 1).padStart(2, '0');
  const stepCount = cocktail.steps?.length ?? 0;

  const cardClasses = [
    'cocktail-card',
    status === 'loading' ? 'cocktail-card--loading' : '',
    status === 'success' ? 'cocktail-card--success' : '',
    status === 'error'   ? 'cocktail-card--error'   : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <article
      className={cardClasses}
      onClick={handleClick}
      role="button"
      tabIndex={0}
      aria-label={`Commander le cocktail ${cocktail.name}`}
      aria-busy={status === 'loading'}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          void handleClick();
        }
      }}
      style={{ animationDelay: `${index * 0.06}s` }}
    >
      {/* Icône décorative en arrière-plan */}
      <span className="cocktail-card__bg-icon" aria-hidden="true">{icon}</span>

      {/* Numéro de carte */}
      <span className="cocktail-card__number">#{cardNumber}</span>

      {/* Overlay feedback (loading / success / error) */}
      {status !== 'idle' && (
        <div
          className={`cocktail-card__overlay cocktail-card__overlay--${status}`}
          aria-hidden="true"
        >
          {status === 'loading' && <div className="spinner" />}
          {status === 'success' && (
            <>
              <span className="cocktail-card__overlay-icon">✅</span>
              <span className="cocktail-card__overlay-text">
                Commande envoyée !<br />Le robot prépare votre cocktail.
              </span>
            </>
          )}
          {status === 'error' && (
            <>
              <span className="cocktail-card__overlay-icon">❌</span>
              <span className="cocktail-card__overlay-text">
                Commande échouée.<br />Réessayez dans un instant.
              </span>
            </>
          )}
        </div>
      )}

      {/* Contenu principal */}
      <div className="cocktail-card__content">
        <h2 className="cocktail-card__name">{cocktail.name}</h2>

        {stepCount > 0 && (
          <p className="cocktail-card__description">
            Recette en {stepCount} étape{stepCount > 1 ? 's' : ''}, préparée avec précision par le robot.
          </p>
        )}

        <div className="cocktail-card__footer">
          <span className="cocktail-card__cta" aria-hidden="true">
            Commander →
          </span>

          {stepCount > 0 && (
            <div className="cocktail-card__steps">
              <span className="cocktail-card__steps-dot" />
              {stepCount} étape{stepCount > 1 ? 's' : ''}
            </div>
          )}
        </div>
      </div>
    </article>
  );
};

export default CocktailCard;

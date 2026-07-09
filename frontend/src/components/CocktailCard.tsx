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
  isAdmin?: boolean;
  onEditClick?: () => void;
}

const CocktailCard: FC<CocktailCardProps> = ({
  cocktail,
  index,
  onOrderSuccess,
  onOrderError,
  isAdmin,
  onEditClick,
}) => {
  const [status, setStatus] = useState<CardStatus>('idle');

  const handleClick = useCallback(async () => {
    if (status !== 'idle' || isAdmin) return;

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
  }, [status, cocktail.id, cocktail.name, onOrderSuccess, onOrderError, isAdmin]);

  const handleEdit = useCallback((e: React.MouseEvent | React.KeyboardEvent) => {
    e.stopPropagation();
    onEditClick?.();
  }, [onEditClick]);

  const icon = CARD_ICONS[index % CARD_ICONS.length];

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
      <div className="cocktail-card__content">
        <h2 className="cocktail-card__name">{cocktail.name[0].toUpperCase()}{cocktail.name.slice(1).toLowerCase()}</h2>

        <div className="cocktail-card__footer">
          {isAdmin ? (
            <button
              className="btn btn--secondary"
              style={{ padding: '6px 12px', fontSize: '0.9rem', zIndex: 10, position: 'relative' }}
              onClick={handleEdit}
              aria-label={`Modifier le cocktail ${cocktail.name}`}
            >
              Modifier ✏️
            </button>
          ) : (
            <span className="cocktail-card__cta" aria-hidden="true">
              Commander →
            </span>
          )}
        </div>
      </div>
    </article>
  );
};

export default CocktailCard;

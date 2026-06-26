// ============================================================
// Types TypeScript — Cobot Barman
// ============================================================

/** Modèle d'un cocktail tel que retourné par le backend */
export interface Cocktail {
  id: number;
  name: string;
}

/** Étape de recette associée à un cocktail */
export interface RecipeStep {
  id: number;
  cocktail_id: number;
  drink_id: number | null;
  step_order: number;
  description: string;
}

/** Payload pour créer un cocktail */
export interface CreateCocktailPayload {
  name: string;
}

/** Payload pour mettre à jour un cocktail */
export interface UpdateCocktailPayload {
  name: string;
}

/** Réponse de l'endpoint POST /orders/ */
export interface OrderResponse {
  Status: string;
}

/** État d'une carte cocktail (feedback visuel) */
export type CardStatus = 'idle' | 'loading' | 'success' | 'error';

/** Données d'un toast de notification */
export interface Toast {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}

/** État de l'authentification admin */
export interface AdminAuth {
  isAuthenticated: boolean;
}

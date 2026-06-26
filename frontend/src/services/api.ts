// ============================================================
// services/api.ts — Couche Axios centralisée
// Cobot Barman Frontend
// ============================================================

import axios from 'axios';
import type {
  Cocktail,
  CreateCocktailPayload,
  UpdateCocktailPayload,
  OrderResponse,
} from '@/types';

// ── Instance Axios ──────────────────────────────────────────
// baseURL vide : les requêtes passent par le proxy Vite (même origine),
// qui les redirige vers le backend → contourne le CORS du navigateur.
const apiClient = axios.create({
  baseURL: '',
  timeout: 15_000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

// ── Intercepteur de réponse (logging/erreurs globales) ──────
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.detail ||
      error.response?.data?.message ||
      error.message ||
      'Une erreur réseau est survenue';
    console.error('[API Error]', message, error.response?.status);
    return Promise.reject(new Error(message));
  },
);

// ============================================================
// COCKTAILS
// ============================================================

/**
 * Récupère tous les cocktails disponibles.
 * GET /cocktails/
 */
export const fetchCocktails = async (): Promise<Cocktail[]> => {
  const { data } = await apiClient.get<Cocktail[]>('/cocktails/');
  return data;
};

/**
 * Ajoute un nouveau cocktail.
 * POST /cocktails/new_cocktail
 * @param payload - { name: string }
 * @returns Liste complète des cocktails mise à jour
 */
export const createCocktail = async (
  payload: CreateCocktailPayload,
): Promise<Cocktail[]> => {
  const { data } = await apiClient.post<Cocktail[]>(
    '/cocktails/new_cocktail',
    payload,
  );
  return data;
};

/**
 * Met à jour le nom d'un cocktail existant.
 * PUT /cocktail/:id
 * @param id - Identifiant du cocktail
 * @param payload - { name: string }
 */
export const updateCocktail = async (
  id: number,
  payload: UpdateCocktailPayload,
): Promise<Cocktail> => {
  const { data } = await apiClient.put<Cocktail>(`/cocktail/${id}`, payload);
  return data;
};

// ============================================================
// ORDERS
// ============================================================

/**
 * Envoie une commande au robot barman.
 * POST /orders/?drink_id=<id>
 * Le drink_id est passé en query parameter (comportement du backend FastAPI).
 * @param drinkId - ID du cocktail à préparer
 */
export const sendOrder = async (drinkId: number): Promise<OrderResponse> => {
  const { data } = await apiClient.post<OrderResponse>('/orders/', null, {
    params: { drink_id: drinkId },
  });
  return data;
};

export default apiClient;

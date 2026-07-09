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
  Glass,
  Token,
} from '@/types';

// Stockage du token en mémoire et localStorage pour la persistance
let authToken: string | null = localStorage.getItem('cobot_admin_token');

export const setAuthToken = (token: string | null) => {
  authToken = token;
  if (token) {
    localStorage.setItem('cobot_admin_token', token);
  } else {
    localStorage.removeItem('cobot_admin_token');
  }
};

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

apiClient.interceptors.request.use((config) => {
  if (authToken) {
    config.headers.Authorization = `Bearer ${authToken}`;
  }
  return config;
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
// ADMIN (AUTH)
// ============================================================

export const loginAdmin = async (payload: { username: string; password: string }): Promise<Token> => {
  const { data } = await apiClient.post<Token>('/admin/login', payload);
  if (data.access_token) {
    setAuthToken(data.access_token);
  }
  return data;
};

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
  // According to backend, it uses PUT /cocktails/edit/cocktail_id with query params
  const { data } = await apiClient.put<Cocktail>('/cocktails/edit/cocktail_id', null, {
    params: {
      cocktail_id: id,
      cocktail_name: payload.name,
    },
  });
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

// ============================================================
// GLASSES
// ============================================================

export const fetchGlasses = async (): Promise<Glass[]> => {
  const { data } = await apiClient.get<Glass[]>('/glasses/');
  return data;
};

export const editGlass = async (id: number, state: boolean): Promise<any> => {
  const { data } = await apiClient.put(`/glasses/edit_glasses/${id}`, null, {
    params: { state },
  });
  return data;
};

export default apiClient;

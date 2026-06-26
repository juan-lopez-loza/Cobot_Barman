// ============================================================
// hooks/useCocktails.ts — Chargement de la liste des cocktails
// ============================================================

import { useState, useEffect, useCallback } from 'react';
import { fetchCocktails } from '@/services/api';
import type { Cocktail } from '@/types';

interface UseCocktailsReturn {
  cocktails: Cocktail[];
  isLoading: boolean;
  error: string | null;
  refetch: () => void;
}

export function useCocktails(): UseCocktailsReturn {
  const [cocktails, setCocktails] = useState<Cocktail[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const loadCocktails = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchCocktails();
      setCocktails(data);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Impossible de charger les cocktails';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadCocktails();
  }, [loadCocktails]);

  return { cocktails, isLoading, error, refetch: loadCocktails };
}

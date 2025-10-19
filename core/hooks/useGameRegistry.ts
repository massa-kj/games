import { useState, useEffect } from 'react';
import type { GameManifest } from '../types.js';

export function useGameRegistry() {
  const [games, setGames] = useState<GameManifest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadGames() {
      try {
        setLoading(true);
        setError(null);

        const baseUrl = '/games/';
        const response = await fetch(`${baseUrl}data/games.json`);
        if (!response.ok) {
          throw new Error(`Failed to load games: ${response.statusText}`);
        }

        const gamesData: GameManifest[] = await response.json();
        setGames(gamesData);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        setError(message);
        console.error('Failed to load game registry:', err);
      } finally {
        setLoading(false);
      }
    }

    loadGames();
  }, []);

  const getGameById = (id: string): GameManifest | undefined => {
    return games.find(game => game.id === id);
  };

  const getGamesByCategory = (category: string): GameManifest[] => {
    return games.filter(game => game.category === category);
  };

  return {
    games,
    loading,
    error,
    getGameById,
    getGamesByCategory,
  };
}

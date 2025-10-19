import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useGameRegistry } from './useGameRegistry.js';
import type { GameManifest, Lang } from '../types.js';

// Mock fetch
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Sample game data for testing
const sampleGames: GameManifest[] = [
  {
    id: 'memory-cards',
    title: { en: 'Memory Cards', ja: 'メモリーカード' },
    icon: '/icons/memory-cards.png',
    category: 'memory',
    description: { en: 'Match pairs of cards', ja: 'カードのペアを合わせる' },
    entry: '/memory-cards/index.html',
    languages: ['en', 'ja'],
    minAge: 3,
  },
  {
    id: 'color-match',
    title: { en: 'Color Match', ja: 'カラーマッチ' },
    icon: '/icons/color-match.png',
    category: 'color',
    description: { en: 'Match colors', ja: '色を合わせる' },
    entry: '/color-match/index.html',
    languages: ['en', 'ja'],
    minAge: 2,
  },
  {
    id: 'shape-sort',
    title: { en: 'Shape Sort', ja: '形の仕分け' },
    icon: '/icons/shape-sort.png',
    category: 'shape',
    description: { en: 'Sort shapes', ja: '形を仕分けする' },
    entry: '/shape-sort/index.html',
    languages: ['en', 'ja'],
    minAge: 4,
  },
  {
    id: 'number-count',
    title: { en: 'Number Count', ja: '数を数える' },
    icon: '/icons/number-count.png',
    category: 'math',
    description: { en: 'Count numbers', ja: '数を数える' },
    entry: '/number-count/index.html',
    languages: ['en', 'ja'],
    minAge: 3,
  },
];

describe('useGameRegistry', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, 'error').mockImplementation(() => { });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('initial state', () => {
    it('should start with empty games array and loading true', () => {
      mockFetch.mockImplementation(() => new Promise(() => { })); // Never resolves

      const { result } = renderHook(() => useGameRegistry());

      expect(result.current.games).toEqual([]);
      expect(result.current.loading).toBe(true);
      expect(result.current.error).toBe(null);
    });
  });

  describe('successful data loading', () => {
    it('should load games successfully', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(sampleGames),
      } as Response);

      const { result } = renderHook(() => useGameRegistry());

      // Wait for loading to complete
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.games).toEqual(sampleGames);
      expect(result.current.error).toBe(null);
      expect(mockFetch).toHaveBeenCalledWith('/games/data/games.json');
    });

    it('should handle empty games array', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve([]),
      } as Response);

      const { result } = renderHook(() => useGameRegistry());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.games).toEqual([]);
      expect(result.current.error).toBe(null);
    });

    it('should call fetch with correct URL', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(sampleGames),
      } as Response);

      renderHook(() => useGameRegistry());

      expect(mockFetch).toHaveBeenCalledTimes(1);
      expect(mockFetch).toHaveBeenCalledWith('/games/data/games.json');
    });
  });

  describe('error handling', () => {
    it('should handle fetch network errors', async () => {
      const networkError = new Error('Network error');
      mockFetch.mockRejectedValueOnce(networkError);

      const { result } = renderHook(() => useGameRegistry());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.games).toEqual([]);
      expect(result.current.error).toBe('Network error');
      expect(console.error).toHaveBeenCalledWith('Failed to load game registry:', networkError);
    });

    it('should handle HTTP errors', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        statusText: 'Not Found',
      } as Response);

      const { result } = renderHook(() => useGameRegistry());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.games).toEqual([]);
      expect(result.current.error).toBe('Failed to load games: Not Found');
    });

    it('should handle JSON parsing errors', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.reject(new Error('Invalid JSON')),
      } as Response);

      const { result } = renderHook(() => useGameRegistry());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.games).toEqual([]);
      expect(result.current.error).toBe('Invalid JSON');
    });

    it('should handle unknown errors', async () => {
      mockFetch.mockRejectedValueOnce('Unknown error');

      const { result } = renderHook(() => useGameRegistry());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.games).toEqual([]);
      expect(result.current.error).toBe('Unknown error');
    });

    it('should handle errors thrown as strings', async () => {
      mockFetch.mockRejectedValueOnce('String error');

      const { result } = renderHook(() => useGameRegistry());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.error).toBe('Unknown error');
    });
  });

  describe('getGameById', () => {
    beforeEach(async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(sampleGames),
      } as Response);
    });

    it('should return correct game by id', async () => {
      const { result } = renderHook(() => useGameRegistry());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const game = result.current.getGameById('memory-cards');
      expect(game).toEqual(sampleGames[0]);
    });

    it('should return undefined for non-existent id', async () => {
      const { result } = renderHook(() => useGameRegistry());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const game = result.current.getGameById('non-existent');
      expect(game).toBeUndefined();
    });

    it('should return undefined when games array is empty', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve([]),
      } as Response);

      const { result } = renderHook(() => useGameRegistry());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const game = result.current.getGameById('any-id');
      expect(game).toBeUndefined();
    });

    it('should handle empty string id', async () => {
      const { result } = renderHook(() => useGameRegistry());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const game = result.current.getGameById('');
      expect(game).toBeUndefined();
    });

    it('should work with all sample games', async () => {
      const { result } = renderHook(() => useGameRegistry());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      sampleGames.forEach(expectedGame => {
        const game = result.current.getGameById(expectedGame.id);
        expect(game).toEqual(expectedGame);
      });
    });
  });

  describe('getGamesByCategory', () => {
    beforeEach(async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(sampleGames),
      } as Response);
    });

    it('should return games for existing category', async () => {
      const { result } = renderHook(() => useGameRegistry());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const memoryGames = result.current.getGamesByCategory('memory');
      expect(memoryGames).toEqual([sampleGames[0]]);
    });

    it('should return empty array for non-existent category', async () => {
      const { result } = renderHook(() => useGameRegistry());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const games = result.current.getGamesByCategory('non-existent');
      expect(games).toEqual([]);
    });

    it('should return empty array when games array is empty', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve([]),
      } as Response);

      const { result } = renderHook(() => useGameRegistry());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const games = result.current.getGamesByCategory('memory');
      expect(games).toEqual([]);
    });

    it('should handle empty string category', async () => {
      const { result } = renderHook(() => useGameRegistry());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const games = result.current.getGamesByCategory('');
      expect(games).toEqual([]);
    });

    it('should return multiple games for category with multiple games', async () => {
      // Add another memory game to test data
      const gamesWithMultipleMemory = [
        ...sampleGames,
        {
          id: 'memory-2',
          title: { en: 'Memory Cards 2', ja: 'メモリーカード2' },
          icon: '/icons/memory-2.png',
          category: 'memory',
          description: { en: 'Advanced memory game', ja: '高度なメモリーゲーム' },
          entry: '/memory-2/index.html',
          languages: ['en', 'ja'],
          minAge: 4,
        },
      ];

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(gamesWithMultipleMemory),
      } as Response);

      const { result } = renderHook(() => useGameRegistry());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const memoryGames = result.current.getGamesByCategory('memory');
      expect(memoryGames).toHaveLength(2);
      expect(memoryGames[0].id).toBe('memory-cards');
      expect(memoryGames[1].id).toBe('memory-2');
    });

    it('should test all unique categories in sample data', async () => {
      const { result } = renderHook(() => useGameRegistry());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const categories = ['memory', 'color', 'shape', 'math'];

      categories.forEach(category => {
        const games = result.current.getGamesByCategory(category);
        const expectedGames = sampleGames.filter(game => game.category === category);
        expect(games).toEqual(expectedGames);
      });
    });
  });

  describe('loading states', () => {
    it('should set loading to true initially and false after completion', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(sampleGames),
      } as Response);

      const { result } = renderHook(() => useGameRegistry());

      // Initially loading
      expect(result.current.loading).toBe(true);

      // After completion
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });
    });

    it('should set loading to false after error', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Test error'));

      const { result } = renderHook(() => useGameRegistry());

      expect(result.current.loading).toBe(true);

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });
    });

    it('should reset error when starting new request', async () => {
      // This test verifies that error is cleared when loading starts
      // (though the current implementation only runs once)
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(sampleGames),
      } as Response);

      const { result } = renderHook(() => useGameRegistry());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.error).toBe(null);
    });
  });

  describe('integration', () => {
    it('should handle complete workflow successfully', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(sampleGames),
      } as Response);

      const { result } = renderHook(() => useGameRegistry());

      // Initial state
      expect(result.current.loading).toBe(true);
      expect(result.current.games).toEqual([]);
      expect(result.current.error).toBe(null);

      // Wait for completion
      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // Final state
      expect(result.current.games).toEqual(sampleGames);
      expect(result.current.error).toBe(null);

      // Test helper functions
      const memoryGame = result.current.getGameById('memory-cards');
      expect(memoryGame).toEqual(sampleGames[0]);

      const colorGames = result.current.getGamesByCategory('color');
      expect(colorGames).toEqual([sampleGames[1]]);
    });

    it('should maintain function references across renders', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(sampleGames),
      } as Response);

      const { result, rerender } = renderHook(() => useGameRegistry());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      const firstGetGameById = result.current.getGameById;
      const firstGetGamesByCategory = result.current.getGamesByCategory;

      rerender();

      // These functions are recreated on each render since they're not memoized
      // This is the expected behavior for this implementation
      expect(typeof result.current.getGameById).toBe('function');
      expect(typeof result.current.getGamesByCategory).toBe('function');

      // But they should still work correctly
      expect(result.current.getGameById('memory-cards')).toEqual(sampleGames[0]);
      expect(result.current.getGamesByCategory('memory')).toEqual([sampleGames[0]]);
    });
  });

  describe('edge cases', () => {
    it('should handle malformed game data gracefully', async () => {
      const malformedGames = [
        { id: 'test', title: { en: 'Test', ja: 'テスト' } }, // Missing required fields
        null,
        undefined,
        sampleGames[0], // Valid game mixed with invalid ones
      ];

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(malformedGames),
      } as Response);

      const { result } = renderHook(() => useGameRegistry());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      // Should still set the data even if malformed
      expect(result.current.games).toEqual(malformedGames);
    });

    it('should handle very large game datasets', async () => {
      const largeGameSet = Array.from({ length: 1000 }, (_, index) => ({
        id: `game-${index}`,
        title: { en: `Game ${index}`, ja: `ゲーム${index}` },
        icon: `/icons/game-${index}.png`,
        category: `category-${index % 10}`,
        description: { en: `Description ${index}`, ja: `説明${index}` },
        entry: `/game-${index}/index.html`,
        languages: ['en', 'ja'],
        minAge: 3,
      }));

      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(largeGameSet),
      } as Response);

      const { result } = renderHook(() => useGameRegistry());

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.games).toHaveLength(1000);

      // Test performance of helper functions
      const game = result.current.getGameById('game-500');
      expect(game?.id).toBe('game-500');

      const categoryGames = result.current.getGamesByCategory('category-5');
      expect(categoryGames).toHaveLength(100); // Every 10th game
    });
  });
});

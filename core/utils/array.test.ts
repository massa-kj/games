import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { shuffle } from './array.js';

describe('array utilities', () => {
  describe('shuffle', () => {
    it('should return an array with the same length', () => {
      const input = [1, 2, 3, 4, 5];
      const result = shuffle(input);
      expect(result).toHaveLength(input.length);
    });

    it('should not modify the original array', () => {
      const input = [1, 2, 3, 4, 5];
      const original = [...input];
      shuffle(input);
      expect(input).toEqual(original);
    });

    it('should contain all original elements', () => {
      const input = [1, 2, 3, 4, 5];
      const result = shuffle(input);
      expect(result.sort()).toEqual(input.sort());
    });

    it('should handle empty arrays', () => {
      const result = shuffle([]);
      expect(result).toEqual([]);
    });

    it('should handle single element arrays', () => {
      const input = [42];
      const result = shuffle(input);
      expect(result).toEqual([42]);
    });

    it('should produce different results with different random seeds', () => {
      const input = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

      // Mock Math.random to produce predictable results
      const mockRandom = vi.spyOn(Math, 'random');

      // First shuffle with fixed seed
      mockRandom.mockReturnValueOnce(0.1)
        .mockReturnValueOnce(0.2)
        .mockReturnValueOnce(0.3)
        .mockReturnValueOnce(0.4)
        .mockReturnValueOnce(0.5)
        .mockReturnValueOnce(0.6)
        .mockReturnValueOnce(0.7)
        .mockReturnValueOnce(0.8)
        .mockReturnValueOnce(0.9);

      const result1 = shuffle(input);

      // Second shuffle with different seed
      mockRandom.mockReturnValueOnce(0.9)
        .mockReturnValueOnce(0.8)
        .mockReturnValueOnce(0.7)
        .mockReturnValueOnce(0.6)
        .mockReturnValueOnce(0.5)
        .mockReturnValueOnce(0.4)
        .mockReturnValueOnce(0.3)
        .mockReturnValueOnce(0.2)
        .mockReturnValueOnce(0.1);

      const result2 = shuffle(input);

      expect(result1).not.toEqual(result2);

      mockRandom.mockRestore();
    });
  });
});

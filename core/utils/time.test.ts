import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { delay } from './time.js';

describe('time utilities', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  describe('delay', () => {
    it('should resolve after the specified time', async () => {
      const promise = delay(1000);

      // Fast-forward time
      vi.advanceTimersByTime(1000);

      await expect(promise).resolves.toBeUndefined();
    });

    it('should not resolve before the specified time', async () => {
      const promise = delay(1000);
      let resolved = false;

      promise.then(() => {
        resolved = true;
      });

      // Advance time but not enough
      vi.advanceTimersByTime(500);
      await Promise.resolve(); // Allow microtasks to run

      expect(resolved).toBe(false);

      // Now advance the remaining time
      vi.advanceTimersByTime(500);
      await promise;

      expect(resolved).toBe(true);
    });

    it('should handle zero delay', async () => {
      const promise = delay(0);

      vi.advanceTimersByTime(0);

      await expect(promise).resolves.toBeUndefined();
    });
  });
});

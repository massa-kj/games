import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useSound } from './useSound.js';
import type { SoundOptions } from '../types.js';

// Mock soundManager
vi.mock('../audio/soundManager.js', () => ({
  soundManager: {
    play: vi.fn(),
    stopAll: vi.fn(),
    setGlobalVolume: vi.fn(),
    isEnabled: vi.fn(),
    setEnabled: vi.fn(),
  },
}));

describe('useSound', () => {
  let mockSoundManager: any;

  beforeEach(async () => {
    vi.clearAllMocks();
    const { soundManager } = await import('../audio/soundManager.js');
    mockSoundManager = vi.mocked(soundManager);
    mockSoundManager.isEnabled.mockReturnValue(true);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('playSound', () => {
    it('should call soundManager.play with correct parameters', async () => {
      const { result } = renderHook(() => useSound());

      await act(async () => {
        await result.current.playSound('/test.mp3');
      });

      expect(mockSoundManager.play).toHaveBeenCalledWith('/test.mp3', undefined);
    });

    it('should call soundManager.play with options', async () => {
      const { result } = renderHook(() => useSound());
      const options: SoundOptions = { volume: 0.5, loop: true };

      await act(async () => {
        await result.current.playSound('/test.mp3', options);
      });

      expect(mockSoundManager.play).toHaveBeenCalledWith('/test.mp3', options);
    });

    it('should handle soundManager.play errors gracefully', async () => {
      mockSoundManager.play.mockRejectedValueOnce(new Error('Play failed'));
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => { });

      const { result } = renderHook(() => useSound());

      await act(async () => {
        await result.current.playSound('/test.mp3');
      });

      expect(consoleSpy).toHaveBeenCalledWith('Failed to play sound:', expect.any(Error));
    });

    it('should maintain callback reference stability', () => {
      const { result, rerender } = renderHook(() => useSound());
      const firstPlaySound = result.current.playSound;

      rerender();

      expect(result.current.playSound).toBe(firstPlaySound);
    });

    it('should work with different file types', async () => {
      const { result } = renderHook(() => useSound());

      const testFiles = ['/test.mp3', '/test.wav', '/test.ogg'];

      for (const file of testFiles) {
        await act(async () => {
          await result.current.playSound(file);
        });
      }

      expect(mockSoundManager.play).toHaveBeenCalledTimes(3);
      expect(mockSoundManager.play).toHaveBeenNthCalledWith(1, '/test.mp3', undefined);
      expect(mockSoundManager.play).toHaveBeenNthCalledWith(2, '/test.wav', undefined);
      expect(mockSoundManager.play).toHaveBeenNthCalledWith(3, '/test.ogg', undefined);
    });

    it('should handle concurrent play calls', async () => {
      const { result } = renderHook(() => useSound());

      const promises = [
        result.current.playSound('/test1.mp3'),
        result.current.playSound('/test2.mp3'),
        result.current.playSound('/test3.mp3'),
      ];

      await act(async () => {
        await Promise.all(promises);
      });

      expect(mockSoundManager.play).toHaveBeenCalledTimes(3);
    });
  });

  describe('stopAllSounds', () => {
    it('should call soundManager.stopAll', () => {
      const { result } = renderHook(() => useSound());

      act(() => {
        result.current.stopAllSounds();
      });

      expect(mockSoundManager.stopAll).toHaveBeenCalledTimes(1);
    });

    it('should maintain callback reference stability', () => {
      const { result, rerender } = renderHook(() => useSound());
      const firstStopAllSounds = result.current.stopAllSounds;

      rerender();

      expect(result.current.stopAllSounds).toBe(firstStopAllSounds);
    });

    it('should work multiple times', () => {
      const { result } = renderHook(() => useSound());

      act(() => {
        result.current.stopAllSounds();
        result.current.stopAllSounds();
        result.current.stopAllSounds();
      });

      expect(mockSoundManager.stopAll).toHaveBeenCalledTimes(3);
    });
  });

  describe('setVolume', () => {
    it('should call soundManager.setGlobalVolume with correct value', () => {
      const { result } = renderHook(() => useSound());

      act(() => {
        result.current.setVolume(0.5);
      });

      expect(mockSoundManager.setGlobalVolume).toHaveBeenCalledWith(0.5);
    });

    it('should handle extreme volume values', () => {
      const { result } = renderHook(() => useSound());

      act(() => {
        result.current.setVolume(0);
      });
      expect(mockSoundManager.setGlobalVolume).toHaveBeenCalledWith(0);

      act(() => {
        result.current.setVolume(1);
      });
      expect(mockSoundManager.setGlobalVolume).toHaveBeenCalledWith(1);

      act(() => {
        result.current.setVolume(2);
      });
      expect(mockSoundManager.setGlobalVolume).toHaveBeenCalledWith(2);
    });

    it('should maintain callback reference stability', () => {
      const { result, rerender } = renderHook(() => useSound());
      const firstSetVolume = result.current.setVolume;

      rerender();

      expect(result.current.setVolume).toBe(firstSetVolume);
    });

    it('should handle decimal values', () => {
      const { result } = renderHook(() => useSound());

      const testValues = [0.1, 0.25, 0.33, 0.5, 0.75, 0.9];

      testValues.forEach(volume => {
        act(() => {
          result.current.setVolume(volume);
        });
      });

      expect(mockSoundManager.setGlobalVolume).toHaveBeenCalledTimes(testValues.length);
      testValues.forEach((volume, index) => {
        expect(mockSoundManager.setGlobalVolume).toHaveBeenNthCalledWith(index + 1, volume);
      });
    });
  });

  describe('toggleSound', () => {
    it('should toggle from enabled to disabled', () => {
      mockSoundManager.isEnabled.mockReturnValue(true);
      const { result } = renderHook(() => useSound());

      let toggleResult: boolean;
      act(() => {
        toggleResult = result.current.toggleSound();
      });

      expect(mockSoundManager.setEnabled).toHaveBeenCalledWith(false);
      expect(toggleResult!).toBe(false);
    });

    it('should toggle from disabled to enabled', () => {
      mockSoundManager.isEnabled.mockReturnValue(false);
      const { result } = renderHook(() => useSound());

      let toggleResult: boolean;
      act(() => {
        toggleResult = result.current.toggleSound();
      });

      expect(mockSoundManager.setEnabled).toHaveBeenCalledWith(true);
      expect(toggleResult!).toBe(true);
    });

    it('should return the new state correctly', () => {
      const { result } = renderHook(() => useSound());

      // Test multiple toggles
      mockSoundManager.isEnabled.mockReturnValue(true);
      let result1: boolean;
      act(() => {
        result1 = result.current.toggleSound();
      });
      expect(result1!).toBe(false);

      mockSoundManager.isEnabled.mockReturnValue(false);
      let result2: boolean;
      act(() => {
        result2 = result.current.toggleSound();
      });
      expect(result2!).toBe(true);
    });

    it('should maintain callback reference stability', () => {
      const { result, rerender } = renderHook(() => useSound());
      const firstToggleSound = result.current.toggleSound;

      rerender();

      expect(result.current.toggleSound).toBe(firstToggleSound);
    });
  });

  describe('isEnabled', () => {
    it('should return true when sound is enabled', () => {
      mockSoundManager.isEnabled.mockReturnValue(true);
      const { result } = renderHook(() => useSound());

      expect(result.current.isEnabled).toBe(true);
    });

    it('should return false when sound is disabled', () => {
      mockSoundManager.isEnabled.mockReturnValue(false);
      const { result } = renderHook(() => useSound());

      expect(result.current.isEnabled).toBe(false);
    });

    it('should reflect current state on each render', () => {
      mockSoundManager.isEnabled.mockReturnValue(true);
      const { result, rerender } = renderHook(() => useSound());

      expect(result.current.isEnabled).toBe(true);

      // Change the mock return value
      mockSoundManager.isEnabled.mockReturnValue(false);
      rerender();

      expect(result.current.isEnabled).toBe(false);
    });
  });

  describe('integration', () => {
    it('should handle complete sound workflow', async () => {
      mockSoundManager.isEnabled.mockReturnValue(true);
      const { result } = renderHook(() => useSound());

      // Play a sound
      await act(async () => {
        await result.current.playSound('/test.mp3', { volume: 0.8 });
      });

      // Set volume
      act(() => {
        result.current.setVolume(0.5);
      });

      // Toggle sound off
      act(() => {
        result.current.toggleSound();
      });

      // Stop all sounds
      act(() => {
        result.current.stopAllSounds();
      });

      expect(mockSoundManager.play).toHaveBeenCalledWith('/test.mp3', { volume: 0.8 });
      expect(mockSoundManager.setGlobalVolume).toHaveBeenCalledWith(0.5);
      expect(mockSoundManager.setEnabled).toHaveBeenCalledWith(false);
      expect(mockSoundManager.stopAll).toHaveBeenCalledTimes(1);
    });

    it('should work with multiple concurrent operations', async () => {
      const { result } = renderHook(() => useSound());

      await act(async () => {
        // Concurrent plays
        const playPromises = [
          result.current.playSound('/sound1.mp3'),
          result.current.playSound('/sound2.mp3'),
        ];

        // Sync operations
        result.current.setVolume(0.7);
        result.current.stopAllSounds();

        await Promise.all(playPromises);
      });

      expect(mockSoundManager.play).toHaveBeenCalledTimes(2);
      expect(mockSoundManager.setGlobalVolume).toHaveBeenCalledWith(0.7);
      expect(mockSoundManager.stopAll).toHaveBeenCalledTimes(1);
    });
  });

  describe('edge cases', () => {
    it('should handle empty string sound source', async () => {
      const { result } = renderHook(() => useSound());

      await act(async () => {
        await result.current.playSound('');
      });

      expect(mockSoundManager.play).toHaveBeenCalledWith('', undefined);
    });

    it('should handle null/undefined options gracefully', async () => {
      const { result } = renderHook(() => useSound());

      await act(async () => {
        await result.current.playSound('/test.mp3', undefined);
      });

      expect(mockSoundManager.play).toHaveBeenCalledWith('/test.mp3', undefined);
    });

    it('should handle complex options objects', async () => {
      const { result } = renderHook(() => useSound());
      const complexOptions: SoundOptions = {
        volume: 0.75,
        loop: true,
      };

      await act(async () => {
        await result.current.playSound('/test.mp3', complexOptions);
      });

      expect(mockSoundManager.play).toHaveBeenCalledWith('/test.mp3', complexOptions);
    });

    it('should handle negative volume values', () => {
      const { result } = renderHook(() => useSound());

      act(() => {
        result.current.setVolume(-0.5);
      });

      expect(mockSoundManager.setGlobalVolume).toHaveBeenCalledWith(-0.5);
    });
  });
});

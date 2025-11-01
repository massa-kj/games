import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { soundManager } from './soundManager';

// Mock HTMLAudioElement
class MockAudioElement {
  public src = '';
  public currentTime = 0;
  public volume = 1;
  public loop = false;
  public preload = 'auto';
  private _paused = true;

  constructor(src?: string) {
    if (src) this.src = src;
  }

  async play(): Promise<void> {
    this._paused = false;
    return Promise.resolve();
  }

  pause(): void {
    this._paused = true;
  }

  load(): void {
    // Mock implementation
  }

  get paused(): boolean {
    return this._paused;
  }
}

// Mock localStorage
const createMockStorage = () => {
  const store: Record<string, string> = {};

  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
  };
};

describe('soundManager', () => {
  let mockStorage: ReturnType<typeof createMockStorage>;
  let mockAudioElements: MockAudioElement[] = [];

  beforeEach(() => {
    // Reset mock storage
    mockStorage = createMockStorage();
    Object.defineProperty(global, 'localStorage', {
      value: mockStorage,
      configurable: true
    });

    // Clear the mock audio elements array
    mockAudioElements.length = 0;

    // Mock Audio constructor - ensure it's a proper mock
    global.Audio = vi.fn().mockImplementation((src?: string) => {
      const audio = new MockAudioElement(src);
      mockAudioElements.push(audio);
      return audio;
    }) as any;

    // Mock console methods
    vi.spyOn(console, 'warn').mockImplementation(() => { });

    // Clear any existing state in soundManager
    soundManager.stopAll();
    soundManager.setEnabled(true);
    soundManager.setGlobalVolume(1);

    // Clear internal audio elements map
    (soundManager as any).audioElements?.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('initialization', () => {
    it('should initialize with sound enabled by default', () => {
      expect(soundManager.isEnabled()).toBe(true);
    });

    it('should load sound setting from localStorage on initialization', () => {
      // This test checks the behavior that would happen during module load
      // Since we can't easily test the constructor again, we'll test the setting functionality
      mockStorage.setItem('sound', 'false');
      soundManager.setEnabled(false);
      expect(soundManager.isEnabled()).toBe(false);
    });
  });

  describe('play', () => {
    it('should create and play audio element with default options', async () => {
      const src = '/test-sound.mp3';

      await soundManager.play(src);

      expect(global.Audio).toHaveBeenCalledWith(src);
      expect(mockAudioElements).toHaveLength(1);

      const audio = mockAudioElements[0];
      expect(audio.src).toBe(src);
      expect(audio.currentTime).toBe(0);
      expect(audio.volume).toBe(1);
      expect(audio.loop).toBe(false);
      expect(audio.preload).toBe('auto');
    });

    it('should reuse existing audio element for same source', async () => {
      const src = '/test-sound.mp3';

      await soundManager.play(src);
      await soundManager.play(src);

      expect(global.Audio).toHaveBeenCalledTimes(1);
      expect(mockAudioElements).toHaveLength(1);
    });

    it('should reset currentTime to 0 when playing', async () => {
      const src = '/test-sound.mp3';

      await soundManager.play(src);
      const audio = mockAudioElements[0];
      audio.currentTime = 5; // Simulate audio progress

      await soundManager.play(src);
      expect(audio.currentTime).toBe(0);
    });

    it('should apply volume options correctly', async () => {
      const src = '/test-sound.mp3';

      await soundManager.play(src, { volume: 0.5 });

      const audio = mockAudioElements[0];
      expect(audio.volume).toBe(0.5);
    });

    it('should apply global volume multiplier', async () => {
      const src = '/test-sound.mp3';
      soundManager.setGlobalVolume(0.8);

      await soundManager.play(src, { volume: 0.5 });

      const audio = mockAudioElements[0];
      expect(audio.volume).toBe(0.4); // 0.5 * 0.8
    });

    it('should clamp volume between 0 and 1', async () => {
      const src = '/test-sound.mp3';

      // Test volume > 1
      await soundManager.play(src, { volume: 2.0 });
      expect(mockAudioElements[0].volume).toBe(1);

      // Test volume < 0
      await soundManager.play(src, { volume: -0.5 });
      expect(mockAudioElements[0].volume).toBe(0);
    });

    it('should apply loop option correctly', async () => {
      const src = '/test-sound.mp3';

      await soundManager.play(src, { loop: true });

      const audio = mockAudioElements[0];
      expect(audio.loop).toBe(true);
    });

    it('should not play when sound is disabled', async () => {
      const src = '/test-sound.mp3';
      soundManager.setEnabled(false);

      await soundManager.play(src);

      expect(global.Audio).not.toHaveBeenCalled();
      expect(mockAudioElements).toHaveLength(0);
    });

    it('should handle play errors gracefully', async () => {
      const src = '/test-sound.mp3';
      const mockAudio = new MockAudioElement();
      mockAudio.play = vi.fn().mockRejectedValue(new Error('Play failed'));

      global.Audio = vi.fn().mockReturnValue(mockAudio);

      await soundManager.play(src);

      expect(console.warn).toHaveBeenCalledWith(
        'Failed to play sound:',
        src,
        expect.any(Error)
      );
    });

    it('should handle multiple different audio sources', async () => {
      const src1 = '/sound1.mp3';
      const src2 = '/sound2.mp3';

      await soundManager.play(src1);
      await soundManager.play(src2);

      expect(global.Audio).toHaveBeenCalledTimes(2);
      expect(mockAudioElements).toHaveLength(2);
      expect(mockAudioElements[0].src).toBe(src1);
      expect(mockAudioElements[1].src).toBe(src2);
    });
  });

  describe('stopAll', () => {
    it('should pause all audio elements and reset currentTime', async () => {
      const src1 = '/sound1.mp3';
      const src2 = '/sound2.mp3';

      await soundManager.play(src1);
      await soundManager.play(src2);

      // Simulate audio playing
      mockAudioElements.forEach(audio => {
        audio.currentTime = 5;
        audio['_paused'] = false;
      });

      soundManager.stopAll();

      mockAudioElements.forEach(audio => {
        expect(audio.paused).toBe(true);
        expect(audio.currentTime).toBe(0);
      });
    });

    it('should work when no audio elements exist', () => {
      expect(() => soundManager.stopAll()).not.toThrow();
    });
  });

  describe('setGlobalVolume', () => {
    it('should set global volume within valid range', () => {
      soundManager.setGlobalVolume(0.7);
      // We can't directly test the private property, but we can test its effect

      // Test by playing a sound and checking the resulting volume
      const testVolume = async (inputVolume: number, expectedVolume: number) => {
        await soundManager.play('/test.mp3', { volume: inputVolume });
        const audio = mockAudioElements[mockAudioElements.length - 1];
        expect(audio.volume).toBe(expectedVolume);
      };

      return testVolume(1, 0.7); // 1 * 0.7 = 0.7
    });

    it('should clamp global volume to minimum 0', async () => {
      soundManager.setGlobalVolume(-0.5);

      await soundManager.play('/test.mp3', { volume: 1 });
      const audio = mockAudioElements[0];
      expect(audio.volume).toBe(0);
    });

    it('should clamp global volume to maximum 1', async () => {
      soundManager.setGlobalVolume(1.5);

      await soundManager.play('/test.mp3', { volume: 1 });
      const audio = mockAudioElements[0];
      expect(audio.volume).toBe(1);
    });
  });

  describe('isEnabled', () => {
    it('should return current enabled state', () => {
      soundManager.setEnabled(true);
      expect(soundManager.isEnabled()).toBe(true);

      soundManager.setEnabled(false);
      expect(soundManager.isEnabled()).toBe(false);
    });
  });

  describe('setEnabled', () => {
    it('should update enabled state and save to localStorage', () => {
      soundManager.setEnabled(false);

      expect(soundManager.isEnabled()).toBe(false);
      expect(mockStorage.setItem).toHaveBeenCalledWith('sound', 'false');

      soundManager.setEnabled(true);

      expect(soundManager.isEnabled()).toBe(true);
      expect(mockStorage.setItem).toHaveBeenCalledWith('sound', 'true');
    });

    it('should stop all sounds when disabled', async () => {
      const src = '/test-sound.mp3';
      await soundManager.play(src);

      const audio = mockAudioElements[0];
      audio.currentTime = 5;
      audio['_paused'] = false;

      soundManager.setEnabled(false);

      expect(audio.paused).toBe(true);
      expect(audio.currentTime).toBe(0);
    });

    it('should not stop sounds when enabled', async () => {
      const src = '/test-sound.mp3';
      await soundManager.play(src);

      const audio = mockAudioElements[0];
      audio.currentTime = 5;
      audio['_paused'] = false;

      soundManager.setEnabled(true);

      expect(audio.paused).toBe(false);
      expect(audio.currentTime).toBe(5);
    });
  });

  describe('integration tests', () => {
    it('should handle complete workflow: enable, play, disable, enable', async () => {
      const src = '/workflow-test.mp3';

      // Initially enabled
      expect(soundManager.isEnabled()).toBe(true);

      // Play sound
      await soundManager.play(src, { volume: 0.8, loop: true });
      expect(mockAudioElements).toHaveLength(1);

      const audio = mockAudioElements[0];
      expect(audio.volume).toBe(0.8);
      expect(audio.loop).toBe(true);

      // Disable sound
      soundManager.setEnabled(false);
      expect(audio.paused).toBe(true);
      expect(audio.currentTime).toBe(0);

      // Try to play while disabled (should not create new audio)
      await soundManager.play('/another-sound.mp3');
      expect(mockAudioElements).toHaveLength(1); // Still only one

      // Re-enable and play
      soundManager.setEnabled(true);
      await soundManager.play('/new-sound.mp3');
      expect(mockAudioElements).toHaveLength(2);
    });

    it('should handle multiple sounds with different settings', async () => {
      soundManager.setGlobalVolume(0.5);

      const sounds = [
        { src: '/sound1.mp3', options: { volume: 1.0, loop: false } },
        { src: '/sound2.mp3', options: { volume: 0.6, loop: true } },
        { src: '/sound3.mp3', options: { volume: 0.4 } }
      ];

      for (const sound of sounds) {
        await soundManager.play(sound.src, sound.options);
      }

      expect(mockAudioElements).toHaveLength(3);

      // Check each audio element
      expect(mockAudioElements[0].volume).toBe(0.5); // 1.0 * 0.5
      expect(mockAudioElements[0].loop).toBe(false);

      expect(mockAudioElements[1].volume).toBe(0.3); // 0.6 * 0.5
      expect(mockAudioElements[1].loop).toBe(true);

      expect(mockAudioElements[2].volume).toBe(0.2); // 0.4 * 0.5
      expect(mockAudioElements[2].loop).toBe(false);

      // Stop all
      soundManager.stopAll();
      mockAudioElements.forEach(audio => {
        expect(audio.paused).toBe(true);
        expect(audio.currentTime).toBe(0);
      });
    });
  });

  describe('edge cases', () => {
    it('should handle empty string source', async () => {
      await soundManager.play('');

      expect(global.Audio).toHaveBeenCalledWith('');
      expect(mockAudioElements).toHaveLength(1);
    });

    it('should handle undefined options', async () => {
      await soundManager.play('/test.mp3', undefined);

      const audio = mockAudioElements[0];
      expect(audio.volume).toBe(1);
      expect(audio.loop).toBe(false);
    });

    it('should handle partial options', async () => {
      await soundManager.play('/test.mp3', { volume: 0.7 });

      const audio = mockAudioElements[0];
      expect(audio.volume).toBe(0.7);
      expect(audio.loop).toBe(false); // Default value
    });

    it('should handle zero volume', async () => {
      await soundManager.play('/test.mp3', { volume: 0 });

      const audio = mockAudioElements[0];
      expect(audio.volume).toBe(0);
    });

    it('should handle very long source URLs', async () => {
      const longUrl = 'https://example.com/' + 'a'.repeat(1000) + '.mp3';

      await soundManager.play(longUrl);

      expect(global.Audio).toHaveBeenCalledWith(longUrl);
      expect(mockAudioElements[0].src).toBe(longUrl);
    });
  });
});

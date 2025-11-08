import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import type { SoundMap } from './types';

// Mock the audio engine to avoid WebAudio dependencies in tests
const mockEngine = {
  name: 'MockEngine',
  createSound: vi.fn(() => Promise.resolve('mock-sound-id')),
  playSound: vi.fn(() => Promise.resolve()),
  stopSound: vi.fn(),
  stopAll: vi.fn(),
  setVolume: vi.fn(),
  setEnabled: vi.fn(),
  isEnabled: vi.fn(() => true),
  dispose: vi.fn()
};

vi.mock('./engine/index.js', () => ({
  getAudioEngine: vi.fn(() => Promise.resolve(mockEngine)),
  setEngineConfig: vi.fn()
}));

// Mock HTMLAudioElement for legacy tests
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
  let soundManager: any;
  let mockStorage: ReturnType<typeof createMockStorage>;

  beforeEach(async () => {
    // Clear module cache and reimport
    vi.resetModules();
    vi.clearAllMocks();

    // Reset mock storage
    mockStorage = createMockStorage();
    Object.defineProperty(global, 'localStorage', {
      value: mockStorage,
      configurable: true
    });

    // Mock Audio constructor
    global.Audio = vi.fn().mockImplementation((src?: string) => {
      return new MockAudioElement(src);
    }) as any;

    // Mock process.env for engine configuration
    process.env.USE_TONE = 'false';
    delete process.env.AUDIO_ENGINE;

    // Mock console methods
    vi.spyOn(console, 'warn').mockImplementation(() => { });

    // Import soundManager after setting up mocks
    const { soundManager: sm } = await import('./soundManager');
    soundManager = sm;
  });

  afterEach(() => {
    vi.restoreAllMocks();
    delete process.env.USE_TONE;
    delete process.env.AUDIO_ENGINE;
  });

  describe('SoundMap functionality', () => {
    const testSoundMap: SoundMap = {
      beep: {
        tone: {
          type: 'sine',
          note: 'A4',
          duration: '8n'
        },
        volume: 0.5
      },
      click: {
        src: '/sounds/click.mp3',
        volume: 0.8
      },
      mixedSound: {
        tone: {
          type: 'square',
          frequency: 880,
          duration: 0.1
        },
        src: '/sounds/fallback.mp3',
        volume: 0.6
      }
    };

    it('should play sound from SoundMap', async () => {
      await soundManager.playSound('beep', testSoundMap);

      expect(mockEngine.createSound).toHaveBeenCalledWith(
        expect.objectContaining({
          tone: expect.objectContaining({
            type: 'sine',
            note: 'A4',
            duration: '8n'
          }),
          volume: 0.5
        }),
        expect.any(Object)
      );
      expect(mockEngine.playSound).toHaveBeenCalled();
    });

    it('should handle file-based sounds from SoundMap', async () => {
      await soundManager.playSound('click', testSoundMap);

      expect(mockEngine.createSound).toHaveBeenCalledWith(
        expect.objectContaining({
          src: '/sounds/click.mp3',
          volume: 0.8
        }),
        expect.any(Object)
      );
    });

    it('should handle missing sound in SoundMap', async () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      await soundManager.playSound('nonexistent', testSoundMap);

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining("Sound 'nonexistent' not found in sound map")
      );
      expect(mockEngine.createSound).not.toHaveBeenCalled();

      consoleSpy.mockRestore();
    });

    it('should register and retrieve SoundMaps', () => {
      soundManager.registerSoundMap('test', testSoundMap);

      const retrievedMap = soundManager.getSoundMap('test');
      expect(retrievedMap).toBe(testSoundMap);
    });

    it('should play from registered SoundMap', async () => {
      soundManager.registerSoundMap('test', testSoundMap);

      await soundManager.playSoundFromMap('test', 'beep');

      expect(mockEngine.createSound).toHaveBeenCalled();
      expect(mockEngine.playSound).toHaveBeenCalled();
    });

    it('should handle missing registered SoundMap', async () => {
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      await soundManager.playSoundFromMap('missing', 'beep');

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining("Sound map 'missing' not found")
      );

      consoleSpy.mockRestore();
    });

    it('should not play when disabled', async () => {
      soundManager.setEnabled(false);

      await soundManager.playSound('beep', testSoundMap);

      expect(mockEngine.createSound).not.toHaveBeenCalled();
      expect(mockEngine.playSound).not.toHaveBeenCalled();
    });
  });

  describe('Legacy compatibility', () => {
    it('should support legacy play method', async () => {
      await soundManager.play('/sounds/test.mp3');

      expect(mockEngine.createSound).toHaveBeenCalledWith(
        expect.objectContaining({
          src: '/sounds/test.mp3'
        }),
        expect.any(Object)
      );
      expect(mockEngine.playSound).toHaveBeenCalled();
    });

    it('should respect volume and loop options in legacy mode', async () => {
      await soundManager.play('/sounds/test.mp3', { volume: 0.5, loop: true });

      expect(mockEngine.createSound).toHaveBeenCalledWith(
        expect.objectContaining({
          src: '/sounds/test.mp3',
          volume: 0.5,
          loop: true
        }),
        expect.objectContaining({
          volume: 0.5,
          loop: true
        })
      );
    });

    it('should handle legacy play errors gracefully', async () => {
      mockEngine.createSound.mockRejectedValueOnce(new Error('Engine error'));
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      await soundManager.play('/sounds/test.mp3');

      expect(consoleSpy).toHaveBeenCalledWith(
        'Failed to play sound:',
        '/sounds/test.mp3',
        expect.any(Error)
      );

      consoleSpy.mockRestore();
    });
  });

  describe('Global settings', () => {
    it('should save and load enabled state from localStorage', () => {
      soundManager.setEnabled(false);
      expect(mockStorage.setItem).toHaveBeenCalledWith('sound', 'false');

      soundManager.setEnabled(true);
      expect(mockStorage.setItem).toHaveBeenCalledWith('sound', 'true');
    });

    it('should configure engine based on environment', async () => {
      const { setEngineConfig } = await import('./engine/index.js');

      // The constructor should have called setEngineConfig with default settings
      expect(setEngineConfig).toHaveBeenCalledWith({
        useTone: false,
        preferredEngine: 'webaudio'
      });
    });

    it('should delegate volume setting to engine', async () => {
      soundManager.setGlobalVolume(0.7);

      // Wait for async engine call
      await new Promise(resolve => setTimeout(resolve, 0));

      expect(mockEngine.setVolume).toHaveBeenCalledWith(0.7);
    });

    it('should delegate stopAll to engine', async () => {
      soundManager.stopAll();

      // Wait for async engine call
      await new Promise(resolve => setTimeout(resolve, 0));

      expect(mockEngine.stopAll).toHaveBeenCalled();
    });

    it('should apply global volume to sound definitions', async () => {
      const testSoundMap: SoundMap = {
        test: { tone: { type: 'sine', note: 'A4', duration: '8n' }, volume: 0.8 }
      };

      soundManager.setGlobalVolume(0.5);
      await soundManager.playSound('test', testSoundMap);

      expect(mockEngine.createSound).toHaveBeenCalledWith(
        expect.objectContaining({
          volume: 0.4 // 0.8 * 0.5
        }),
        expect.any(Object)
      );
    });
  });

  describe('Sound caching', () => {
    it('should cache sounds to avoid recreation', async () => {
      const testSoundMap: SoundMap = {
        test: { tone: { type: 'sine', note: 'A4', duration: '8n' } }
      };

      // Play the same sound twice
      await soundManager.playSound('test', testSoundMap);
      await soundManager.playSound('test', testSoundMap);

      // Should create sound only once, play twice
      expect(mockEngine.createSound).toHaveBeenCalledTimes(1);
      expect(mockEngine.playSound).toHaveBeenCalledTimes(2);
    });

    it('should invalidate cache when volume changes', async () => {
      const testSoundMap: SoundMap = {
        test: { tone: { type: 'sine', note: 'A4', duration: '8n' } }
      };

      await soundManager.playSound('test', testSoundMap);

      soundManager.setGlobalVolume(0.5);
      await soundManager.playSound('test', testSoundMap);

      // Should create sound twice due to volume change
      expect(mockEngine.createSound).toHaveBeenCalledTimes(2);
    });

    it('should clear cache when stopping all sounds', async () => {
      const testSoundMap: SoundMap = {
        test: { tone: { type: 'sine', note: 'A4', duration: '8n' } }
      };

      await soundManager.playSound('test', testSoundMap);
      soundManager.stopAll();
      await soundManager.playSound('test', testSoundMap);

      // Should create sound twice due to cache clear
      expect(mockEngine.createSound).toHaveBeenCalledTimes(2);
    });
  });
});

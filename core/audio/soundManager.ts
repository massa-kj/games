import type { SoundOptions, SoundMap, SoundDefinition, PlayOptions, MelodyDefinition } from './types';
import { getAudioEngine, setEngineConfig } from './engine/index.js';

export interface SoundManager {
  play(src: string, options?: SoundOptions): Promise<void>;
  playSound(soundName: string, soundMap: SoundMap, options?: PlayOptions): Promise<void>;
  playMelody(melodyDefinition: MelodyDefinition, options?: PlayOptions): Promise<void>;
  registerMelody(name: string, melodyDefinition: MelodyDefinition): void;
  playRegisteredMelody(name: string, options?: PlayOptions): Promise<void>;
  stopAll(): void;
  setGlobalVolume(volume: number): void;
  isEnabled(): boolean;
  setEnabled(enabled: boolean): void;
}

/**
 * Enhanced sound manager with SoundMap support and engine abstraction
 */
class EnhancedSoundManager implements SoundManager {
  private soundMaps: Map<string, SoundMap> = new Map();
  private melodyDefinitions: Map<string, MelodyDefinition> = new Map();
  private soundCache: Map<string, string> = new Map(); // soundName -> soundId
  private globalVolume = 1;
  private enabled = true;

  constructor() {
    // Load settings from localStorage
    const soundEnabled = localStorage.getItem('sound');
    if (soundEnabled !== null) {
      this.enabled = JSON.parse(soundEnabled);
    }

    // Configure engine with default settings
    // Use WebAudio as default, no Tone.js dependency
    setEngineConfig({
      useTone: false, // Default to false to avoid optional dependencies
      preferredEngine: 'webaudio' // Prefer WebAudio for better performance
    });
  }

  /**
   * Legacy method for backward compatibility
   */
  async play(src: string, options: SoundOptions = {}): Promise<void> {
    if (!this.enabled) return;

    try {
      const engine = await getAudioEngine();
      const soundDefinition: SoundDefinition = {
        src,
        volume: options.volume,
        loop: options.loop
      };

      const soundId = await engine.createSound(soundDefinition, options as PlayOptions);
      await engine.playSound(soundId, options as PlayOptions);
    } catch (error) {
      console.warn('Failed to play sound:', src, error);
    }
  }

  /**
   * Play a named sound from a SoundMap
   */
  async playSound(soundName: string, soundMap: SoundMap, options: PlayOptions = {}): Promise<void> {
    if (!this.enabled) return;

    const soundDefinition = soundMap[soundName];
    if (!soundDefinition) {
      console.warn(`Sound '${soundName}' not found in sound map`);
      return;
    }

    try {
      // Resume AudioContext if suspended (required for user interaction)
      await this.resumeAudioContext();

      const engine = await getAudioEngine();

      // Handle melody definitions
      if (soundDefinition.melody) {
        if (engine.createMelody) {
          const melodyId = await engine.createMelody(soundDefinition.melody, options);
          await engine.playSound(melodyId, options);
          return;
        } else if (soundDefinition.fallback) {
          // Use fallback if melody is not supported
          const fallbackDefinition: SoundDefinition = { ...soundDefinition.fallback };
          return this.playSound(soundName, { [soundName]: fallbackDefinition }, options);
        } else {
          console.warn(`Engine '${engine.name}' does not support melodies. Consider using fallback or WebAudioEngine.`);
          return;
        }
      }

      // Handle regular sounds (existing logic)
      const cacheKey = `${JSON.stringify(soundDefinition)}_${this.globalVolume}`;

      let soundId = this.soundCache.get(cacheKey);
      if (!soundId) {
        // Create new sound and cache it
        const mergedDefinition: SoundDefinition = {
          ...soundDefinition,
          volume: (soundDefinition.volume || 1) * this.globalVolume
        };

        soundId = await engine.createSound(mergedDefinition, options);
        this.soundCache.set(cacheKey, soundId);
      }

      await engine.playSound(soundId, options);
    } catch (error) {
      console.warn(`Failed to play sound '${soundName}':`, error);
    }
  }

  private async resumeAudioContext() {
    try {
      // Try to get the audio engine context and resume it
      const engine = await getAudioEngine();
      if ('context' in (engine as any)) {
        const context = (engine as any).context;
        if (context && context.state === 'suspended') {
          await context.resume();
        }
      }
    } catch (error) {
      console.warn('Failed to resume AudioContext:', error);
    }
  }

  /**
   * Register a sound map for reuse
   */
  registerSoundMap(name: string, soundMap: SoundMap): void {
    this.soundMaps.set(name, soundMap);
  }

  /**
   * Get a registered sound map
   */
  getSoundMap(name: string): SoundMap | undefined {
    return this.soundMaps.get(name);
  }

  /**
   * Play a sound from a registered sound map
   */
  async playSoundFromMap(mapName: string, soundName: string, options?: PlayOptions): Promise<void> {
    const soundMap = this.getSoundMap(mapName);
    if (!soundMap) {
      console.warn(`Sound map '${mapName}' not found`);
      return;
    }

    return this.playSound(soundName, soundMap, options);
  }

  /**
   * Play a melody from a MelodyDefinition
   */
  async playMelody(melodyDefinition: MelodyDefinition, options: PlayOptions = {}): Promise<void> {
    if (!this.enabled) return;

    try {
      await this.resumeAudioContext();
      const engine = await getAudioEngine();

      // Check if engine supports melody creation
      if (!engine.createMelody) {
        console.warn(`Engine '${engine.name}' does not support direct melody playback. Consider using WebAudioEngine.`);
        return;
      }

      // Create the melody sound
      const soundId = await engine.createMelody(melodyDefinition, options);
      await engine.playSound(soundId, options);
    } catch (error) {
      console.warn('Failed to play melody:', error);
    }
  }

  /**
   * Register a melody definition for reuse
   */
  registerMelody(name: string, melodyDefinition: MelodyDefinition): void {
    this.melodyDefinitions.set(name, melodyDefinition);
  }

  /**
   * Play a registered melody by name
   */
  async playRegisteredMelody(name: string, options?: PlayOptions): Promise<void> {
    const melodyDefinition = this.melodyDefinitions.get(name);
    if (!melodyDefinition) {
      console.warn(`Melody '${name}' not found`);
      return;
    }

    return this.playMelody(melodyDefinition, options);
  }

  stopAll(): void {
    getAudioEngine().then(engine => {
      engine.stopAll();
    }).catch(console.warn);

    // Clear cache when stopping all
    this.soundCache.clear();
  }

  setGlobalVolume(volume: number): void {
    this.globalVolume = Math.max(0, Math.min(1, volume));

    getAudioEngine().then(engine => {
      engine.setVolume(this.globalVolume);
    }).catch(console.warn);

    // Invalidate cache since volume changed
    this.soundCache.clear();
  }

  isEnabled(): boolean {
    return this.enabled;
  }

  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
    localStorage.setItem('sound', JSON.stringify(enabled));

    getAudioEngine().then(engine => {
      engine.setEnabled(enabled);
    }).catch(console.warn);

    if (!enabled) {
      this.stopAll();
    }
  }
}

// Global sound manager instance
export const soundManager: SoundManager = new EnhancedSoundManager();

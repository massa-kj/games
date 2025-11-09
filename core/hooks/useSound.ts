import { useCallback, useRef, useEffect } from 'react';
import { soundManager } from '../audio/soundManager.js';
import type { SoundOptions, SoundMap, PlayOptions, MelodyDefinition } from '../audio/types.js';

/**
 * Configuration for useSound hook
 */
export interface UseSoundConfig {
  /** Global volume multiplier for this hook instance */
  volume?: number;
  /** Default options for all sound playback */
  defaultOptions?: PlayOptions;
}

/**
 * Enhanced useSound hook with SoundMap and Melody support
 *
 * Provides unified interface for playing sounds, effects, and melodies.
 * Supports both file-based audio and procedurally generated content.
 *
 * @param soundMap Optional SoundMap to use for this hook instance
 * @param config Configuration options
 *
 * @example
 * ```typescript
 * // Basic usage with SoundMap
 * const { play } = useSound(gameSounds);
 * await play('victory'); // Plays sound or melody from SoundMap
 *
 * // Direct melody playback
 * const { playMelody } = useSound();
 * await playMelody({
 *   notes: [{ note: 'C4', duration: '4n' }],
 *   bpm: 120
 * });
 *
 * // Unified API
 * const { playAudio } = useSound(gameSounds);
 * await playAudio('victory'); // From SoundMap
 * await playAudio(melodyDefinition); // Direct melody
 * ```
 */
export function useSound(soundMap?: SoundMap, config: UseSoundConfig = {}) {
  const soundMapRef = useRef(soundMap);
  const configRef = useRef(config);

  // Update refs when props change
  useEffect(() => {
    soundMapRef.current = soundMap;
    configRef.current = config;
  }, [soundMap, config]);

  /**
   * Play a sound by URL (legacy method)
   */
  const playSound = useCallback(async (src: string, options?: SoundOptions) => {
    try {
      const config = configRef.current;
      let finalOptions: SoundOptions | undefined = options;

      // Only merge config if we have meaningful config values or options
      if (options || config.defaultOptions || (config.volume && config.volume !== 1)) {
        finalOptions = {
          ...config.defaultOptions,
          ...options,
          volume: (options?.volume ?? 1) * (config.volume ?? 1)
        };
      }

      await soundManager.play(src, finalOptions);
    } catch (error) {
      console.warn('Failed to play sound:', error);
    }
  }, []);

  /**
   * Play a named sound from the provided SoundMap
   */
  const playSoundFromMap = useCallback(async (soundName: string, options?: PlayOptions) => {
    if (!soundMapRef.current) {
      console.warn('No SoundMap provided to useSound hook');
      return;
    }

    try {
      const mergedOptions: PlayOptions = {
        ...configRef.current.defaultOptions,
        ...options,
        volume: (options?.volume ?? 1) * (configRef.current.volume ?? 1)
      };
      await soundManager.playSound(soundName, soundMapRef.current, mergedOptions);
    } catch (error) {
      console.warn(`Failed to play sound '${soundName}':`, error);
    }
  }, []);

  /**
   * Play a sound from any SoundMap
   */
  const playSoundWithMap = useCallback(async (
    soundName: string,
    customSoundMap: SoundMap,
    options?: PlayOptions
  ) => {
    try {
      const mergedOptions: PlayOptions = {
        ...configRef.current.defaultOptions,
        ...options,
        volume: (options?.volume ?? 1) * (configRef.current.volume ?? 1)
      };
      await soundManager.playSound(soundName, customSoundMap, mergedOptions);
    } catch (error) {
      console.warn(`Failed to play sound '${soundName}':`, error);
    }
  }, []);

  /**
   * Stop all currently playing sounds
   */
  const stopAllSounds = useCallback(() => {
    soundManager.stopAll();
  }, []);

  /**
   * Set global volume
   */
  const setVolume = useCallback((volume: number) => {
    soundManager.setGlobalVolume(volume);
  }, []);

  /**
   * Toggle sound on/off
   */
  const toggleSound = useCallback(() => {
    const isEnabled = soundManager.isEnabled();
    soundManager.setEnabled(!isEnabled);
    return !isEnabled;
  }, []);

  /**
   * Get available sound names from the current SoundMap
   */
  const getSoundNames = useCallback((): string[] => {
    return soundMapRef.current ? Object.keys(soundMapRef.current) : [];
  }, []);

  /**
   * Check if a sound exists in the current SoundMap
   */
  const hasSoundEffect = useCallback((soundName: string): boolean => {
    return soundMapRef.current ? soundName in soundMapRef.current : false;
  }, []);

  /**
   * Play a melody directly (unified with sound playback)
   */
  const playMelody = useCallback(async (melodyDefinition: MelodyDefinition, options?: PlayOptions) => {
    try {
      const mergedOptions: PlayOptions = {
        ...configRef.current.defaultOptions,
        ...options,
        volume: (options?.volume ?? 1) * (configRef.current.volume ?? 1)
      };
      await soundManager.playMelody(melodyDefinition, mergedOptions);
    } catch (error) {
      console.warn('Failed to play melody:', error);
    }
  }, []);

  /**
   * Register a melody for reuse (unified with sound management)
   */
  const registerMelody = useCallback((name: string, melodyDefinition: MelodyDefinition) => {
    soundManager.registerMelody(name, melodyDefinition);
  }, []);

  /**
   * Play a registered melody by name (unified with sound playback)
   */
  const playRegisteredMelody = useCallback(async (name: string, options?: PlayOptions) => {
    try {
      const mergedOptions: PlayOptions = {
        ...configRef.current.defaultOptions,
        ...options,
        volume: (options?.volume ?? 1) * (configRef.current.volume ?? 1)
      };
      await soundManager.playRegisteredMelody(name, mergedOptions);
    } catch (error) {
      console.warn(`Failed to play registered melody '${name}':`, error);
    }
  }, []);

  /**
   * Unified play method that works with both sounds and melodies
   * Automatically detects if the sound definition contains a melody
   */
  const playAudio = useCallback(async (nameOrDefinition: string | MelodyDefinition, options?: PlayOptions) => {
    if (typeof nameOrDefinition === 'string') {
      // String: play from SoundMap or registered melody
      if (soundMapRef.current && nameOrDefinition in soundMapRef.current) {
        return playSoundFromMap(nameOrDefinition, options);
      } else {
        // Try as registered melody
        return playRegisteredMelody(nameOrDefinition, options);
      }
    } else {
      // MelodyDefinition: play directly
      return playMelody(nameOrDefinition, options);
    }
  }, [playSoundFromMap, playRegisteredMelody, playMelody]);

  return {
    // Primary methods (new unified API)
    play: soundMapRef.current ? playSoundFromMap : playSound,
    playAudio, // Unified method for sounds and melodies
    playSoundFromMap,
    playSoundWithMap,

    // Melody-specific methods
    playMelody,
    registerMelody,
    playRegisteredMelody,

    // Legacy method (backward compatibility)
    playSound,

    // Utility methods
    stopAllSounds,
    setVolume,
    toggleSound,
    getSoundNames,
    hasSoundEffect,

    // State
    isEnabled: soundManager.isEnabled(),
    hasSoundMap: !!soundMapRef.current,
  };
}

/**
 * Simple useSound hook for backward compatibility
 */
export function useSoundLegacy() {
  return useSound();
}

import { useCallback, useRef, useEffect } from 'react';
import { soundManager } from '../audio/soundManager.js';
import type { SoundOptions, SoundMap, PlayOptions } from '../audio/types.js';

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
 * Enhanced useSound hook with SoundMap support
 *
 * @param soundMap Optional SoundMap to use for this hook instance
 * @param config Configuration options
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

  return {
    // Primary methods (new API)
    play: soundMapRef.current ? playSoundFromMap : playSound,
    playSoundFromMap,
    playSoundWithMap,

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

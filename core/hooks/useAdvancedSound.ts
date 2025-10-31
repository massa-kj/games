import { useCallback } from 'react';
import { advancedSoundManager } from '../audio/hybridSoundManager.js';
import { GameAudioUtils } from '../audio/gameAudioTemplates.js';

export interface AdvancedSoundHook {
  // Basic audio playback
  playSound: (src: string, options?: any) => Promise<void>;
  playTemplate: (template: string, params?: Record<string, any>) => Promise<string>;

  // Game-specific utilities
  playGameEvent: (event: string, params?: Record<string, any>) => Promise<string | void>;
  playUIFeedback: (action: 'click' | 'hover' | 'success' | 'error', params?: Record<string, any>) => Promise<string | void>;

  // Programmable sound source
  playTone: (frequency: number, duration?: number, options?: any) => Promise<string>;
  playBeep: (options?: { frequency?: number; duration?: number }) => Promise<string>;
  playNoise: (type: 'white' | 'pink', duration?: number, options?: any) => Promise<string>;

  // Advanced control
  scheduledPlay: (src: string, when: number, options?: any) => Promise<string>;
  stopSound: (soundId: string) => void;
  stopAllSounds: () => void;

  // Effects
  createEffect: (type: string, params?: Record<string, any>) => string;

  // Settings
  setVolume: (volume: number) => void;
  toggleSound: () => boolean;
  isEnabled: boolean;
}

/**
 * React hook providing advanced Web Audio API functionality
 *
 * @example
 * ```typescript
 * function GameComponent() {
 *   const { playTemplate, playGameEvent } = useAdvancedSound();
 *
 *   const handleCoinCollect = () => {
 *     playTemplate('coin-collect', { pitch: 1.2 });
 *   };
 *
 *   const handleLevelUp = () => {
 *     playGameEvent('levelUp');
 *   };
 *
 *   return (
 *     <div>
 *       <button onClick={handleCoinCollect}>Collect Coin</button>
 *       <button onClick={handleLevelUp}>Level Up!</button>
 *     </div>
 *   );
 * }
 * ```
 */
export function useAdvancedSound(): AdvancedSoundHook {
  // Basic audio playback
  const playSound = useCallback(async (src: string, options: any = {}) => {
    try {
      await advancedSoundManager.play(src, options);
    } catch (error) {
      console.warn('Failed to play sound:', error);
    }
  }, []);

  const playTemplate = useCallback(async (template: string, params: Record<string, any> = {}): Promise<string> => {
    try {
      return await advancedSoundManager.playTemplate(template, params);
    } catch (error) {
      console.warn('Failed to play template:', template, error);
      throw error;
    }
  }, []);

  // Game-specific utilities
  const playGameEvent = useCallback(async (event: string, params: Record<string, any> = {}): Promise<string | void> => {
    try {
      return await GameAudioUtils.playGameEvent(advancedSoundManager, event, params);
    } catch (error) {
      console.warn('Failed to play game event:', event, error);
    }
  }, []);

  const playUIFeedback = useCallback(async (
    action: 'click' | 'hover' | 'success' | 'error',
    params: Record<string, any> = {}
  ): Promise<string | void> => {
    try {
      return await GameAudioUtils.playUIFeedback(advancedSoundManager, action, params);
    } catch (error) {
      console.warn('Failed to play UI feedback:', action, error);
    }
  }, []);

  // Programmable sound source
  const playTone = useCallback(async (
    frequency: number,
    duration: number = 1,
    options: any = {}
  ): Promise<string> => {
    try {
      return await advancedSoundManager.playTone(frequency, duration, options);
    } catch (error) {
      console.warn('Failed to play tone:', error);
      throw error;
    }
  }, []);

  const playBeep = useCallback(async (
    options: { frequency?: number; duration?: number } = {}
  ): Promise<string> => {
    try {
      return await advancedSoundManager.playBeep(options);
    } catch (error) {
      console.warn('Failed to play beep:', error);
      throw error;
    }
  }, []);

  const playNoise = useCallback(async (
    type: 'white' | 'pink',
    duration: number = 1,
    options: any = {}
  ): Promise<string> => {
    try {
      return await advancedSoundManager.playNoise(type, duration, options);
    } catch (error) {
      console.warn('Failed to play noise:', error);
      throw error;
    }
  }, []);

  // Advanced control
  const scheduledPlay = useCallback(async (
    src: string,
    when: number,
    options: any = {}
  ): Promise<string> => {
    try {
      return await advancedSoundManager.scheduledPlay(src, when, options);
    } catch (error) {
      console.warn('Failed to schedule play:', error);
      throw error;
    }
  }, []);

  const stopSound = useCallback((soundId: string) => {
    try {
      // Note: To implement this feature, it needs to be added to hybridSoundManager
      console.warn('stopSound not yet implemented for individual sounds');
    } catch (error) {
      console.warn('Failed to stop sound:', soundId, error);
    }
  }, []);

  const stopAllSounds = useCallback(() => {
    try {
      advancedSoundManager.stopAll();
    } catch (error) {
      console.warn('Failed to stop all sounds:', error);
    }
  }, []);

  // Effects
  const createEffect = useCallback((type: string, params: Record<string, any> = {}): string => {
    try {
      return advancedSoundManager.createEffect(type, params);
    } catch (error) {
      console.warn('Failed to create effect:', type, error);
      throw error;
    }
  }, []);

  // Settings
  const setVolume = useCallback((volume: number) => {
    try {
      advancedSoundManager.setGlobalVolume(volume);
    } catch (error) {
      console.warn('Failed to set volume:', error);
    }
  }, []);

  const toggleSound = useCallback((): boolean => {
    try {
      const isEnabled = advancedSoundManager.isEnabled();
      advancedSoundManager.setEnabled(!isEnabled);
      return !isEnabled;
    } catch (error) {
      console.warn('Failed to toggle sound:', error);
      return false;
    }
  }, []);

  return {
    playSound,
    playTemplate,
    playGameEvent,
    playUIFeedback,
    playTone,
    playBeep,
    playNoise,
    scheduledPlay,
    stopSound,
    stopAllSounds,
    createEffect,
    setVolume,
    toggleSound,
    isEnabled: advancedSoundManager.isEnabled(),
  };
}

/**
 * Dedicated hook for specific game events
 *
 * @example
 * ```typescript
 * function ScoreDisplay() {
 *   const { onCoinCollect, onLevelUp, onGameOver } = useGameAudio();
 *
 *   return (
 *     <div>
 *       <button onClick={() => onCoinCollect(100)}>+100 points</button>
 *       <button onClick={onLevelUp}>Level Up!</button>
 *       <button onClick={onGameOver}>Game Over</button>
 *     </div>
 *   );
 * }
 * ```
 */
export function useGameAudio() {
  const { playGameEvent, playTemplate } = useAdvancedSound();

  const onCoinCollect = useCallback(async (points: number = 10) => {
    const pitch = Math.min(1.5, 1 + (points / 1000)); // Adjust pitch based on score
    await playTemplate('coin-collect', { pitch });
  }, [playTemplate]);

  const onLevelUp = useCallback(async () => {
    await playGameEvent('levelUp');
  }, [playGameEvent]);

  const onGameOver = useCallback(async () => {
    await playGameEvent('gameOver');
  }, [playGameEvent]);

  const onVictory = useCallback(async () => {
    await playGameEvent('victory');
  }, [playGameEvent]);

  const onPowerUp = useCallback(async (type: 'speed' | 'strength' | 'magic' = 'speed') => {
    const frequencyMap = {
      speed: 600,
      strength: 400,
      magic: 800
    };

    await playTemplate('power-up', {
      frequency: frequencyMap[type]
    });
  }, [playTemplate]);

  return {
    onCoinCollect,
    onLevelUp,
    onGameOver,
    onVictory,
    onPowerUp,
  };
}

/**
 * Dedicated hook for UI interaction sounds
 *
 * @example
 * ```typescript
 * function Button({ children, onClick }) {
 *   const { onButtonClick, onButtonHover } = useUIAudio();
 *
 *   return (
 *     <button
 *       onClick={() => { onButtonClick(); onClick?.(); }}
 *       onMouseEnter={onButtonHover}
 *     >
 *       {children}
 *     </button>
 *   );
 * }
 * ```
 */
export function useUIAudio() {
  const { playUIFeedback } = useAdvancedSound();

  const onButtonClick = useCallback(() => {
    playUIFeedback('click');
  }, [playUIFeedback]);

  const onButtonHover = useCallback(() => {
    playUIFeedback('hover');
  }, [playUIFeedback]);

  const onSuccess = useCallback(() => {
    playUIFeedback('success');
  }, [playUIFeedback]);

  const onError = useCallback(() => {
    playUIFeedback('error');
  }, [playUIFeedback]);

  return {
    onButtonClick,
    onButtonHover,
    onSuccess,
    onError,
  };
}

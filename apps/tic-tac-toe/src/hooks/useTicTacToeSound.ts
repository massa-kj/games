import { useCallback } from 'react';
import { useAdvancedSound } from '@core/hooks';

/**
 * Tic Tac Toe game-specific sound hook
 */
export function useTicTacToeSound() {
  const { playTone, playUIFeedback } = useAdvancedSound();

  // Cell click sound - different tones for X and O
  const playMoveSound = useCallback(async (player: 'X' | 'O') => {
    try {
      const frequency = player === 'X' ? 600 : 400; // Higher tone for X, lower for O
      await playTone(frequency, 0.2, { volume: 0.6 });
    } catch (error) {
      console.warn('Failed to play move sound:', error);
    }
  }, [playTone]);

  // Victory sound - celebration tone
  const playVictorySound = useCallback(async (player: 'X' | 'O') => {
    try {
      // Play a rising sequence of tones
      const baseFreq = player === 'X' ? 440 : 330;
      await playTone(baseFreq, 0.3, { volume: 0.7 });
      setTimeout(() => playTone(baseFreq * 1.25, 0.3, { volume: 0.7 }), 150);
      setTimeout(() => playTone(baseFreq * 1.5, 0.4, { volume: 0.8 }), 300);
    } catch (error) {
      console.warn('Failed to play victory sound:', error);
    }
  }, [playTone]);

  // Tie game sound - neutral tone
  const playTieSound = useCallback(async () => {
    try {
      // Play a sequence that doesn't resolve
      await playTone(440, 0.25, { volume: 0.6 });
      setTimeout(() => playTone(380, 0.25, { volume: 0.6 }), 125);
      setTimeout(() => playTone(410, 0.4, { volume: 0.5 }), 250);
    } catch (error) {
      console.warn('Failed to play tie sound:', error);
    }
  }, [playTone]);

  // Game reset sound - fresh start
  const playResetSound = useCallback(async () => {
    try {
      await playUIFeedback('click');
    } catch (error) {
      console.warn('Failed to play reset sound:', error);
    }
  }, [playUIFeedback]);

  // Button hover sound
  const playHoverSound = useCallback(async () => {
    try {
      await playUIFeedback('hover');
    } catch (error) {
      console.warn('Failed to play hover sound:', error);
    }
  }, [playUIFeedback]);

  // Error sound for invalid moves
  const playErrorSound = useCallback(async () => {
    try {
      await playUIFeedback('error');
    } catch (error) {
      console.warn('Failed to play error sound:', error);
    }
  }, [playUIFeedback]);

  return {
    playMoveSound,
    playVictorySound,
    playTieSound,
    playResetSound,
    playHoverSound,
    playErrorSound,
  };
}

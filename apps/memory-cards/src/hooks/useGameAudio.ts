import { useEffect } from 'react';
import { useSound } from '@core/hooks';
import { memoryCardSounds } from '@/audio/sounds';
import type { MemoryGameState } from '@/types';

/**
 * Custom hook to handle game audio based on state changes
 */
export function useGameAudio(state: MemoryGameState, prevState?: MemoryGameState) {
  const { play } = useSound(memoryCardSounds);

  // Play sound when game starts
  useEffect(() => {
    if (state.gameStarted && (!prevState || !prevState.gameStarted)) {
      play('shuffle');
    }
  }, [state.gameStarted, prevState?.gameStarted, play]);

  // Play sound when a match is made
  useEffect(() => {
    if (prevState && state.matches > prevState.matches) {
      play('correctMatch');
    }
  }, [state.matches, prevState?.matches, play]);

  // Play sound when cards don't match (when cards get reset)
  useEffect(() => {
    if (
      prevState &&
      prevState.firstCard &&
      prevState.secondCard &&
      prevState.isLocked &&
      !state.firstCard &&
      !state.secondCard &&
      !state.isLocked &&
      state.matches === prevState.matches // No new match was made
    ) {
      play('incorrectMatch');
    }
  }, [
    state.firstCard,
    state.secondCard,
    state.isLocked,
    state.matches,
    prevState?.firstCard,
    prevState?.secondCard,
    prevState?.isLocked,
    prevState?.matches,
    play,
  ]);

  // Play sound when level/game is completed
  useEffect(() => {
    if (state.justCleared) {
      play('gameComplete');
    }
  }, [state.justCleared, play]);

  return { play };
}

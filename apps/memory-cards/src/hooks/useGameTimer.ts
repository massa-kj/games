import { useCallback, useRef, useEffect } from 'react';
import { useSound } from '@core/hooks';
import { useGameTimer as useCoreGameTimer } from '@core/hooks';
import { memoryCardSounds } from '@/audio/sounds';

/**
 * Custom hook for game timer with audio feedback
 */
export function useGameTimer() {
  const timer = useCoreGameTimer({
    mode: 'countup',
    initialTime: 0
  });

  const tickCountRef = useRef(0);
  const { play } = useSound(memoryCardSounds);

  // Override the start timer to include tick counting
  const startTimer = useCallback(() => {
    if (!timer.isRunning) {
      timer.start();
      tickCountRef.current = 0;
    }
  }, [timer]);

  // Override the reset timer to reset tick count
  const resetTimer = useCallback(() => {
    timer.reset();
    tickCountRef.current = 0;
  }, [timer]);

  // Override the core timer's behavior to add sound feedback
  useEffect(() => {
    if (timer.isRunning) {
      const interval = setInterval(() => {
        tickCountRef.current += 1;
        // Play tick sound every 10 seconds for subtle audio feedback
        if (tickCountRef.current % 10 === 0) {
          play('timerTick');
        }
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [timer.isRunning, play]);

  return {
    ...timer,
    start: startTimer,
    reset: resetTimer
  };
}

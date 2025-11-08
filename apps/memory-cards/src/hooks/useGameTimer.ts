import { useState, useEffect, useCallback, useRef } from 'react';
import { useSound } from '@core/hooks';
import { memoryCardSounds } from '@/audio/sounds';

/**
 * Custom hook for game timer with audio feedback
 */
export function useGameTimer() {
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout>();
  const tickCountRef = useRef(0);
  const { play } = useSound(memoryCardSounds);

  const startTimer = useCallback(() => {
    if (!isRunning) {
      setIsRunning(true);
      tickCountRef.current = 0;
    }
  }, [isRunning]);

  const stopTimer = useCallback(() => {
    setIsRunning(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  }, []);

  const resetTimer = useCallback(() => {
    setTimeElapsed(0);
    setIsRunning(false);
    tickCountRef.current = 0;
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  }, []);

  // Timer logic
  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setTimeElapsed(prev => prev + 1);
        tickCountRef.current += 1;

        // Play tick sound every 10 seconds for subtle audio feedback
        if (tickCountRef.current % 10 === 0) {
          play('timerTick');
        }
      }, 1000);
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, play]);

  // Format time for display (MM:SS)
  const formatTime = useCallback((seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  }, []);

  return {
    timeElapsed,
    formattedTime: formatTime(timeElapsed),
    isRunning,
    startTimer,
    stopTimer,
    resetTimer,
  };
}

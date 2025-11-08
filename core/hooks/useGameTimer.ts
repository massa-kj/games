import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * Configuration options for the game timer hook
 */
export interface UseGameTimerOptions {
  /**
   * Initial time in seconds
   * - For countdown mode: time to count down from
   * - For countup mode: starting value (usually 0)
   * @default 60
   */
  initialTime?: number;

  /**
   * Timer mode
   * - 'countdown': counts down from initialTime to 0
   * - 'countup': counts up from initialTime
   * @default 'countdown'
   */
  mode?: 'countdown' | 'countup';

  /**
   * Callback function called when timer reaches 0 (countdown mode only)
   */
  onTimeUp?: () => void;

  /**
   * Whether to start the timer automatically when hook is initialized
   * @default false
   */
  autoStart?: boolean;

  /**
   * Interval for timer updates in milliseconds
   * @default 1000
   */
  interval?: number;
}

/**
 * Return type for the useGameTimer hook
 */
export interface UseGameTimerReturn {
  /** Current time value in seconds */
  timeValue: number;

  /** Whether the timer is currently running */
  isRunning: boolean;

  /** Start the timer */
  start: () => void;

  /** Pause the timer */
  pause: () => void;

  /** Reset the timer to initial state */
  reset: (newTime?: number) => void;

  /** Add or subtract time (positive for add, negative for subtract) */
  adjustTime: (seconds: number) => void;

  /** Formatted time string in MM:SS format */
  formattedTime: string;
}

/**
 * A flexible game timer hook that supports both countdown and countup modes
 *
 * @example Countdown timer (default behavior)
 * ```tsx
 * const timer = useGameTimer({
 *   initialTime: 120,
 *   onTimeUp: () => console.log('Time up!'),
 *   autoStart: true
 * });
 *
 * return <div>{timer.formattedTime}</div>;
 * ```
 *
 * @example Countup timer (elapsed time tracking)
 * ```tsx
 * const timer = useGameTimer({
 *   mode: 'countup',
 *   initialTime: 0,
 *   autoStart: true
 * });
 *
 * return <div>Elapsed: {timer.formattedTime}</div>;
 * ```
 */
export function useGameTimer({
  initialTime = 60,
  mode = 'countdown',
  onTimeUp,
  autoStart = false,
  interval = 1000
}: UseGameTimerOptions = {}): UseGameTimerReturn {
  const [timeValue, setTimeValue] = useState(initialTime);
  const [isRunning, setIsRunning] = useState(autoStart);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (isRunning) {
      intervalRef.current = setInterval(() => {
        setTimeValue(prev => {
          if (mode === 'countdown') {
            if (prev <= 1) {
              setIsRunning(false);
              onTimeUp?.();
              return 0;
            }
            return prev - 1;
          } else {
            // countup mode
            return prev + 1;
          }
        });
      }, interval);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, mode, onTimeUp, interval]);

  const start = useCallback(() => {
    setIsRunning(true);
  }, []);

  const pause = useCallback(() => {
    setIsRunning(false);
  }, []);

  const reset = useCallback((newTime?: number) => {
    setIsRunning(false);
    setTimeValue(newTime ?? initialTime);
  }, [initialTime]);

  const adjustTime = useCallback((seconds: number) => {
    setTimeValue(prev => Math.max(0, prev + seconds));
  }, []);

  // Format time as MM:SS
  const formattedTime = `${Math.floor(timeValue / 60)}:${(timeValue % 60).toString().padStart(2, '0')}`;

  return {
    timeValue,
    isRunning,
    start,
    pause,
    reset,
    adjustTime,
    formattedTime,
  };
}

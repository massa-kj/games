import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useGameTimer } from './useGameTimer';

// Mock timers
beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.runOnlyPendingTimers();
  vi.useRealTimers();
});

describe('useGameTimer', () => {
  describe('countdown mode (default)', () => {
    it('should initialize with correct default values', () => {
      const { result } = renderHook(() => useGameTimer());

      expect(result.current.timeValue).toBe(60);
      expect(result.current.isRunning).toBe(false);
      expect(result.current.formattedTime).toBe('1:00');
    });

    it('should initialize with custom initial time', () => {
      const { result } = renderHook(() => useGameTimer({ initialTime: 120 }));

      expect(result.current.timeValue).toBe(120);
      expect(result.current.formattedTime).toBe('2:00');
    });

    it('should auto-start when autoStart is true', () => {
      const { result } = renderHook(() => useGameTimer({ autoStart: true }));

      expect(result.current.isRunning).toBe(true);
    });

    it('should count down when started', () => {
      const { result } = renderHook(() => useGameTimer({ initialTime: 5 }));

      act(() => {
        result.current.start();
      });

      expect(result.current.isRunning).toBe(true);

      act(() => {
        vi.advanceTimersByTime(1000);
      });

      expect(result.current.timeValue).toBe(4);

      act(() => {
        vi.advanceTimersByTime(2000);
      });

      expect(result.current.timeValue).toBe(2);
    });

    it('should call onTimeUp when reaching 0', () => {
      const onTimeUp = vi.fn();
      const { result } = renderHook(() =>
        useGameTimer({ initialTime: 2, onTimeUp, autoStart: true })
      );

      act(() => {
        vi.advanceTimersByTime(2000);
      });

      expect(result.current.timeValue).toBe(0);
      expect(result.current.isRunning).toBe(false);
      expect(onTimeUp).toHaveBeenCalledTimes(1);
    });

    it('should pause and resume correctly', () => {
      const { result } = renderHook(() => useGameTimer({ initialTime: 10, autoStart: true }));

      act(() => {
        vi.advanceTimersByTime(2000);
      });
      expect(result.current.timeValue).toBe(8);

      act(() => {
        result.current.pause();
      });

      act(() => {
        vi.advanceTimersByTime(3000);
      });
      expect(result.current.timeValue).toBe(8); // Should not change when paused

      act(() => {
        result.current.start();
      });

      act(() => {
        vi.advanceTimersByTime(1000);
      });
      expect(result.current.timeValue).toBe(7);
    });

    it('should reset to initial time', () => {
      const { result } = renderHook(() => useGameTimer({ initialTime: 10, autoStart: true }));

      act(() => {
        vi.advanceTimersByTime(3000);
      });
      expect(result.current.timeValue).toBe(7);

      act(() => {
        result.current.reset();
      });

      expect(result.current.timeValue).toBe(10);
      expect(result.current.isRunning).toBe(false);
    });

    it('should reset to custom time', () => {
      const { result } = renderHook(() => useGameTimer({ initialTime: 10 }));

      act(() => {
        result.current.reset(30);
      });

      expect(result.current.timeValue).toBe(30);
    });

    it('should adjust time correctly', () => {
      const { result } = renderHook(() => useGameTimer({ initialTime: 10 }));

      act(() => {
        result.current.adjustTime(5);
      });
      expect(result.current.timeValue).toBe(15);

      act(() => {
        result.current.adjustTime(-3);
      });
      expect(result.current.timeValue).toBe(12);

      // Should not go below 0
      act(() => {
        result.current.adjustTime(-20);
      });
      expect(result.current.timeValue).toBe(0);
    });

    it('should format time correctly', () => {
      const { result } = renderHook(() => useGameTimer({ initialTime: 125 }));
      expect(result.current.formattedTime).toBe('2:05');

      const { result: result2 } = renderHook(() => useGameTimer({ initialTime: 9 }));
      expect(result2.current.formattedTime).toBe('0:09');

      const { result: result3 } = renderHook(() => useGameTimer({ initialTime: 3661 }));
      expect(result3.current.formattedTime).toBe('61:01');
    });
  });

  describe('countup mode', () => {
    it('should count up from initial time', () => {
      const { result } = renderHook(() =>
        useGameTimer({ mode: 'countup', initialTime: 0, autoStart: true })
      );

      expect(result.current.timeValue).toBe(0);

      act(() => {
        vi.advanceTimersByTime(3000);
      });

      expect(result.current.timeValue).toBe(3);
    });

    it('should not call onTimeUp in countup mode', () => {
      const onTimeUp = vi.fn();
      const { result } = renderHook(() =>
        useGameTimer({ mode: 'countup', initialTime: 0, onTimeUp, autoStart: true })
      );

      act(() => {
        vi.advanceTimersByTime(5000);
      });

      expect(result.current.timeValue).toBe(5);
      expect(onTimeUp).not.toHaveBeenCalled();
    });

    it('should continue running in countup mode', () => {
      const { result } = renderHook(() =>
        useGameTimer({ mode: 'countup', initialTime: 0, autoStart: true })
      );

      act(() => {
        vi.advanceTimersByTime(100000); // 100 seconds
      });

      expect(result.current.timeValue).toBe(100);
      expect(result.current.isRunning).toBe(true);
    });
  });

  describe('custom interval', () => {
    it('should use custom interval', () => {
      const { result } = renderHook(() =>
        useGameTimer({ initialTime: 10, interval: 500, autoStart: true })
      );

      act(() => {
        vi.advanceTimersByTime(1500); // 3 intervals of 500ms
      });

      expect(result.current.timeValue).toBe(7);
    });
  });
});

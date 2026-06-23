import { describe, expect, it } from 'vitest';
import {
  angleToClockTime,
  formatClockTime,
  getClockParts,
  normalizeClockTime,
  snapClockTime,
  timeToClockAngles,
} from './utils.js';

describe('clock utilities', () => {
  describe('normalizeClockTime', () => {
    it('normalizes within a 12-hour cycle by default', () => {
      expect(normalizeClockTime({ totalMinutes: 780 })).toEqual({ totalMinutes: 60 });
    });

    it('normalizes within a 24-hour cycle when requested', () => {
      expect(normalizeClockTime({ totalMinutes: 780 }, 24)).toEqual({ totalMinutes: 780 });
    });

    it('wraps negative values', () => {
      expect(normalizeClockTime({ totalMinutes: -5 })).toEqual({ totalMinutes: 715 });
    });
  });

  describe('snapClockTime', () => {
    it('snaps to the requested minute step', () => {
      expect(snapClockTime({ totalMinutes: 62 }, 5)).toEqual({ totalMinutes: 60 });
      expect(snapClockTime({ totalMinutes: 63 }, 5)).toEqual({ totalMinutes: 65 });
    });
  });

  describe('timeToClockAngles', () => {
    it('keeps hour and minute hands synchronized', () => {
      expect(timeToClockAngles({ totalMinutes: 210 })).toEqual({
        hourAngle: 105,
        minuteAngle: 180,
      });
    });
  });

  describe('getClockParts', () => {
    it('uses 12 for the top of a 12-hour clock', () => {
      expect(getClockParts({ totalMinutes: 0 })).toEqual({
        totalMinutes: 0,
        hour: 0,
        displayHour: 12,
        minute: 0,
      });
    });
  });

  describe('formatClockTime', () => {
    it('formats 12-hour clock time for an analog face', () => {
      expect(formatClockTime({ totalMinutes: 0 })).toBe('12:00');
      expect(formatClockTime({ totalMinutes: 210 })).toBe('3:30');
    });

    it('formats 24-hour time without losing AM or PM', () => {
      expect(formatClockTime({ totalMinutes: 0 }, 24)).toBe('0:00');
      expect(formatClockTime({ totalMinutes: 780 }, 24)).toBe('13:00');
    });
  });

  describe('angleToClockTime', () => {
    it('moves the minute hand while keeping the hands synchronized', () => {
      expect(angleToClockTime(210, {
        hand: 'minute',
        current: { totalMinutes: 200 },
      })).toEqual({ totalMinutes: 215 });
    });

    it('moves across the hour when the minute hand crosses 12', () => {
      expect(angleToClockTime(30, {
        hand: 'minute',
        current: { totalMinutes: 235 },
      })).toEqual({ totalMinutes: 245 });
    });

    it('keeps the current minute for hour hand dragging by default', () => {
      expect(angleToClockTime(120, {
        hand: 'hour',
        current: { totalMinutes: 200 },
      })).toEqual({ totalMinutes: 260 });
    });

    it('can snap hour hand dragging to exact hours', () => {
      expect(angleToClockTime(120, {
        hand: 'hour',
        current: { totalMinutes: 200 },
        hourDragMode: 'snapToHour',
      })).toEqual({ totalMinutes: 240 });
    });

    it('keeps the closest 12-hour face match in a 24-hour cycle', () => {
      expect(angleToClockTime(0, {
        hand: 'hour',
        current: { totalMinutes: 700 },
        cycle: 24,
        hourDragMode: 'snapToHour',
      })).toEqual({ totalMinutes: 720 });
    });
  });
});

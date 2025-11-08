import { describe, it, expect } from 'vitest';
import {
  noteToFrequency,
  durationToSeconds,
  midiNoteToFrequency,
  frequencyToNote,
  clamp,
  lerp,
  dbToGain,
  gainToDb
} from './utils';

describe('Audio Utils', () => {
  describe('noteToFrequency', () => {
    it('should convert A4 to 440Hz', () => {
      expect(noteToFrequency('A4')).toBeCloseTo(440, 2);
    });

    it('should convert C4 to approximately 261.63Hz', () => {
      expect(noteToFrequency('C4')).toBeCloseTo(261.63, 1);
    });

    it('should handle sharp notes', () => {
      expect(noteToFrequency('A#4')).toBeCloseTo(466.16, 1);
      expect(noteToFrequency('C#5')).toBeCloseTo(554.37, 1);
    });

    it('should handle flat notes', () => {
      expect(noteToFrequency('Bb4')).toBeCloseTo(466.16, 1);
      expect(noteToFrequency('Db5')).toBeCloseTo(554.37, 1);
    });

    it('should handle different octaves', () => {
      expect(noteToFrequency('A0')).toBeCloseTo(27.5, 1);
      expect(noteToFrequency('A8')).toBeCloseTo(7040, 0);
    });

    it('should throw error for invalid note format', () => {
      expect(() => noteToFrequency('X4')).toThrow('Invalid note format');
      expect(() => noteToFrequency('A')).toThrow('Invalid note format');
      expect(() => noteToFrequency('A10')).toThrow('Invalid note format');
    });
  });

  describe('durationToSeconds', () => {
    it('should convert note durations at 120 BPM', () => {
      expect(durationToSeconds('4n', 120)).toBeCloseTo(0.5, 3); // Quarter note
      expect(durationToSeconds('8n', 120)).toBeCloseTo(0.25, 3); // Eighth note
      expect(durationToSeconds('2n', 120)).toBeCloseTo(1, 3); // Half note
      expect(durationToSeconds('1n', 120)).toBeCloseTo(2, 3); // Whole note
    });

    it('should handle different BPMs', () => {
      expect(durationToSeconds('4n', 60)).toBeCloseTo(1, 3); // Slower
      expect(durationToSeconds('4n', 240)).toBeCloseTo(0.25, 3); // Faster
    });

    it('should return numeric durations as-is', () => {
      expect(durationToSeconds(1.5)).toBe(1.5);
      expect(durationToSeconds(0.25)).toBe(0.25);
    });

    it('should throw error for invalid duration', () => {
      expect(() => durationToSeconds('invalid' as any)).toThrow('Unknown note duration');
    });

    it('should throw error for invalid BPM', () => {
      expect(() => durationToSeconds('4n', 0)).toThrow('Invalid BPM');
      expect(() => durationToSeconds('4n', -60)).toThrow('Invalid BPM');
    });
  });

  describe('midiNoteToFrequency', () => {
    it('should convert MIDI note 69 (A4) to 440Hz', () => {
      expect(midiNoteToFrequency(69)).toBeCloseTo(440, 2);
    });

    it('should convert MIDI note 60 (C4) to ~261.63Hz', () => {
      expect(midiNoteToFrequency(60)).toBeCloseTo(261.63, 1);
    });

    it('should throw error for out-of-range MIDI notes', () => {
      expect(() => midiNoteToFrequency(20)).toThrow('MIDI note out of range');
      expect(() => midiNoteToFrequency(109)).toThrow('MIDI note out of range');
    });
  });

  describe('frequencyToNote', () => {
    it('should convert 440Hz to A4', () => {
      const result = frequencyToNote(440);
      expect(result.note).toBe('A4');
      expect(result.octave).toBe(4);
      expect(result.frequency).toBeCloseTo(440, 1);
    });

    it('should convert ~261.63Hz to C4', () => {
      const result = frequencyToNote(261.63);
      expect(result.note).toBe('C4');
      expect(result.octave).toBe(4);
    });

    it('should handle frequencies between notes', () => {
      const result = frequencyToNote(450); // Between A4 and A#4
      expect(result.note).toBe('A4'); // Should round to nearest
      expect(Math.abs(result.cents)).toBeGreaterThan(0); // Should show deviation
    });

    it('should throw error for invalid frequency', () => {
      expect(() => frequencyToNote(0)).toThrow('Invalid frequency');
      expect(() => frequencyToNote(-100)).toThrow('Invalid frequency');
    });
  });

  describe('utility functions', () => {
    describe('clamp', () => {
      it('should clamp values within range', () => {
        expect(clamp(5, 0, 10)).toBe(5);
        expect(clamp(-1, 0, 10)).toBe(0);
        expect(clamp(15, 0, 10)).toBe(10);
      });
    });

    describe('lerp', () => {
      it('should interpolate between values', () => {
        expect(lerp(0, 10, 0.5)).toBe(5);
        expect(lerp(10, 20, 0.25)).toBe(12.5);
        expect(lerp(0, 10, 0)).toBe(0);
        expect(lerp(0, 10, 1)).toBe(10);
      });

      it('should clamp interpolation factor', () => {
        expect(lerp(0, 10, -0.5)).toBe(0);
        expect(lerp(0, 10, 1.5)).toBe(10);
      });
    });

    describe('dbToGain and gainToDb', () => {
      it('should convert between decibels and linear gain', () => {
        expect(dbToGain(0)).toBeCloseTo(1, 3);
        expect(dbToGain(-6)).toBeCloseTo(0.501, 2);
        expect(dbToGain(-20)).toBeCloseTo(0.1, 3);
      });

      it('should be inverse operations', () => {
        const gain = 0.5;
        const db = gainToDb(gain);
        expect(dbToGain(db)).toBeCloseTo(gain, 3);
      });
    });
  });
});

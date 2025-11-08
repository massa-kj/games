/**
 * Audio utility functions for musical note and timing conversions
 */

import type { NoteDuration } from './types.js';

/**
 * Musical note names mapped to semitone offsets from A4 (440Hz)
 */
const NOTE_FREQUENCIES: Record<string, number> = {
  'C': -9,
  'C#': -8, 'DB': -8,
  'D': -7,
  'D#': -6, 'EB': -6,
  'E': -5,
  'F': -4,
  'F#': -3, 'GB': -3,
  'G': -2,
  'G#': -1, 'AB': -1,
  'A': 0,
  'A#': 1, 'BB': 1,
  'B': 2
};

/**
 * Note duration values mapped to beat multipliers
 */
const NOTE_DURATIONS: Record<string, number> = {
  '1n': 4,     // Whole note
  '2n': 2,     // Half note
  '4n': 1,     // Quarter note
  '8n': 0.5,   // Eighth note
  '16n': 0.25, // Sixteenth note
  '32n': 0.125 // Thirty-second note
};

/**
 * Convert musical note notation to frequency in Hz
 *
 * @param note Musical note in format like 'C4', 'A#5', 'Bb3'
 * @returns Frequency in Hz
 *
 * @example
 * ```typescript
 * noteToFrequency('A4') // Returns 440
 * noteToFrequency('C4') // Returns ~261.63
 * noteToFrequency('A#5') // Returns ~932.33
 * ```
 */
export function noteToFrequency(note: string): number {
  const match = note.match(/^([A-G][#B]?)(\d)$/i);
  if (!match) {
    throw new Error(`Invalid note format: ${note}. Expected format like 'C4', 'A#5', 'Bb3'`);
  }

  const [, noteName, octaveStr] = match;
  const normalizedNote = noteName.toUpperCase();
  const octave = parseInt(octaveStr, 10);

  if (!(normalizedNote in NOTE_FREQUENCIES)) {
    throw new Error(`Unknown note name: ${noteName}`);
  }

  if (octave < 0 || octave > 9) {
    throw new Error(`Octave out of range: ${octave}. Expected 0-9`);
  }

  // Calculate semitones from A4
  const semitoneOffset = NOTE_FREQUENCIES[normalizedNote];
  const octaveOffset = (octave - 4) * 12;
  const totalSemitones = semitoneOffset + octaveOffset;

  // Convert to frequency using equal temperament
  return 440 * Math.pow(2, totalSemitones / 12);
}

/**
 * Convert note duration or numeric value to seconds
 *
 * @param duration Note duration ('4n', '8n', etc.) or number of seconds
 * @param bpm Beats per minute for tempo calculation
 * @returns Duration in seconds
 *
 * @example
 * ```typescript
 * durationToSeconds('4n', 120) // Returns 0.5 (quarter note at 120 BPM)
 * durationToSeconds('8n', 140) // Returns ~0.21 (eighth note at 140 BPM)
 * durationToSeconds(1.5) // Returns 1.5 (direct seconds)
 * ```
 */
export function durationToSeconds(duration: NoteDuration, bpm: number = 120): number {
  if (typeof duration === 'number') {
    return duration;
  }

  if (!(duration in NOTE_DURATIONS)) {
    throw new Error(`Unknown note duration: ${duration}. Expected values like '4n', '8n', '16n'`);
  }

  if (bpm <= 0) {
    throw new Error(`Invalid BPM: ${bpm}. Must be greater than 0`);
  }

  const beatDuration = 60 / bpm; // Duration of quarter note in seconds
  const noteDurationMultiplier = NOTE_DURATIONS[duration];

  return beatDuration * noteDurationMultiplier;
}

/**
 * Get the frequency for a given MIDI note number
 *
 * @param midiNote MIDI note number (21-108, with 69 = A4 = 440Hz)
 * @returns Frequency in Hz
 */
export function midiNoteToFrequency(midiNote: number): number {
  if (midiNote < 21 || midiNote > 108) {
    throw new Error(`MIDI note out of range: ${midiNote}. Expected 21-108`);
  }

  return 440 * Math.pow(2, (midiNote - 69) / 12);
}

/**
 * Convert frequency to the nearest musical note name
 *
 * @param frequency Frequency in Hz
 * @returns Object with note name, octave, and exact frequency
 */
export function frequencyToNote(frequency: number): {
  note: string;
  octave: number;
  frequency: number;
  cents: number;
} {
  if (frequency <= 0) {
    throw new Error(`Invalid frequency: ${frequency}. Must be greater than 0`);
  }

  // Calculate MIDI note number
  const midiNote = Math.round(69 + 12 * Math.log2(frequency / 440));

  // Convert back to note name
  const noteNames = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
  const noteName = noteNames[midiNote % 12];
  const octave = Math.floor(midiNote / 12) - 1;

  // Calculate exact frequency and deviation
  const exactFrequency = midiNoteToFrequency(midiNote);
  const cents = 1200 * Math.log2(frequency / exactFrequency);

  return {
    note: `${noteName}${octave}`,
    octave,
    frequency: exactFrequency,
    cents: Math.round(cents)
  };
}

/**
 * Clamp a value between minimum and maximum bounds
 *
 * @param value Value to clamp
 * @param min Minimum bound
 * @param max Maximum bound
 * @returns Clamped value
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

/**
 * Linear interpolation between two values
 *
 * @param start Start value
 * @param end End value
 * @param t Interpolation factor (0-1)
 * @returns Interpolated value
 */
export function lerp(start: number, end: number, t: number): number {
  return start + (end - start) * clamp(t, 0, 1);
}

/**
 * Convert decibels to linear gain
 *
 * @param db Decibel value
 * @returns Linear gain value
 */
export function dbToGain(db: number): number {
  return Math.pow(10, db / 20);
}

/**
 * Convert linear gain to decibels
 *
 * @param gain Linear gain value
 * @returns Decibel value
 */
export function gainToDb(gain: number): number {
  return 20 * Math.log10(Math.max(gain, Number.EPSILON));
}

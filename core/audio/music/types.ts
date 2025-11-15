/**
 * Core music theory types and interfaces for melody composition
 */

import type { WaveType, EnvelopeConfig, FilterConfig } from '../types.js';

/** Supported musical note names */
export type NoteName = 'C' | 'C#' | 'D' | 'D#' | 'E' | 'F' | 'F#' | 'G' | 'G#' | 'A' | 'A#' | 'B';

/** Alternative flat notation support */
export type FlatNoteName = 'C' | 'Db' | 'D' | 'Eb' | 'E' | 'F' | 'Gb' | 'G' | 'Ab' | 'A' | 'Bb' | 'B';

/** Musical scale types */
export type ScaleType = 'major' | 'pentatonic' | 'chromatic' | 'minor' | 'blues';

/** Octave range for melody maker */
export type OctaveRange = 3 | 4 | 5 | 6;

/** Complete note identifier with octave */
export interface NoteIdentifier {
  name: NoteName;
  octave: OctaveRange;
  /** Alternative flat notation */
  flatName?: FlatNoteName;
}

/** Color mapping for individual notes */
export interface NoteColor {
  note: NoteName;
  hue: number;        // 0-360 degrees on HSL color wheel
  saturation: number; // 0-100%
  lightness: number;  // 0-100%
  cssValue: string;   // Pre-computed CSS color value
}

/** Musical scale definition */
export interface Scale {
  name: ScaleType;
  intervals: number[];     // Semitone intervals from root
  noteNames: NoteName[];   // Notes in this scale for C major
  description: string;     // Human-readable description
}

/** Instrument preset definition */
export interface InstrumentPreset {
  id: string;
  name: string;
  displayName: string;     // For i18n key
  type: WaveType;          // From existing audio system
  envelope: EnvelopeConfig; // From existing audio system
  filter?: FilterConfig;    // From existing audio system
  icon?: string;           // Optional icon identifier
}

/** Color scheme types */
export type ColorScheme = 'hsl-wheel' | 'pastel' | 'high-contrast';

/** Available color schemes mapping */
export type ColorSchemeMap = {
  [K in ColorScheme]: NoteColor[];
};

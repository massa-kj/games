/**
 * Composition-related type definitions for Melody Maker
 */

import type { NoteDuration } from '@core/audio';
import type { NoteIdentifier, ScaleType, NoteName, OctaveRange, ColorScheme } from '@core/audio/music';

/** Individual note in a composition */
export interface CompositionNote {
  id: string;              // Unique identifier
  note: NoteIdentifier;
  duration: NoteDuration;
  velocity: number;        // 0-1
  position: number;        // Position in sequence (0-based, in subdivisions)
  tie?: boolean;          // Tied to next note
}

/** Rest/silence in composition */
export interface CompositionRest {
  id: string;
  type: 'rest';
  duration: NoteDuration;
  position: number;
}

/** Union type for sequence elements */
export type SequenceElement = CompositionNote | CompositionRest;

/** Complete composition data */
export interface Composition {
  id: string;
  name: string;
  createdAt: Date;
  modifiedAt: Date;

  // Musical properties
  sequence: SequenceElement[];
  tempo: number;           // BPM, default 120
  timeSignature: {
    numerator: number;     // Default 4
    denominator: number;   // Default 4
  };
  key: {
    root: NoteName;        // Default 'C'
    scale: ScaleType;      // Default 'major'
  };

  // Playback settings
  instrument: string;      // Instrument preset ID
  volume: number;          // 0-1, default 0.8
  loop: boolean;          // Default false

  // Metadata
  tags: string[];
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  isTemplate?: boolean;    // Built-in template compositions
}

/** Composition metadata for listing */
export interface CompositionMeta {
  id: string;
  name: string;
  createdAt: Date;
  modifiedAt: Date;
  duration: number;        // Calculated duration in seconds
  noteCount: number;       // Number of notes (excluding rests)
  difficulty?: 'beginner' | 'intermediate' | 'advanced';
  tags: string[];
}

/** Settings for the melody maker */
export interface MelodyMakerSettings {
  defaultTempo: number;
  defaultInstrument: string;
  defaultScale: ScaleType;
  defaultOctave: OctaveRange;
  colorScheme: ColorScheme;
  gridSize: 'compact' | 'normal' | 'large';
  autoPlay: boolean;       // Auto-play notes when placed
  showNoteNames: boolean;  // Show note names on blocks
  enableAdvancedFeatures: boolean; // Show tempo, key changes, etc.
}

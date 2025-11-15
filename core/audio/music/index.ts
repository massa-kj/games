/**
 * Core music system exports
 */

// Types
export type {
  NoteName,
  FlatNoteName,
  ScaleType,
  OctaveRange,
  NoteIdentifier,
  NoteColor,
  Scale,
  InstrumentPreset,
  ColorScheme,
  ColorSchemeMap
} from './types.js';

// Constants and mappings
export {
  NOTE_COLOR_MAP,
  COLOR_SCHEMES,
  SCALES,
  getNoteColor,
  getColorScheme,
  getScaleNotes
} from './colorMapping.js';

// Utilities
export {
  noteIdentifierToString,
  parseNoteString,
  validateMelody,
  transposeMelody,
  getMelodyDuration,
  filterNotesToScale,
  generateNoteRange
} from './melodyUtils.js';

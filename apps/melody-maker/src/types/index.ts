/**
 * Type definitions index for Melody Maker
 */

// Re-export composition types
export type {
  CompositionNote,
  CompositionRest,
  SequenceElement,
  Composition,
  CompositionMeta,
  MelodyMakerSettings
} from './composition.js';

// Re-export UI types
export type {
  NoteBlockProps,
  BlockSequencerProps,
  NotePaletteProps,
  PlaybackControlsProps
} from './ui.js';

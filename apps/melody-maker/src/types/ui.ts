/**
 * UI component interfaces for Melody Maker
 */

import type { NoteDuration } from '@core/audio';
import type { NoteIdentifier, NoteColor, ScaleType, OctaveRange, ColorScheme } from '@core/audio/music';
import type { CompositionNote } from './composition.js';

/** Props for individual note blocks */
export interface NoteBlockProps {
  note: NoteIdentifier;
  duration: NoteDuration;
  velocity?: number;       // 0-1, default 0.8
  color: NoteColor;
  size: 'sm' | 'md' | 'lg';
  isPlaying?: boolean;
  isSelected?: boolean;
  isDragging?: boolean;
  className?: string;

  // Event handlers
  onPlay?: () => void;
  onSelect?: () => void;
  onDragStart?: (e: DragEvent) => void;
  onDragEnd?: (e: DragEvent) => void;
  onClick?: () => void;
}

/** Props for the block sequencer */
export interface BlockSequencerProps {
  sequence: CompositionNote[];
  maxBars: number;         // Default: 2
  beatsPerBar: number;     // Default: 4
  subdivisions: number;    // Default: 4 (16th notes)
  playheadPosition?: number; // Current playback position (0-1)
  isPlaying?: boolean;

  // Layout
  orientation?: 'horizontal' | 'vertical';
  gridSize?: 'compact' | 'normal' | 'large';

  // Event handlers
  onSequenceChange: (sequence: CompositionNote[]) => void;
  onNoteClick?: (note: CompositionNote, index: number) => void;
  onPositionClick?: (position: number) => void;

  // Visual options
  showGrid?: boolean;
  showBarLines?: boolean;
  showBeatNumbers?: boolean;
}

/** Props for note palette */
export interface NotePaletteProps {
  scale: ScaleType;
  octave: OctaveRange;
  colorScheme: ColorScheme;
  availableNotes: NoteIdentifier[];
  selectedNote?: NoteIdentifier;

  // Layout
  layout: 'grid' | 'keyboard' | 'vertical';
  size: 'sm' | 'md' | 'lg';

  // Event handlers
  onNoteSelect: (note: NoteIdentifier) => void;
  onNotePlay: (note: NoteIdentifier) => void;
}

/** Playback control props */
export interface PlaybackControlsProps {
  isPlaying: boolean;
  isPaused: boolean;
  canPlay: boolean;        // Has notes to play
  progress: number;        // 0-1
  duration: number;        // Total duration in seconds

  // Controls
  onPlay: () => void;
  onPause: () => void;
  onStop: () => void;
  onSeek?: (position: number) => void;

  // Visual options
  showProgress?: boolean;
  showDuration?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

/**
 * Color mapping and scale definitions for musical notes
 */

import type { NoteName, NoteColor, Scale, ScaleType, ColorScheme, ColorSchemeMap } from './types.js';

/** HSL color wheel mapping for 12 semitones */
export const NOTE_COLOR_MAP: NoteColor[] = [
  { note: 'C',  hue: 0,   saturation: 85, lightness: 65, cssValue: 'hsl(0, 85%, 65%)' },
  { note: 'C#', hue: 30,  saturation: 80, lightness: 60, cssValue: 'hsl(30, 80%, 60%)' },
  { note: 'D',  hue: 60,  saturation: 70, lightness: 65, cssValue: 'hsl(60, 70%, 65%)' },
  { note: 'D#', hue: 90,  saturation: 75, lightness: 60, cssValue: 'hsl(90, 75%, 60%)' },
  { note: 'E',  hue: 120, saturation: 75, lightness: 65, cssValue: 'hsl(120, 75%, 65%)' },
  { note: 'F',  hue: 150, saturation: 65, lightness: 70, cssValue: 'hsl(150, 65%, 70%)' },
  { note: 'F#', hue: 180, saturation: 85, lightness: 55, cssValue: 'hsl(180, 85%, 55%)' },
  { note: 'G',  hue: 210, saturation: 90, lightness: 65, cssValue: 'hsl(210, 90%, 65%)' },
  { note: 'G#', hue: 240, saturation: 70, lightness: 60, cssValue: 'hsl(240, 70%, 60%)' },
  { note: 'A',  hue: 270, saturation: 80, lightness: 75, cssValue: 'hsl(270, 80%, 75%)' },
  { note: 'A#', hue: 300, saturation: 75, lightness: 65, cssValue: 'hsl(300, 75%, 65%)' },
  { note: 'B',  hue: 330, saturation: 60, lightness: 75, cssValue: 'hsl(330, 60%, 75%)' },
];

/** Alternative color schemes */
export const COLOR_SCHEMES: ColorSchemeMap = {
  'hsl-wheel': NOTE_COLOR_MAP,
  'pastel': NOTE_COLOR_MAP.map(color => ({
    ...color,
    saturation: 60,
    lightness: 75,
    cssValue: `hsl(${color.hue}, 60%, 75%)`
  })),
  'high-contrast': NOTE_COLOR_MAP.map(color => ({
    ...color,
    saturation: 100,
    lightness: color.hue % 60 < 30 ? 30 : 70, // Alternate light/dark
    cssValue: `hsl(${color.hue}, 100%, ${color.hue % 60 < 30 ? 30 : 70}%)`
  }))
};

/** Scale definitions */
export const SCALES: Record<ScaleType, Scale> = {
  major: {
    name: 'major',
    intervals: [0, 2, 4, 5, 7, 9, 11],
    noteNames: ['C', 'D', 'E', 'F', 'G', 'A', 'B'],
    description: 'Major scale (do-re-mi-fa-sol-la-ti)'
  },
  pentatonic: {
    name: 'pentatonic',
    intervals: [0, 2, 4, 7, 9],
    noteNames: ['C', 'D', 'E', 'G', 'A'],
    description: 'Pentatonic scale (5 notes)'
  },
  chromatic: {
    name: 'chromatic',
    intervals: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
    noteNames: ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'],
    description: 'All 12 semitones'
  },
  minor: {
    name: 'minor',
    intervals: [0, 2, 3, 5, 7, 8, 10],
    noteNames: ['C', 'D', 'D#', 'F', 'G', 'G#', 'A#'],
    description: 'Natural minor scale'
  },
  blues: {
    name: 'blues',
    intervals: [0, 3, 5, 6, 7, 10],
    noteNames: ['C', 'D#', 'F', 'F#', 'G', 'A#'],
    description: 'Blues scale with blue notes'
  }
};

/**
 * Get color for a specific note
 * @param note - The note name to get color for
 * @param scheme - Color scheme to use (default: 'hsl-wheel')
 * @returns NoteColor object for the note
 */
export function getNoteColor(note: NoteName, scheme: ColorScheme = 'hsl-wheel'): NoteColor {
  const colors = COLOR_SCHEMES[scheme];
  return colors.find(c => c.note === note) || colors[0];
}

/**
 * Get all colors for a specific color scheme
 * @param scheme - Color scheme to use
 * @returns Array of NoteColor objects
 */
export function getColorScheme(scheme: ColorScheme): NoteColor[] {
  return COLOR_SCHEMES[scheme];
}

/**
 * Get notes for a specific scale
 * @param scale - Scale type to get notes for
 * @param root - Root note (default: 'C')
 * @returns Array of note names in the scale
 */
export function getScaleNotes(scale: ScaleType, root: NoteName = 'C'): NoteName[] {
  const scaleData = SCALES[scale];
  const rootIndex = NOTE_COLOR_MAP.findIndex(c => c.note === root);

  return scaleData.intervals.map(interval => {
    const noteIndex = (rootIndex + interval) % 12;
    return NOTE_COLOR_MAP[noteIndex].note;
  });
}

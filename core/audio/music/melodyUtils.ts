/**
 * Utility functions for melody manipulation and validation
 */

import type { MelodyDefinition, MelodyNote } from '../types.js';
import type { NoteName, NoteIdentifier, OctaveRange, ScaleType } from './types.js';
import { NOTE_COLOR_MAP, getScaleNotes } from './colorMapping.js';

/**
 * Convert a note identifier to a full note string (e.g., 'C4')
 * @param note - Note identifier with name and octave
 * @returns Full note string
 */
export function noteIdentifierToString(note: NoteIdentifier): string {
  return `${note.name}${note.octave}`;
}

/**
 * Parse a note string into a note identifier
 * @param noteString - Note string like 'C4', 'A#5'
 * @returns NoteIdentifier object
 */
export function parseNoteString(noteString: string): NoteIdentifier {
  const match = noteString.match(/^([A-G][#b]?)([3-6])$/);
  if (!match) {
    throw new Error(`Invalid note string: ${noteString}`);
  }

  const [, noteName, octaveStr] = match;
  const name = noteName.replace('b', '#') as NoteName; // Convert flat to sharp
  const octave = parseInt(octaveStr) as OctaveRange;

  return { name, octave };
}

/**
 * Validate if a melody definition is structurally correct
 * @param melody - Melody definition to validate
 * @returns True if valid, false otherwise
 */
export function validateMelody(melody: MelodyDefinition): boolean {
  try {
    // Check if notes array exists and is not empty
    if (!melody.notes || !Array.isArray(melody.notes) || melody.notes.length === 0) {
      return false;
    }

    // Validate each note
    for (const note of melody.notes) {
      if (note.note !== 'rest') {
        // Try to parse the note string
        parseNoteString(note.note);
      }

      // Check duration is valid
      if (!['1n', '2n', '4n', '8n', '16n', '32n'].includes(note.duration as string) &&
          typeof note.duration !== 'number') {
        return false;
      }

      // Check velocity if present
      if (note.velocity !== undefined && (note.velocity < 0 || note.velocity > 1)) {
        return false;
      }
    }

    // Check BPM if present
    if (melody.bpm !== undefined && (melody.bpm < 60 || melody.bpm > 200)) {
      return false;
    }

    return true;
  } catch {
    return false;
  }
}

/**
 * Transpose a melody by a number of semitones
 * @param melody - Original melody definition
 * @param semitones - Number of semitones to transpose (positive = up, negative = down)
 * @returns New transposed melody definition
 */
export function transposeMelody(melody: MelodyDefinition, semitones: number): MelodyDefinition {
  const transposedNotes: MelodyNote[] = melody.notes.map(note => {
    if (note.note === 'rest') {
      return note; // Rests don't change
    }

    try {
      const noteId = parseNoteString(note.note);
      const currentIndex = NOTE_COLOR_MAP.findIndex(c => c.note === noteId.name);
      const newIndex = (currentIndex + semitones + 12) % 12;
      const newNoteName = NOTE_COLOR_MAP[newIndex].note;

      return {
        ...note,
        note: `${newNoteName}${noteId.octave}`
      };
    } catch {
      return note; // Return unchanged if parsing fails
    }
  });

  return {
    ...melody,
    notes: transposedNotes
  };
}

/**
 * Calculate the total duration of a melody in seconds
 * @param melody - Melody definition
 * @returns Duration in seconds
 */
export function getMelodyDuration(melody: MelodyDefinition): number {
  const bpm = melody.bpm || 120;
  const beatDuration = 60 / bpm; // Duration of one quarter note in seconds

  const totalBeats = melody.notes.reduce((total, note) => {
    let duration: number;

    if (typeof note.duration === 'number') {
      duration = note.duration;
    } else {
      // Convert note duration to beats
      const durationMap: Record<string, number> = {
        '1n': 4,    // Whole note = 4 beats
        '2n': 2,    // Half note = 2 beats
        '4n': 1,    // Quarter note = 1 beat
        '8n': 0.5,  // Eighth note = 0.5 beats
        '16n': 0.25, // Sixteenth note = 0.25 beats
        '32n': 0.125 // Thirty-second note = 0.125 beats
      };
      duration = durationMap[note.duration] || 1;
    }

    return total + duration;
  }, 0);

  return totalBeats * beatDuration;
}

/**
 * Filter notes to match a specific scale
 * @param notes - Array of note identifiers
 * @param scale - Scale type to filter by
 * @param root - Root note of the scale
 * @returns Filtered array of notes that belong to the scale
 */
export function filterNotesToScale(
  notes: NoteIdentifier[],
  scale: ScaleType,
  root: NoteName = 'C'
): NoteIdentifier[] {
  const scaleNotes = getScaleNotes(scale, root);
  return notes.filter(note => scaleNotes.includes(note.name));
}

/**
 * Generate a range of note identifiers for a given octave range
 * @param startOctave - Starting octave
 * @param endOctave - Ending octave (inclusive)
 * @param scale - Optional scale to filter notes (default: chromatic)
 * @returns Array of note identifiers
 */
export function generateNoteRange(
  startOctave: OctaveRange,
  endOctave: OctaveRange,
  scale: ScaleType = 'chromatic'
): NoteIdentifier[] {
  const notes: NoteIdentifier[] = [];
  const scaleNotes = getScaleNotes(scale);

  for (let octave = startOctave; octave <= endOctave; octave++) {
    for (const noteName of scaleNotes) {
      notes.push({ name: noteName, octave: octave as OctaveRange });
    }
  }

  return notes;
}

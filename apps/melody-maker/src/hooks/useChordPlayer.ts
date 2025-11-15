/**
 * Chord-enabled Note Player Hook
 * Supports simultaneous note playback for harmony
 */

import { useCallback, useRef, useState, useEffect } from 'react';
import type { NoteIdentifier } from '@core/audio/music';
import { chordPlayer, type ChordNote } from '@core/audio/chordPlayer';

export interface ChordPlayerHook {
  startNote: (note: NoteIdentifier, velocity?: number) => Promise<void>;
  stopNote: (note: NoteIdentifier) => void;
  playChord: (notes: ChordNote[], duration?: number) => Promise<void>;
  stopAllNotes: () => void;
  activeNotes: string[];
}

/**
 * Hook for chord-enabled note playing with multi-touch support
 */
export function useChordPlayer(): ChordPlayerHook {
  const [activeNotes, setActiveNotes] = useState<string[]>([]);
  const updateIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Update active notes display periodically
  useEffect(() => {
    updateIntervalRef.current = setInterval(() => {
      setActiveNotes(chordPlayer.getActiveNotes());
    }, 100);

    return () => {
      if (updateIntervalRef.current) {
        clearInterval(updateIntervalRef.current);
      }
    };
  }, []);

  const startNote = useCallback(async (note: NoteIdentifier, velocity: number = 0.8) => {
    try {
      await chordPlayer.startNote(note, velocity);
      setActiveNotes(chordPlayer.getActiveNotes());
    } catch (error) {
      console.error('Failed to start note:', note, error);
    }
  }, []);

  const stopNote = useCallback((note: NoteIdentifier) => {
    try {
      chordPlayer.stopNote(note);
      setActiveNotes(chordPlayer.getActiveNotes());
    } catch (error) {
      console.error('Failed to stop note:', note, error);
    }
  }, []);

  const playChord = useCallback(async (notes: ChordNote[], duration: number = 2000) => {
    try {
      await chordPlayer.playChord(notes, { duration });
      setActiveNotes(chordPlayer.getActiveNotes());
    } catch (error) {
      console.error('Failed to play chord:', notes, error);
    }
  }, []);

  const stopAllNotes = useCallback(() => {
    try {
      chordPlayer.stopAllNotes();
      setActiveNotes([]);
    } catch (error) {
      console.error('Failed to stop all notes:', error);
    }
  }, []);

  return {
    startNote,
    stopNote,
    playChord,
    stopAllNotes,
    activeNotes
  };
}

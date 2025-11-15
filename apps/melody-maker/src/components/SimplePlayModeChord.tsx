/**
 * Simple Play Mode - Child-friendly music interface with chord support
 *
 * Features:
 * - Large, colorful note buttons for easy tapping
 * - Multi-touch support for chord playing
 * - Simple visual feedback
 * - Minimal UI complexity
 * - Focus on immediate sound feedback
 */

import { useCallback, useState, useRef } from 'react';
import type { NoteIdentifier } from '@core/audio/music';
import { getNoteColor } from '@core/audio/music/colorMapping';
import { useChordPlayer } from '../hooks/useChordPlayer';
import { useAccessibility } from './AccessibilityEnhancements';
import { useL10n } from '@/locales';

/**
 * Large note button for child-friendly interaction with chord support
 */
interface ChordNoteButtonProps {
  note: NoteIdentifier;
  color: string;
  onNoteStart: (note: NoteIdentifier) => void;
  onNoteStop: (note: NoteIdentifier) => void;
  isActive?: boolean;
}

function ChordNoteButton({ note, color, onNoteStart, onNoteStop, isActive = false }: ChordNoteButtonProps) {
  const { settings } = useAccessibility();
  const [isPressed, setIsPressed] = useState(false);
  const touchStartRef = useRef<number>(0);

  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    setIsPressed(true);
    touchStartRef.current = Date.now();
    onNoteStart(note);
  }, [note, onNoteStart]);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    e.preventDefault();
    setIsPressed(false);
    onNoteStop(note);
  }, [note, onNoteStop]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsPressed(true);
    touchStartRef.current = Date.now();
    onNoteStart(note);
  }, [note, onNoteStart]);

  const handleMouseUp = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsPressed(false);
    onNoteStop(note);
  }, [note, onNoteStop]);

  const handleMouseLeave = useCallback((e: React.MouseEvent) => {
    if (isPressed) {
      e.preventDefault();
      setIsPressed(false);
      onNoteStop(note);
    }
  }, [isPressed, note, onNoteStop]);

  const baseClasses = `
    w-20 h-20 md:w-24 md:h-24 lg:w-28 lg:h-28
    rounded-2xl shadow-lg border-4 border-white
    flex items-center justify-center
    font-bold text-xl md:text-2xl lg:text-3xl text-white
    transition-all duration-200 ease-out
    select-none cursor-pointer
    focus:outline-none focus:ring-4 focus:ring-blue-300
    ${(isPressed || isActive) ? 'scale-95 brightness-110' : 'hover:scale-105'}
    ${settings.reducedMotion ? '' : 'hover:transform hover:rotate-3'}
  `;

  return (
    <button
      className={baseClasses}
      style={{
        backgroundColor: color,
        boxShadow: (isPressed || isActive)
          ? `0 4px 20px ${color}60, inset 0 0 20px rgba(255,255,255,0.3)`
          : `0 8px 25px ${color}40`
      }}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchEnd}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
      aria-label={`Play note ${note.name} ${note.octave}`}
      aria-pressed={isPressed || isActive}
    >
      {note.name}
    </button>
  );
}

/**
 * Simple Play Mode Component with Chord Support
 */
export function SimplePlayMode() {
  const { t } = useL10n();
  const { startNote, stopNote, stopAllNotes, activeNotes } = useChordPlayer();
  const { announceForScreenReader, settings } = useAccessibility();

  // Notes for child-friendly octave range
  const availableNotes: NoteIdentifier[] = [
    { name: 'C', octave: 4 },
    { name: 'D', octave: 4 },
    { name: 'E', octave: 4 },
    { name: 'F', octave: 4 },
    { name: 'G', octave: 4 },
    { name: 'A', octave: 4 },
    { name: 'B', octave: 4 },
    { name: 'C', octave: 5 },
  ];

  const handleNoteStart = useCallback(async (note: NoteIdentifier) => {
    // Start playing the note
    await startNote(note, 0.8);

    // Accessibility announcement
    if (settings.audioDescriptions) {
      announceForScreenReader(`Playing note ${note.name}`);
    }
  }, [startNote, announceForScreenReader, settings.audioDescriptions]);

  const handleNoteStop = useCallback((note: NoteIdentifier) => {
    stopNote(note);
  }, [stopNote]);

  const handleClearAll = useCallback(() => {
    stopAllNotes();
    if (settings.audioDescriptions) {
      announceForScreenReader('Stopped all notes');
    }
  }, [stopAllNotes, announceForScreenReader, settings.audioDescriptions]);

  const createNoteKey = (note: NoteIdentifier) => `${note.name}${note.octave}`;

  return (
    <div className="simple-play-mode">
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-3xl md:text-4xl text-gray-800 mb-4">
          🎵 {t('playMusic')} 🎵
        </h2>
      </div>

      {/* Note Grid */}
      <div className="flex flex-wrap justify-center items-center max-w-4xl mx-auto">
        {availableNotes.map((note) => {
          const noteKey = createNoteKey(note);
          const isActive = activeNotes.includes(noteKey);
          const noteColor = getNoteColor(note.name);

          return (
            <ChordNoteButton
              key={noteKey}
              note={note}
              color={noteColor.cssValue}
              onNoteStart={handleNoteStart}
              onNoteStop={handleNoteStop}
              isActive={isActive}
            />
          );
        })}
      </div>

      {/* Instructions */}
      <div className="text-center mt-12">
        <div className="text-6xl mb-4 animate-bounce">🎶</div>
      </div>

    </div>
  );
}

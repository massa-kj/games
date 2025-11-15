/**
 * Simple Play Mode - Child-friendly music interface
 *
 * Features:
 * - Large, colorful note buttons for easy tapping
 * - Simple visual feedback
 * - Minimal UI complexity
 * - Focus on immediate sound feedback
 */

import { useCallback, useState } from 'react';
import type { NoteIdentifier } from '@core/audio/music';
import { getNoteColor } from '@core/audio/music/colorMapping';
import { useNotePlayer } from '../hooks/useNotePlayer';
import { useAccessibility } from './AccessibilityEnhancements';
import { useL10n } from '@/locales';

/**
 * Large note button for child-friendly interaction
 */
interface SimpleNoteButtonProps {
  note: NoteIdentifier;
  color: string;
  onPlay: (note: NoteIdentifier) => void;
  isPressed?: boolean;
}

function SimpleNoteButton({ note, color, onPlay, isPressed = false }: SimpleNoteButtonProps) {
  const { settings } = useAccessibility();

  const handleClick = useCallback(() => {
    onPlay(note);
  }, [note, onPlay]);

  const baseClasses = `
    w-20 h-20 md:w-24 md:h-24 lg:w-28 lg:h-28
    rounded-2xl shadow-lg border-4 border-white
    flex items-center justify-center
    font-bold text-xl md:text-2xl lg:text-3xl text-white
    transition-all duration-200 ease-out
    active:scale-95 hover:scale-105
    focus:outline-none focus:ring-4 focus:ring-blue-300
    ${isPressed ? 'scale-95 brightness-110' : ''}
    ${settings.reducedMotion ? '' : 'hover:transform hover:rotate-3'}
  `;

  return (
    <button
      className={baseClasses}
      style={{
        backgroundColor: color,
        boxShadow: isPressed
          ? `0 4px 20px ${color}60, inset 0 0 20px rgba(255,255,255,0.3)`
          : `0 8px 25px ${color}40`
      }}
      onClick={handleClick}
      aria-label={`Play note ${note.name} ${note.octave}`}
    >
      {note.name}
    </button>
  );
}

/**
 * Simple Play Mode Component
 */
export function SimplePlayMode() {
  const { t } = useL10n();
  const { playNote } = useNotePlayer();
  const { announceForScreenReader, settings } = useAccessibility();
  const [pressedNote, setPressedNote] = useState<string | null>(null);

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

  const handleNotePlay = useCallback(async (note: NoteIdentifier) => {
    const noteKey = `${note.name}${note.octave}`;

    // Visual feedback
    setPressedNote(noteKey);
    setTimeout(() => setPressedNote(null), 200);

    // Audio feedback
    await playNote(note, 1000, 0.8); // Longer duration for child enjoyment

    // Accessibility announcement
    if (settings.audioDescriptions) {
      announceForScreenReader(`Playing note ${note.name}`);
    }
  }, [playNote, announceForScreenReader, settings.audioDescriptions]);

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
          const noteKey = `${note.name}${note.octave}`;
          const isPressed = pressedNote === noteKey;
          const noteColor = getNoteColor(note.name); // Use default color scheme

          return (
            <SimpleNoteButton
              key={noteKey}
              note={note}
              color={noteColor.cssValue}
              onPlay={handleNotePlay}
              isPressed={isPressed}
            />
          );
        })}
      </div>

      {/* Fun encouragement */}
      <div className="text-center mt-12">
        <div className="text-6xl mb-4 animate-bounce">🎶</div>
      </div>
    </div>
  );
}

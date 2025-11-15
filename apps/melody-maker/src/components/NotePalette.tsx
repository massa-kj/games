/**
 * NotePalette - Note selection palette component
 */

import React, { useMemo, useState } from 'react';
import { getNoteColor, getScaleNotes } from '@core/audio/music';
import { NoteBlock } from './NoteBlock';
import type { NotePaletteProps } from '../types/ui.js';

/**
 * NotePalette component provides a selectable palette of musical notes
 *
 * Features:
 * - Scale-based note filtering (major, pentatonic, chromatic, etc.)
 * - Multiple layout options (grid, keyboard, vertical)
 * - Color scheme support (hsl-wheel, pastel, high-contrast)
 * - Responsive sizing (sm/md/lg)
 * - Note selection and preview playback
 */
export const NotePalette: React.FC<NotePaletteProps> = ({
  scale,
  octave,
  colorScheme = 'hsl-wheel',
  availableNotes,
  selectedNote,
  layout = 'grid',
  size = 'md',
  onNoteSelect,
  onNotePlay,
}) => {
  const [hoveredNote, setHoveredNote] = useState<string | null>(null);

  // Generate notes based on scale and octave
  const paletteNotes = useMemo(() => {
    // Use availableNotes if provided, otherwise generate from scale
    if (availableNotes.length > 0) {
      return availableNotes;
    }

    // Generate notes for the specified scale and octave
    const scaleNotes = getScaleNotes(scale);
    return scaleNotes.map(noteName => ({
      name: noteName,
      octave
    }));
  }, [availableNotes, scale, octave]);

  // Get colors for notes based on color scheme
  const noteColors = useMemo(() => {
    return paletteNotes.map(note => ({
      note,
      color: getNoteColor(note.name, colorScheme)
    }));
  }, [paletteNotes, colorScheme]);

  // Handle note selection
  const handleNoteSelect = (note: typeof paletteNotes[0]) => {
    onNoteSelect(note);
    setHoveredNote(null);
  };

  // Handle note preview
  const handleNotePlay = (note: typeof paletteNotes[0]) => {
    onNotePlay(note);
  };

  // Generate layout classes
  const layoutClasses = {
    grid: 'grid grid-cols-4 gap-2 justify-items-center',
    keyboard: 'flex flex-wrap justify-center gap-1',
    vertical: 'flex flex-col gap-2 items-center'
  };

  // Size-based container classes
  const containerSizeClasses = {
    sm: 'p-2',
    md: 'p-4',
    lg: 'p-6'
  };

  // Scale display name mapping for i18n
  const scaleDisplayNames = {
    major: 'Major (Do-Re-Mi)',
    pentatonic: 'Pentatonic',
    chromatic: 'Chromatic',
    minor: 'Minor',
    blues: 'Blues'
  };

  const containerClasses = `
    bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200
    ${containerSizeClasses[size]}
  `;

  return (
    <div className={containerClasses}>
      {/* Header */}
      <div className="text-center mb-4">
        <h3 className="text-lg font-semibold text-gray-700 mb-1">
          Note Palette
        </h3>
        <p className="text-sm text-gray-500">
          {scaleDisplayNames[scale]} - Octave {octave}
        </p>
      </div>

      {/* Note Grid */}
      <div className={layoutClasses[layout]}>
        {noteColors.map(({ note, color }) => {
          const noteId = `${note.name}${note.octave}`;
          const isSelected = selectedNote &&
            selectedNote.name === note.name &&
            selectedNote.octave === note.octave;
          const isHovered = hoveredNote === noteId;

          return (
            <div
              key={noteId}
              className="transition-all duration-200"
              onMouseEnter={() => setHoveredNote(noteId)}
              onMouseLeave={() => setHoveredNote(null)}
            >
              <NoteBlock
                note={note}
                duration="4n"
                color={color}
                size={size}
                isSelected={isSelected}
                isDragging={false}
                className={`
                  cursor-pointer
                  ${isHovered ? 'transform scale-110 shadow-lg' : ''}
                  ${isSelected ? 'ring-2 ring-blue-400 ring-offset-2' : ''}
                `}
                onPlay={() => handleNotePlay(note)}
                onClick={() => handleNoteSelect(note)}
                onDragStart={(e) => {
                  // Set drag data for sequencer
                  e.dataTransfer?.setData('application/json', JSON.stringify({
                    note,
                    duration: '4n',
                    velocity: 0.8,
                    color,
                    source: 'palette'
                  }));
                }}
              />

              {/* Note name label for accessibility */}
              <div className="text-xs text-center mt-1 text-gray-600 font-medium">
                {note.name}
              </div>
            </div>
          );
        })}
      </div>

      {/* Scale selector (future enhancement) */}
      {size === 'lg' && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="text-xs text-gray-500 text-center">
            Drag notes to the sequencer to compose
          </div>
        </div>
      )}
    </div>
  );
};

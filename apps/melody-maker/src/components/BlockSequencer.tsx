/**
 * BlockSequencer - Enhanced composition sequencer with animations
 */

import React, { useCallback, useMemo, useState } from 'react';
import { getNoteColor } from '@core/audio/music';
import { NoteBlock } from './NoteBlock';
import type { BlockSequencerProps } from '../types/ui.js';
import type { CompositionNote } from '../types/composition.js';

/**
 * BlockSequencer component provides an enhanced composition grid
 *
 * Features:
 * - 2-bar composition grid with beat subdivisions
 * - Smooth drag & drop with visual feedback
 * - Animated playback with glowing effects
 * - Enhanced bar and beat markers
 * - Responsive grid sizing with transitions
 */
export const BlockSequencer: React.FC<BlockSequencerProps> = ({
  sequence,
  maxBars = 2,
  beatsPerBar = 4,
  subdivisions = 4,
  playheadPosition = 0,
  isPlaying = false,
  orientation = 'horizontal',
  gridSize = 'normal',
  onSequenceChange,
  onNoteClick,
  onPositionClick,
  showGrid = true,
  showBarLines = true,
  showBeatNumbers = true,
}) => {
  const [dragOverPosition, setDragOverPosition] = useState<number | null>(null);

  // Calculate total grid positions
  const totalPositions = maxBars * beatsPerBar * subdivisions;

  // Grid size classes
  const gridSizeClasses = {
    compact: { cellSize: 'w-8 h-8', gap: 'gap-1', text: 'text-xs' },
    normal: { cellSize: 'w-12 h-12', gap: 'gap-2', text: 'text-sm' },
    large: { cellSize: 'w-16 h-16', gap: 'gap-3', text: 'text-base' }
  };

  const sizeConfig = gridSizeClasses[gridSize];

  // Create position map for existing notes
  const positionMap = useMemo(() => {
    const map = new Map<number, CompositionNote>();
    sequence.forEach(note => {
      map.set(note.position, note);
    });
    return map;
  }, [sequence]);

  // Handle drop events with smooth animation
  const handleDrop = useCallback((e: React.DragEvent, position: number) => {
    e.preventDefault();
    setDragOverPosition(null);

    try {
      const dragData = JSON.parse(e.dataTransfer.getData('application/json'));

      // Create new composition note
      const newNote: CompositionNote = {
        id: `note_${Date.now()}_${Math.random()}`,
        note: dragData.note,
        duration: dragData.duration || '4n',
        velocity: dragData.velocity || 0.8,
        position: position,
      };

      // Update sequence
      const updatedSequence = [...sequence];

      // Remove any existing note at this position
      const existingIndex = updatedSequence.findIndex(n => n.position === position);
      if (existingIndex >= 0) {
        updatedSequence.splice(existingIndex, 1);
      }

      // Add new note
      updatedSequence.push(newNote);

      // Sort by position
      updatedSequence.sort((a, b) => a.position - b.position);

      onSequenceChange(updatedSequence);
    } catch (error) {
      console.error('Failed to handle drop:', error);
    }
  }, [sequence, onSequenceChange]);

  // Handle drag over with enhanced visual feedback
  const handleDragOver = useCallback((e: React.DragEvent, position: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
    setDragOverPosition(position);
  }, []);

  // Handle drag leave
  const handleDragLeave = useCallback(() => {
    setDragOverPosition(null);
  }, []);

  // Handle note removal
  const handleNoteRemove = useCallback((note: CompositionNote) => {
    const updatedSequence = sequence.filter(n => n.id !== note.id);
    onSequenceChange(updatedSequence);
  }, [sequence, onSequenceChange]);

  // Generate grid cells
  const gridCells = useMemo(() => {
    const cells = [];

    for (let position = 0; position < totalPositions; position++) {
      const bar = Math.floor(position / (beatsPerBar * subdivisions));
      const beat = Math.floor((position % (beatsPerBar * subdivisions)) / subdivisions);
      const subdivision = position % subdivisions;

      const existingNote = positionMap.get(position);
      const isPlayheadPosition = Math.floor(playheadPosition * totalPositions) === position;
      const isDragOver = dragOverPosition === position;
      const isBarStart = position % (beatsPerBar * subdivisions) === 0;
      const isBeatStart = subdivision === 0;

      cells.push({
        position,
        bar,
        beat,
        subdivision,
        existingNote,
        isPlayheadPosition,
        isDragOver,
        isBarStart,
        isBeatStart
      });
    }

    return cells;
  }, [totalPositions, beatsPerBar, subdivisions, positionMap, playheadPosition, dragOverPosition]);

  // Layout classes - use CSS custom properties for dynamic columns
  const containerStyle = orientation === 'horizontal'
    ? {
        display: 'grid',
        gridTemplateColumns: `repeat(${maxBars * beatsPerBar * subdivisions}, minmax(0, 1fr))`,
        gap: gridSize === 'compact' ? '0.25rem' : gridSize === 'large' ? '0.75rem' : '0.5rem'
      }
    : {
        display: 'grid',
        gridTemplateRows: `repeat(${maxBars * beatsPerBar * subdivisions}, minmax(0, 1fr))`,
        gap: gridSize === 'compact' ? '0.25rem' : gridSize === 'large' ? '0.75rem' : '0.5rem'
      };

  const sequencerClasses = `
    bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200 p-6
    melody-maker-transition
    ${orientation === 'horizontal' ? 'overflow-x-auto' : 'overflow-y-auto'}
  `;

  return (
    <div className={sequencerClasses}>
      {/* Header with fade-in animation */}
      <div className="flex justify-between items-center mb-4" style={{ animation: 'fadeInUp 0.5s ease-out' }}>
        <h3 className="text-lg font-semibold text-gray-700">
          Composition Sequencer
        </h3>
        <div className="text-sm text-gray-500">
          {maxBars} bars × {beatsPerBar} beats
        </div>
      </div>

      {/* Beat numbers with staggered animation */}
      {showBeatNumbers && (
        <div
          className="mb-2"
          style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${maxBars * beatsPerBar}, minmax(0, 1fr))`,
            gap: gridSize === 'compact' ? '0.25rem' : gridSize === 'large' ? '0.75rem' : '0.5rem'
          }}
        >
          {Array.from({ length: maxBars * beatsPerBar }, (_, i) => (
            <div
              key={i}
              className={`text-center ${sizeConfig.text} text-gray-400 font-medium melody-maker-transition`}
              style={{
                animation: `fadeInUp 0.3s ease-out ${i * 0.05}s both`
              }}
            >
              {Math.floor(i / beatsPerBar) + 1}.{(i % beatsPerBar) + 1}
            </div>
          ))}
        </div>
      )}

      {/* Main sequencer grid with enhanced animations */}
      <div
        style={{
          ...containerStyle,
          minHeight: sizeConfig.cellSize.split(' ')[1],
          animation: 'fadeInUp 0.6s ease-out 0.2s both'
        }}
      >
        {gridCells.map(({
          position,
          existingNote,
          isPlayheadPosition,
          isDragOver,
          isBarStart,
          isBeatStart
        }) => (
          <div
            key={position}
            className={`
              relative ${sizeConfig.cellSize}
              border border-gray-200 rounded-lg
              melody-maker-transition
              ${showGrid ? 'bg-gray-50' : 'bg-transparent'}
              ${isBarStart && showBarLines ? 'border-l-4 border-l-blue-400' : ''}
              ${isBeatStart ? 'border-l-2 border-l-gray-300' : ''}
              ${isDragOver ? 'drop-zone-active scale-105 shadow-lg' : ''}
              ${isPlayheadPosition && isPlaying ? 'bg-yellow-200 border-yellow-400 shadow-md' : ''}
              hover:bg-blue-50 hover:shadow-sm cursor-pointer melody-maker-glow
            `}
            onClick={() => onPositionClick?.(position)}
            onDrop={(e) => handleDrop(e, position)}
            onDragOver={(e) => handleDragOver(e, position)}
            onDragLeave={handleDragLeave}
          >
            {/* Existing note with enhanced presentation */}
            {existingNote && (
              <div className="absolute inset-0 p-1">
                <NoteBlock
                  note={existingNote.note}
                  duration={existingNote.duration}
                  color={getNoteColor(existingNote.note.name)}
                  size={gridSize === 'compact' ? 'sm' : gridSize === 'large' ? 'lg' : 'md'}
                  velocity={existingNote.velocity}
                  isPlaying={isPlayheadPosition && isPlaying}
                  className="w-full h-full drag-preview"
                  onPlay={() => onNoteClick?.(existingNote, position)}
                  onClick={() => onNoteClick?.(existingNote, position)}
                  onDragStart={() => {
                    // Allow repositioning existing notes
                    setTimeout(() => handleNoteRemove(existingNote), 0);
                  }}
                />
              </div>
            )}

            {/* Enhanced playhead indicator */}
            {isPlayheadPosition && isPlaying && (
              <div
                className="absolute top-0 left-1/2 transform -translate-x-1/2 w-1 h-full bg-gradient-to-b from-red-400 to-red-600 z-20 rounded-full shadow-lg"
                style={{
                  animation: 'pulse 0.8s ease-in-out infinite',
                  boxShadow: '0 0 12px rgba(239, 68, 68, 0.8)'
                }}
              />
            )}

            {/* Multi-layered glow effects for active notes */}
            {existingNote && isPlayheadPosition && isPlaying && (
              <>
                {/* Primary glow effect */}
                <div
                  className="absolute inset-0 bg-gradient-to-r from-yellow-300/40 via-orange-300/40 to-red-300/40 rounded-lg pointer-events-none z-10"
                  style={{
                    animation: 'noteGlow 0.6s ease-in-out',
                    boxShadow: '0 0 20px rgba(251, 191, 36, 0.5), inset 0 0 20px rgba(251, 191, 36, 0.2)'
                  }}
                />
                {/* Secondary pulse effect */}
                <div
                  className="absolute inset-0 bg-yellow-200/20 rounded-lg pointer-events-none z-10"
                  style={{
                    animation: 'notePulse 0.8s ease-in-out infinite'
                  }}
                />
                {/* Tertiary shimmer effect */}
                <div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent rounded-lg pointer-events-none z-10"
                  style={{
                    animation: 'smoothSlide 0.8s ease-in-out infinite'
                  }}
                />
              </>
            )}

            {/* Enhanced position indicator for empty cells */}
            {!existingNote && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className={`w-2 h-2 rounded-full bg-gray-300 opacity-50 melody-maker-transition hover:opacity-70 hover:scale-110 ${sizeConfig.text}`} />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Instructions with fade-in */}
      <div
        className="mt-4 text-center text-sm text-gray-500"
        style={{ animation: 'fadeInUp 0.7s ease-out 0.3s both' }}
      >
        Drag notes from the palette above to compose your melody
      </div>
    </div>
  );
};

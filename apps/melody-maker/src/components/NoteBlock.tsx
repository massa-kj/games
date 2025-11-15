/**
 * NoteBlock - Individual draggable note block component
 */

import React, { useCallback } from 'react';
import { useSound } from '@core/hooks';
import { noteIdentifierToString } from '@core/audio/music';
import { melodyMakerSounds } from '../audio/sounds';
import type { NoteBlockProps } from '../types/ui.js';

/**
 * NoteBlock component renders an individual note as a draggable colored block
 *
 * Features:
 * - Color-coded based on HSL color wheel mapping
 * - Draggable interface for composition
 * - Click to preview note sound
 * - Visual feedback for playing/selected states
 * - Responsive sizing (sm/md/lg)
 */
export const NoteBlock: React.FC<NoteBlockProps> = ({
  note,
  duration,
  velocity = 0.8,
  color,
  size = 'md',
  isPlaying = false,
  isSelected = false,
  isDragging = false,
  className = '',
  onPlay,
  onSelect,
  onDragStart,
  onDragEnd,
  onClick,
}) => {
  const { play } = useSound(melodyMakerSounds);

    // Handle note preview playback
  const handlePlay = useCallback(async () => {
    try {
      const noteString = noteIdentifierToString(note);

      // Play a note using the melody maker sound system
      // For now, we'll use a simple approach - in a full implementation,
      // we would dynamically create a tone with the correct frequency
      await play('notePreview', {
        volume: velocity,
      });

      console.log(`Playing note: ${noteString}`);
      onPlay?.();
    } catch (error) {
      console.error('Failed to play note:', error);
    }
  }, [note, velocity, play, onPlay]);

  // Handle click events
  const handleClick = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    handlePlay();
    onSelect?.();
    onClick?.();
  }, [handlePlay, onSelect, onClick]);

  // Handle drag start
  const handleDragStart = useCallback((e: React.DragEvent) => {
    e.dataTransfer.setData('application/json', JSON.stringify({
      note,
      duration,
      velocity,
      color
    }));

    // Set drag effect
    e.dataTransfer.effectAllowed = 'copy';

    onDragStart?.(e.nativeEvent);
  }, [note, duration, velocity, color, onDragStart]);

  // Handle drag end
  const handleDragEnd = useCallback((e: React.DragEvent) => {
    onDragEnd?.(e.nativeEvent);
  }, [onDragEnd]);

  // Generate CSS classes
  const sizeClasses = {
    sm: 'w-12 h-9 text-xs',
    md: 'w-16 h-12 text-sm',
    lg: 'w-20 h-15 text-base'
  };

  const baseClasses = `
    inline-flex items-center justify-center
    rounded-2xl border-2 border-opacity-30
    cursor-pointer select-none
    transition-all duration-200 ease-out
    font-semibold text-white
    shadow-lg hover:shadow-xl
    transform hover:scale-105
    ${sizeClasses[size]}
    ${isPlaying ? 'animate-pulse scale-110 shadow-2xl' : ''}
    ${isSelected ? 'ring-4 ring-white ring-opacity-50' : ''}
    ${isDragging ? 'opacity-50 scale-95' : ''}
    ${className}
  `;

  // Generate inline styles with note color
  const style: React.CSSProperties = {
    backgroundColor: color.cssValue,
    borderColor: `hsl(${color.hue}, ${color.saturation}%, ${Math.max(color.lightness - 20, 10)}%)`,
    // Add a subtle gradient for depth
    backgroundImage: `linear-gradient(135deg,
      hsl(${color.hue}, ${color.saturation}%, ${color.lightness + 10}%) 0%,
      ${color.cssValue} 50%,
      hsl(${color.hue}, ${color.saturation}%, ${Math.max(color.lightness - 10, 20)}%) 100%)`
  };

  // Format note display text
  const noteText = note.name + (size !== 'sm' ? note.octave : '');
  const durationText = size === 'lg' ? ` ${duration}` : '';

  return (
    <div
      className={baseClasses}
      style={style}
      draggable
      onClick={handleClick}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      role="button"
      tabIndex={0}
      aria-label={`Note ${noteText}, duration ${duration}`}
      title={`${noteText} (${duration})`}
    >
      <span className="drop-shadow-sm">
        {noteText}
        {durationText}
      </span>
    </div>
  );
};

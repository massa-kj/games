/**
 * RestBlock - Component for representing musical rests/silences
 */

import React from 'react';
import type { NoteDuration } from './DurationSelector';

/**
 * Rest/silence symbols for different durations
 */
const REST_SYMBOLS = {
  '1n': '𝄻',   // Whole rest
  '2n': '𝄼',   // Half rest
  '4n': '𝄽',   // Quarter rest
  '8n': '𝄾',   // Eighth rest
  '16n': '𝄿',  // Sixteenth rest
} as const;

/**
 * Props for RestBlock component
 */
interface RestBlockProps {
  duration: string;
  size?: 'sm' | 'md' | 'lg';
  isSelected?: boolean;
  isPlaying?: boolean;
  className?: string;
  onClick?: () => void;
  onDoubleClick?: () => void;
  onContextMenu?: (e: React.MouseEvent) => void;
  onDragStart?: (e: React.DragEvent) => void;
  draggable?: boolean;
}

/**
 * RestBlock component for displaying musical rests
 */
export const RestBlock: React.FC<RestBlockProps> = ({
  duration,
  size = 'md',
  isSelected = false,
  isPlaying = false,
  className = '',
  onClick,
  onDoubleClick,
  onContextMenu,
  onDragStart,
  draggable = false,
}) => {
  const sizeClasses = {
    sm: 'w-6 h-6 text-sm',
    md: 'w-8 h-8 text-base',
    lg: 'w-10 h-10 text-lg',
  };

  const restSymbol = REST_SYMBOLS[duration as keyof typeof REST_SYMBOLS] || REST_SYMBOLS['4n'];

  const handleDragStart = (e: React.DragEvent) => {
    // Set drag data for rest
    const dragData = {
      type: 'rest',
      duration,
    };
    e.dataTransfer.setData('application/json', JSON.stringify(dragData));
    e.dataTransfer.effectAllowed = 'copy';

    onDragStart?.(e);
  };

  return (
    <div
      className={`
        ${sizeClasses[size]}
        border-2 rounded-lg transition-all duration-200
        flex items-center justify-center
        cursor-pointer select-none
        bg-gradient-to-br from-gray-100 to-gray-200
        ${isSelected ? 'border-purple-500 shadow-md scale-105' : 'border-gray-300'}
        ${isPlaying ? 'bg-yellow-200 border-yellow-400 animate-pulse' : ''}
        hover:border-purple-400 hover:shadow-sm hover:scale-105
        active:scale-95
        ${className}
      `}
      onClick={onClick}
      onDoubleClick={onDoubleClick}
      onContextMenu={onContextMenu}
      onDragStart={handleDragStart}
      draggable={draggable}
      title={`${duration} rest`}
      role="button"
      tabIndex={0}
      aria-label={`${duration} rest`}
    >
      <span
        className="font-bold text-gray-600"
        style={{ fontSize: '1.2em' }}
      >
        {restSymbol}
      </span>
    </div>
  );
};

/**
 * RestPalette - Palette of selectable rests
 */
interface RestPaletteProps {
  onRestSelect: (duration: string) => void;
  selectedRest?: string;
  className?: string;
}

export const RestPalette: React.FC<RestPaletteProps> = ({
  onRestSelect,
  selectedRest,
  className = '',
}) => {
  const restDurations = ['1n', '2n', '4n', '8n', '16n'] as const;

  return (
    <div className={`bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200 p-4 ${className}`}>
      <h3 className="text-lg font-semibold text-gray-700 mb-3">Rests & Silences</h3>

      <div className="grid grid-cols-5 gap-2">
        {restDurations.map((duration) => (
          <RestBlock
            key={duration}
            duration={duration}
            size="md"
            isSelected={selectedRest === duration}
            onClick={() => onRestSelect(duration)}
            draggable={true}
            className="hover:bg-gradient-to-br hover:from-purple-100 hover:to-purple-200"
          />
        ))}
      </div>

      {/* Rest duration labels */}
      <div className="grid grid-cols-5 gap-2 mt-2">
        <div className="text-xs text-center text-gray-500">Whole</div>
        <div className="text-xs text-center text-gray-500">Half</div>
        <div className="text-xs text-center text-gray-500">Quarter</div>
        <div className="text-xs text-center text-gray-500">Eighth</div>
        <div className="text-xs text-center text-gray-500">16th</div>
      </div>

      <div className="mt-3 text-sm text-gray-600 text-center">
        Drag rests to the sequencer to add silence
      </div>
    </div>
  );
};

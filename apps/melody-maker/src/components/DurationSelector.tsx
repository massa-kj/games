/**
 * DurationSelector - Component for selecting note durations
 */

import React from 'react';

/**
 * Available note durations with their display info
 */
export const NOTE_DURATIONS = [
  { value: '1n', label: 'Whole', symbol: '♩', beats: 4 },
  { value: '2n', label: 'Half', symbol: '♪', beats: 2 },
  { value: '4n', label: 'Quarter', symbol: '♫', beats: 1 },
  { value: '8n', label: 'Eighth', symbol: '♬', beats: 0.5 },
  { value: '16n', label: 'Sixteenth', symbol: '♭', beats: 0.25 },
] as const;

export type NoteDuration = typeof NOTE_DURATIONS[number]['value'];

/**
 * Props for DurationSelector component
 */
interface DurationSelectorProps {
  selectedDuration: string;
  onDurationChange: (duration: string) => void;
  size?: 'sm' | 'md' | 'lg';
  orientation?: 'horizontal' | 'vertical';
  showLabels?: boolean;
  showBeats?: boolean;
  className?: string;
}

/**
 * DurationSelector component for selecting note durations
 */
export const DurationSelector: React.FC<DurationSelectorProps> = ({
  selectedDuration,
  onDurationChange,
  size = 'md',
  orientation = 'horizontal',
  showLabels = true,
  showBeats = false,
  className = '',
}) => {
  const sizeClasses = {
    sm: 'text-xs p-1',
    md: 'text-sm p-2',
    lg: 'text-base p-3',
  };

  const buttonSize = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
  };

  const containerClasses = orientation === 'horizontal'
    ? 'flex flex-row gap-2'
    : 'flex flex-col gap-2';

  return (
    <div className={`${containerClasses} ${className}`}>
      {NOTE_DURATIONS.map((duration) => {
        const isSelected = selectedDuration === duration.value;

        return (
          <button
            key={duration.value}
            onClick={() => onDurationChange(duration.value)}
            className={`
              ${buttonSize[size]} ${sizeClasses[size]}
              border-2 rounded-lg transition-all duration-200
              flex flex-col items-center justify-center
              hover:scale-105 hover:shadow-md
              ${isSelected
                ? 'border-blue-500 bg-blue-100 text-blue-800 shadow-md'
                : 'border-gray-300 bg-white text-gray-700 hover:border-blue-300'
              }
            `}
            title={`${duration.label} note (${duration.beats} ${duration.beats === 1 ? 'beat' : 'beats'})`}
            aria-label={`Select ${duration.label} note duration`}
          >
            <div className="text-lg font-bold">{duration.symbol}</div>
            {showLabels && size !== 'sm' && (
              <div className="text-xs mt-1">{duration.label}</div>
            )}
            {showBeats && size === 'lg' && (
              <div className="text-xs opacity-70">{duration.beats}♪</div>
            )}
          </button>
        );
      })}
    </div>
  );
};

/**
 * Inline duration editor that appears on note hover/selection
 */
interface InlineDurationEditorProps {
  note: { duration: string };
  onDurationChange: (newDuration: string) => void;
  position: { x: number; y: number };
  isVisible: boolean;
  onClose: () => void;
}

export const InlineDurationEditor: React.FC<InlineDurationEditorProps> = ({
  note,
  onDurationChange,
  position,
  isVisible,
  onClose,
}) => {
  if (!isVisible) return null;

  const handleDurationSelect = (duration: string) => {
    onDurationChange(duration);
    onClose();
  };

  return (
    <div
      className="fixed z-50 bg-white border-2 border-gray-300 rounded-lg shadow-lg p-2"
      style={{
        left: position.x,
        top: position.y,
        animation: 'fadeInUp 0.2s ease-out',
      }}
      onMouseLeave={onClose}
    >
      <div className="text-xs font-semibold text-gray-600 mb-2">Note Duration</div>
      <DurationSelector
        selectedDuration={note.duration}
        onDurationChange={handleDurationSelect}
        size="sm"
        orientation="horizontal"
        showLabels={false}
      />
    </div>
  );
};

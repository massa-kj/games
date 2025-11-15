/**
 * PlaybackControls - Melody playback control component
 */

import React, { useCallback } from 'react';
import type { PlaybackControlsProps } from '../types/ui.js';

/**
 * Simple SVG icons for playback controls
 */
const PlayIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M8 5v14l11-7z"/>
  </svg>
);

const PauseIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
  </svg>
);

const StopIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M6 6h12v12H6z"/>
  </svg>
);

/**
 * Format time in MM:SS format
 */
function formatTime(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
}

/**
 * PlaybackControls component provides intuitive playback controls
 *
 * Features:
 * - Play/pause/stop buttons with icons
 * - Progress bar with click-to-seek
 * - Time display (current/total)
 * - Responsive sizing (sm/md/lg)
 * - Accessibility support
 * - Visual feedback for disabled states
 */
export const PlaybackControls: React.FC<PlaybackControlsProps> = ({
  isPlaying,
  isPaused,
  canPlay,
  progress,
  duration,
  onPlay,
  onPause,
  onStop,
  onSeek,
  showProgress = true,
  showDuration = true,
  size = 'md',
}) => {
  // Handle progress bar click for seeking
  const handleProgressClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!onSeek || !canPlay) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const progressWidth = rect.width;
    const newProgress = Math.max(0, Math.min(1, clickX / progressWidth));

    onSeek(newProgress);
  }, [onSeek, canPlay]);

  // Handle keyboard interactions
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    switch (e.key) {
      case ' ':
        e.preventDefault();
        if (isPlaying) {
          onPause();
        } else {
          onPlay();
        }
        break;
      case 'Escape':
        e.preventDefault();
        onStop();
        break;
    }
  }, [isPlaying, onPlay, onPause, onStop]);

  // Size configuration
  const sizeConfig = {
    sm: {
      buttonSize: 'w-8 h-8',
      iconSize: 'w-4 h-4',
      progressHeight: 'h-1',
      fontSize: 'text-xs',
      spacing: 'gap-2',
    },
    md: {
      buttonSize: 'w-10 h-10',
      iconSize: 'w-5 h-5',
      progressHeight: 'h-2',
      fontSize: 'text-sm',
      spacing: 'gap-3',
    },
    lg: {
      buttonSize: 'w-12 h-12',
      iconSize: 'w-6 h-6',
      progressHeight: 'h-3',
      fontSize: 'text-base',
      spacing: 'gap-4',
    },
  };

  const config = sizeConfig[size];

  // Button base classes
  const buttonBaseClasses = `
    ${config.buttonSize}
    rounded-full border-2 border-gray-300
    flex items-center justify-center
    transition-all duration-200 ease-out
    focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2
    disabled:opacity-50 disabled:cursor-not-allowed
  `;

  // Play/pause button classes
  const playPauseClasses = `
    ${buttonBaseClasses}
    ${canPlay
      ? 'bg-blue-500 border-blue-500 text-white hover:bg-blue-600 hover:border-blue-600 hover:scale-105'
      : 'bg-gray-200 border-gray-300 text-gray-400'
    }
  `;

  // Stop button classes
  const stopClasses = `
    ${buttonBaseClasses}
    ${canPlay
      ? 'bg-red-500 border-red-500 text-white hover:bg-red-600 hover:border-red-600 hover:scale-105'
      : 'bg-gray-200 border-gray-300 text-gray-400'
    }
  `;

  // Current time for display
  const currentTime = progress * duration;

  return (
    <div
      className={`bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200 p-4`}
      onKeyDown={handleKeyDown}
      tabIndex={0}
      role="region"
      aria-label="Playback controls"
    >
      {/* Header */}
      <div className="text-center mb-4">
        <h3 className="text-lg font-semibold text-gray-700 mb-1">
          Playback Controls
        </h3>
        {!canPlay && (
          <p className="text-sm text-gray-500">
            Add notes to enable playback
          </p>
        )}
      </div>

      {/* Control buttons */}
      <div className={`flex items-center justify-center ${config.spacing} mb-4`}>
        {/* Play/Pause button */}
        <button
          onClick={isPlaying ? onPause : onPlay}
          disabled={!canPlay}
          className={playPauseClasses}
          aria-label={isPlaying ? 'Pause' : 'Play'}
          title={isPlaying ? 'Pause (Space)' : 'Play (Space)'}
        >
          {isPlaying ? (
            <PauseIcon className={config.iconSize} />
          ) : (
            <PlayIcon className={config.iconSize} />
          )}
        </button>

        {/* Stop button */}
        <button
          onClick={onStop}
          disabled={!canPlay}
          className={stopClasses}
          aria-label="Stop"
          title="Stop (ESC)"
        >
          <StopIcon className={config.iconSize} />
        </button>
      </div>

      {/* Progress bar */}
      {showProgress && (
        <div className="mb-3">
          <div
            className={`
              w-full ${config.progressHeight} bg-gray-200 rounded-full
              overflow-hidden cursor-pointer
              ${canPlay ? 'hover:bg-gray-300' : ''}
            `}
            onClick={handleProgressClick}
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(progress * 100)}
            aria-label="Playback progress"
          >
            <div
              className={`
                h-full bg-gradient-to-r from-blue-400 to-blue-600
                transition-all duration-100 ease-out
                ${isPlaying ? 'animate-pulse' : ''}
              `}
              style={{ width: `${progress * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* Time display */}
      {showDuration && (
        <div className={`flex justify-between items-center ${config.fontSize} text-gray-600`}>
          <span className="font-mono">
            {formatTime(currentTime)}
          </span>
          <span className="text-gray-400">/</span>
          <span className="font-mono">
            {formatTime(duration)}
          </span>
        </div>
      )}

      {/* Playback status indicator */}
      <div className={`mt-3 text-center ${config.fontSize}`}>
        {isPlaying && (
          <div className="text-green-600 font-medium flex items-center justify-center gap-1">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            Playing
          </div>
        )}
        {isPaused && (
          <div className="text-yellow-600 font-medium flex items-center justify-center gap-1">
            <div className="w-2 h-2 bg-yellow-500 rounded-full" />
            Paused
          </div>
        )}
        {!isPlaying && !isPaused && canPlay && (
          <div className="text-gray-500 font-medium">
            Ready to play
          </div>
        )}
      </div>
    </div>
  );
};

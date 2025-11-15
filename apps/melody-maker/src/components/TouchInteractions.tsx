/**
 * Touch Interaction Enhancements for Mobile Devices
 */

import React, { useState, useRef, useCallback, useEffect } from 'react';
import type { NoteIdentifier } from '@core/audio/music';
import type { CompositionNote } from '../types/composition';

/**
 * Touch gesture types
 */
export type TouchGesture = 'tap' | 'long-press' | 'swipe-left' | 'swipe-right' | 'swipe-up' | 'swipe-down';

/**
 * Touch event handlers
 */
interface TouchHandlers {
  onTap?: (event: React.TouchEvent) => void;
  onLongPress?: (event: React.TouchEvent) => void;
  onSwipe?: (direction: 'left' | 'right' | 'up' | 'down', event: React.TouchEvent) => void;
  onTouchStart?: (event: React.TouchEvent) => void;
  onTouchEnd?: (event: React.TouchEvent) => void;
}

/**
 * Touch-enhanced wrapper component
 */
interface TouchWrapperProps {
  children: React.ReactNode;
  handlers: TouchHandlers;
  className?: string;
  longPressDelay?: number;
  swipeThreshold?: number;
  enableHaptic?: boolean;
}

export function TouchWrapper({
  children,
  handlers,
  className = '',
  longPressDelay = 500,
  swipeThreshold = 50,
  enableHaptic = true
}: TouchWrapperProps) {
  const [isPressed, setIsPressed] = useState(false);
  const touchStartRef = useRef<{ x: number; y: number; time: number } | null>(null);
  const longPressTimeoutRef = useRef<number | null>(null);

  const triggerHaptic = useCallback((type: 'light' | 'medium' | 'heavy' = 'light') => {
    if (enableHaptic && 'vibrate' in navigator) {
      const patterns = {
        light: [10],
        medium: [20],
        heavy: [30]
      };
      navigator.vibrate(patterns[type]);
    }
  }, [enableHaptic]);

  const handleTouchStart = useCallback((event: React.TouchEvent) => {
    const touch = event.touches[0];
    if (!touch) return;

    setIsPressed(true);
    touchStartRef.current = {
      x: touch.clientX,
      y: touch.clientY,
      time: Date.now()
    };

    // Start long press timer
    longPressTimeoutRef.current = window.setTimeout(() => {
      if (touchStartRef.current) {
        triggerHaptic('medium');
        handlers.onLongPress?.(event);
      }
    }, longPressDelay);

    handlers.onTouchStart?.(event);
  }, [handlers, longPressDelay, triggerHaptic]);

  const handleTouchEnd = useCallback((event: React.TouchEvent) => {
    setIsPressed(false);

    if (longPressTimeoutRef.current) {
      clearTimeout(longPressTimeoutRef.current);
      longPressTimeoutRef.current = null;
    }

    const touchStart = touchStartRef.current;
    if (!touchStart) return;

    const touch = event.changedTouches[0];
    if (!touch) return;

    const deltaX = touch.clientX - touchStart.x;
    const deltaY = touch.clientY - touchStart.y;
    const deltaTime = Date.now() - touchStart.time;

    // Check for swipe gestures
    const absX = Math.abs(deltaX);
    const absY = Math.abs(deltaY);

    if (absX > swipeThreshold || absY > swipeThreshold) {
      let direction: 'left' | 'right' | 'up' | 'down';

      if (absX > absY) {
        direction = deltaX > 0 ? 'right' : 'left';
      } else {
        direction = deltaY > 0 ? 'down' : 'up';
      }

      triggerHaptic('light');
      handlers.onSwipe?.(direction, event);
    } else if (deltaTime < longPressDelay) {
      // Regular tap
      triggerHaptic('light');
      handlers.onTap?.(event);
    }

    touchStartRef.current = null;
    handlers.onTouchEnd?.(event);
  }, [handlers, longPressDelay, swipeThreshold, triggerHaptic]);

  const handleTouchCancel = useCallback(() => {
    setIsPressed(false);

    if (longPressTimeoutRef.current) {
      clearTimeout(longPressTimeoutRef.current);
      longPressTimeoutRef.current = null;
    }

    touchStartRef.current = null;
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (longPressTimeoutRef.current) {
        clearTimeout(longPressTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div
      className={`touch-none select-none ${isPressed ? 'touch-pressed' : ''} ${className}`}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchCancel}
    >
      {children}
    </div>
  );
}

/**
 * Touch-enhanced Note Button
 */
interface TouchNoteButtonProps {
  note: NoteIdentifier;
  isSelected?: boolean;
  onSelect?: (note: NoteIdentifier) => void;
  onPlay?: (note: NoteIdentifier) => void;
  onContextMenu?: (note: NoteIdentifier) => void;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function TouchNoteButton({
  note,
  isSelected = false,
  onSelect,
  onPlay,
  onContextMenu,
  size = 'md',
  className = ''
}: TouchNoteButtonProps) {
  const sizeClasses = {
    sm: 'w-12 h-12 text-sm',
    md: 'w-16 h-16 text-base',
    lg: 'w-20 h-20 text-lg'
  };

  const handleTap = useCallback(() => {
    onSelect?.(note);
    onPlay?.(note);
  }, [note, onSelect, onPlay]);

  const handleLongPress = useCallback(() => {
    onContextMenu?.(note);
  }, [note, onContextMenu]);

  return (
    <TouchWrapper
      handlers={{
        onTap: handleTap,
        onLongPress: handleLongPress
      }}
      className={`
        ${sizeClasses[size]}
        ${isSelected ? 'ring-2 ring-blue-500 bg-blue-100' : 'bg-white hover:bg-gray-50'}
        ${className}
        rounded-xl shadow-md transition-all duration-200
        flex items-center justify-center font-semibold
        border border-gray-200
        active:scale-95 touch-pressed:scale-95
      `}
    >
      <span className="text-gray-800">
        {note.name}{note.octave}
      </span>
    </TouchWrapper>
  );
}

/**
 * Touch-enhanced Sequencer Cell
 */
interface TouchSequencerCellProps {
  position: number;
  note?: CompositionNote;
  isActive?: boolean;
  onNotePlace?: (position: number, note: NoteIdentifier) => void;
  onNoteRemove?: (position: number) => void;
  onNoteEdit?: (position: number, note: CompositionNote) => void;
  selectedNote?: NoteIdentifier;
  className?: string;
}

export function TouchSequencerCell({
  position,
  note,
  isActive = false,
  onNotePlace,
  onNoteRemove,
  onNoteEdit,
  selectedNote,
  className = ''
}: TouchSequencerCellProps) {
  const handleTap = useCallback(() => {
    if (note) {
      // If cell has a note, select it for editing
      onNoteEdit?.(position, note);
    } else if (selectedNote) {
      // If no note but we have a selected note, place it
      onNotePlace?.(position, selectedNote);
    }
  }, [note, selectedNote, position, onNotePlace, onNoteEdit]);

  const handleLongPress = useCallback(() => {
    if (note) {
      // Long press to remove note
      onNoteRemove?.(position);
    }
  }, [note, position, onNoteRemove]);

  const handleSwipe = useCallback((direction: 'left' | 'right' | 'up' | 'down') => {
    if (note && (direction === 'up' || direction === 'down')) {
      // Swipe up/down to change note pitch
      const currentOctave = note.note.octave;
      const newOctave = direction === 'up' ? currentOctave + 1 : currentOctave - 1;

      if (newOctave >= 1 && newOctave <= 8) {
        const newNote: CompositionNote = {
          ...note,
          note: { ...note.note, octave: newOctave as any }
        };
        onNoteEdit?.(position, newNote);
      }
    }
  }, [note, position, onNoteEdit]);

  return (
    <TouchWrapper
      handlers={{
        onTap: handleTap,
        onLongPress: handleLongPress,
        onSwipe: handleSwipe
      }}
      className={`
        w-12 h-12 md:w-16 md:h-16
        ${note ? 'bg-blue-500 text-white' : 'bg-gray-100 border-2 border-dashed border-gray-300'}
        ${isActive ? 'ring-2 ring-yellow-400 ring-opacity-75' : ''}
        ${className}
        rounded-lg transition-all duration-200
        flex items-center justify-center text-xs md:text-sm font-medium
        touch-pressed:scale-95 active:scale-95
      `}
    >
      {note ? (
        <span>{note.note.name}{note.note.octave}</span>
      ) : (
        <span className="text-gray-400">+</span>
      )}
    </TouchWrapper>
  );
}

/**
 * Swipe Navigation Component
 */
interface SwipeNavigationProps {
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  children: React.ReactNode;
  className?: string;
}

export function SwipeNavigation({
  onSwipeLeft,
  onSwipeRight,
  children,
  className = ''
}: SwipeNavigationProps) {
  const handleSwipe = useCallback((direction: 'left' | 'right' | 'up' | 'down') => {
    if (direction === 'left' && onSwipeLeft) {
      onSwipeLeft();
    } else if (direction === 'right' && onSwipeRight) {
      onSwipeRight();
    }
  }, [onSwipeLeft, onSwipeRight]);

  return (
    <TouchWrapper
      handlers={{ onSwipe: handleSwipe }}
      className={className}
    >
      {children}
    </TouchWrapper>
  );
}

/**
 * Touch-friendly Context Menu
 */
interface TouchContextMenuProps {
  isOpen: boolean;
  onClose: () => void;
  items: Array<{
    label: string;
    icon?: string;
    action: () => void;
    destructive?: boolean;
  }>;
  position: { x: number; y: number };
}

export function TouchContextMenu({
  isOpen,
  onClose,
  items,
  position
}: TouchContextMenuProps) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50"
      onTouchStart={onClose}
    >
      <div
        className="absolute bg-white rounded-xl shadow-2xl border border-gray-200 py-2 min-w-[200px]"
        style={{
          left: Math.min(position.x, window.innerWidth - 220),
          top: Math.min(position.y, window.innerHeight - items.length * 48 - 16)
        }}
        onTouchStart={(e) => e.stopPropagation()}
      >
        {items.map((item, index) => (
          <TouchWrapper
            key={index}
            handlers={{
              onTap: () => {
                item.action();
                onClose();
              }
            }}
            className={`
              px-4 py-3 flex items-center gap-3
              ${item.destructive ? 'text-red-600' : 'text-gray-800'}
              active:bg-gray-100 transition-colors
            `}
          >
            {item.icon && (
              <span className="text-lg">{item.icon}</span>
            )}
            <span className="font-medium">{item.label}</span>
          </TouchWrapper>
        ))}
      </div>
    </div>
  );
}

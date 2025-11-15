/**
 * Accessibility Enhancements for Melody Maker
 * WCAG 2.1 AA Compliance Features
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { NoteIdentifier } from '@core/audio/music';

/**
 * Accessibility settings interface
 */
interface AccessibilitySettings {
  // Visual
  highContrast: boolean;
  reducedMotion: boolean;
  largeText: boolean;
  focusVisible: boolean;

  // Audio
  audioDescriptions: boolean;
  soundEnabled: boolean;

  // Interaction
  keyboardNavigation: boolean;
  screenReaderOptimized: boolean;
  slowAnimations: boolean;
}

/**
 * Default accessibility settings
 */
const defaultSettings: AccessibilitySettings = {
  highContrast: false,
  reducedMotion: false,
  largeText: false,
  focusVisible: true,
  audioDescriptions: false,
  soundEnabled: true,
  keyboardNavigation: true,
  screenReaderOptimized: false,
  slowAnimations: false,
};

/**
 * Accessibility context
 */
interface AccessibilityContextType {
  settings: AccessibilitySettings;
  updateSettings: (updates: Partial<AccessibilitySettings>) => void;
  announceForScreenReader: (message: string) => void;
  announceNote: (note: NoteIdentifier) => void;
  announceComposition: (noteCount: number, duration: number) => void;
}

const AccessibilityContext = createContext<AccessibilityContextType | null>(null);

/**
 * Accessibility Provider Component
 */
interface AccessibilityProviderProps {
  children: React.ReactNode;
}

export function AccessibilityProvider({ children }: AccessibilityProviderProps) {
  const [settings, setSettings] = useState<AccessibilitySettings>(() => {
    // Load from localStorage or use defaults
    const saved = localStorage.getItem('melody-maker-accessibility');
    if (saved) {
      try {
        return { ...defaultSettings, ...JSON.parse(saved) };
      } catch {
        return defaultSettings;
      }
    }

    // Detect system preferences
    const systemSettings: Partial<AccessibilitySettings> = {};

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      systemSettings.reducedMotion = true;
      systemSettings.slowAnimations = true;
    }

    if (window.matchMedia('(prefers-contrast: high)').matches) {
      systemSettings.highContrast = true;
    }

    return { ...defaultSettings, ...systemSettings };
  });

  // Save settings to localStorage
  useEffect(() => {
    localStorage.setItem('melody-maker-accessibility', JSON.stringify(settings));

    // Apply CSS custom properties for accessibility
    const root = document.documentElement;

    if (settings.highContrast) {
      root.classList.add('high-contrast');
    } else {
      root.classList.remove('high-contrast');
    }

    if (settings.reducedMotion) {
      root.classList.add('reduced-motion');
    } else {
      root.classList.remove('reduced-motion');
    }

    if (settings.largeText) {
      root.classList.add('large-text');
    } else {
      root.classList.remove('large-text');
    }

    if (settings.focusVisible) {
      root.classList.add('focus-visible');
    } else {
      root.classList.remove('focus-visible');
    }

  }, [settings]);

  const updateSettings = useCallback((updates: Partial<AccessibilitySettings>) => {
    setSettings(prev => ({ ...prev, ...updates }));
  }, []);

  // Screen reader announcements
  const announceForScreenReader = useCallback((message: string) => {
    if (!settings.screenReaderOptimized) return;

    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', 'polite');
    announcement.setAttribute('aria-atomic', 'true');
    announcement.className = 'sr-only';
    announcement.textContent = message;

    document.body.appendChild(announcement);

    setTimeout(() => {
      document.body.removeChild(announcement);
    }, 1000);
  }, [settings.screenReaderOptimized]);

  const announceNote = useCallback((note: NoteIdentifier) => {
    if (settings.audioDescriptions) {
      announceForScreenReader(`Playing note ${note.name} in octave ${note.octave}`);
    }
  }, [settings.audioDescriptions, announceForScreenReader]);

  const announceComposition = useCallback((noteCount: number, duration: number) => {
    if (settings.audioDescriptions) {
      announceForScreenReader(
        `Composition has ${noteCount} notes with a duration of ${duration.toFixed(1)} seconds`
      );
    }
  }, [settings.audioDescriptions, announceForScreenReader]);

  const contextValue: AccessibilityContextType = {
    settings,
    updateSettings,
    announceForScreenReader,
    announceNote,
    announceComposition,
  };

  return (
    <AccessibilityContext.Provider value={contextValue}>
      {children}
    </AccessibilityContext.Provider>
  );
}

/**
 * Hook to use accessibility context
 */
export function useAccessibility() {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error('useAccessibility must be used within AccessibilityProvider');
  }
  return context;
}

/**
 * Accessible Button Component
 */
interface AccessibleButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  ariaLabel?: string;
  ariaDescription?: string;
  iconOnly?: boolean;
}

export function AccessibleButton({
  children,
  variant = 'primary',
  size = 'md',
  ariaLabel,
  ariaDescription,
  iconOnly = false,
  className = '',
  ...props
}: AccessibleButtonProps) {
  const { settings } = useAccessibility();

  const variantClasses = {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white',
    secondary: 'bg-gray-200 hover:bg-gray-300 text-gray-800',
    danger: 'bg-red-600 hover:bg-red-700 text-white'
  };

  const sizeClasses = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg'
  };

  return (
    <button
      className={`
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${settings.largeText ? 'text-lg' : ''}
        ${settings.highContrast ? 'ring-2 ring-current' : ''}
        ${className}
        rounded-lg font-medium transition-all duration-200
        focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
        disabled:opacity-50 disabled:cursor-not-allowed
        ${settings.reducedMotion ? '' : 'hover:transform hover:scale-105'}
      `}
      aria-label={ariaLabel}
      aria-describedby={ariaDescription ? `${props.id}-description` : undefined}
      {...props}
    >
      {children}
      {ariaDescription && (
        <span id={`${props.id}-description`} className="sr-only">
          {ariaDescription}
        </span>
      )}
    </button>
  );
}

/**
 * Accessible Note Button with keyboard navigation
 */
interface AccessibleNoteButtonProps {
  note: NoteIdentifier;
  isSelected?: boolean;
  onSelect?: (note: NoteIdentifier) => void;
  onPlay?: (note: NoteIdentifier) => void;
  tabIndex?: number;
  className?: string;
}

export function AccessibleNoteButton({
  note,
  isSelected = false,
  onSelect,
  onPlay,
  tabIndex = 0,
  className = ''
}: AccessibleNoteButtonProps) {
  const { settings, announceNote } = useAccessibility();

  const handleClick = useCallback(() => {
    onSelect?.(note);
    onPlay?.(note);
    announceNote(note);
  }, [note, onSelect, onPlay, announceNote]);

  const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleClick();
    }
  }, [handleClick]);

  return (
    <button
      className={`
        w-16 h-16 rounded-xl shadow-md transition-all duration-200
        ${isSelected
          ? 'bg-blue-600 text-white ring-2 ring-blue-400'
          : settings.highContrast
            ? 'bg-white text-black border-2 border-black hover:bg-gray-100'
            : 'bg-white text-gray-800 hover:bg-gray-50'
        }
        ${settings.largeText ? 'text-lg' : 'text-base'}
        ${className}
        flex items-center justify-center font-semibold
        focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500
        ${settings.reducedMotion ? '' : 'hover:transform hover:scale-105 active:scale-95'}
      `}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      tabIndex={tabIndex}
      aria-label={`Note ${note.name} in octave ${note.octave}`}
      aria-pressed={isSelected}
      role="button"
    >
      {note.name}{note.octave}
    </button>
  );
}

/**
 * Keyboard Navigation Handler
 */
interface KeyboardNavigationProps {
  children: React.ReactNode;
  onArrowKey?: (direction: 'up' | 'down' | 'left' | 'right') => void;
  onEnter?: () => void;
  onSpace?: () => void;
  onEscape?: () => void;
}

export function KeyboardNavigation({
  children,
  onArrowKey,
  onEnter,
  onSpace,
  onEscape
}: KeyboardNavigationProps) {
  const { settings } = useAccessibility();

  const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
    if (!settings.keyboardNavigation) return;

    switch (event.key) {
      case 'ArrowUp':
        event.preventDefault();
        onArrowKey?.('up');
        break;
      case 'ArrowDown':
        event.preventDefault();
        onArrowKey?.('down');
        break;
      case 'ArrowLeft':
        event.preventDefault();
        onArrowKey?.('left');
        break;
      case 'ArrowRight':
        event.preventDefault();
        onArrowKey?.('right');
        break;
      case 'Enter':
        event.preventDefault();
        onEnter?.();
        break;
      case ' ':
        event.preventDefault();
        onSpace?.();
        break;
      case 'Escape':
        event.preventDefault();
        onEscape?.();
        break;
    }
  }, [settings.keyboardNavigation, onArrowKey, onEnter, onSpace, onEscape]);

  return (
    <div onKeyDown={handleKeyDown} tabIndex={-1}>
      {children}
    </div>
  );
}

/**
 * Accessibility Settings Panel
 */
export function AccessibilitySettingsPanel() {
  const { settings, updateSettings } = useAccessibility();

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 space-y-6">
      <h2 className="text-xl font-bold text-gray-800 mb-4">
        Accessibility Settings
      </h2>

      <div className="space-y-4">
        {/* Visual Settings */}
        <div>
          <h3 className="font-semibold text-gray-700 mb-2">Visual</h3>
          <div className="space-y-2">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={settings.highContrast}
                onChange={(e) => updateSettings({ highContrast: e.target.checked })}
                className="mr-2"
              />
              High Contrast Mode
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={settings.largeText}
                onChange={(e) => updateSettings({ largeText: e.target.checked })}
                className="mr-2"
              />
              Large Text
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={settings.reducedMotion}
                onChange={(e) => updateSettings({ reducedMotion: e.target.checked })}
                className="mr-2"
              />
              Reduce Motion
            </label>
          </div>
        </div>

        {/* Audio Settings */}
        <div>
          <h3 className="font-semibold text-gray-700 mb-2">Audio</h3>
          <div className="space-y-2">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={settings.audioDescriptions}
                onChange={(e) => updateSettings({ audioDescriptions: e.target.checked })}
                className="mr-2"
              />
              Audio Descriptions
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={settings.soundEnabled}
                onChange={(e) => updateSettings({ soundEnabled: e.target.checked })}
                className="mr-2"
              />
              Sound Effects
            </label>
          </div>
        </div>

        {/* Interaction Settings */}
        <div>
          <h3 className="font-semibold text-gray-700 mb-2">Interaction</h3>
          <div className="space-y-2">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={settings.keyboardNavigation}
                onChange={(e) => updateSettings({ keyboardNavigation: e.target.checked })}
                className="mr-2"
              />
              Keyboard Navigation
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={settings.screenReaderOptimized}
                onChange={(e) => updateSettings({ screenReaderOptimized: e.target.checked })}
                className="mr-2"
              />
              Screen Reader Optimization
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}

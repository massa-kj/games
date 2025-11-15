/**
 * useComposition - Composition state management hook
 */

import { useState, useCallback, useMemo } from 'react';
import type {
  Composition,
  CompositionNote,
  CompositionMeta,
  MelodyMakerSettings
} from '../types/composition.js';
import type { NoteIdentifier, ScaleType } from '@core/audio/music';

/**
 * Generate a unique ID
 */
function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Default composition settings
 */
const DEFAULT_SETTINGS: MelodyMakerSettings = {
  defaultTempo: 120,
  defaultInstrument: 'piano',
  defaultScale: 'major',
  defaultOctave: 4,
  colorScheme: 'hsl-wheel',
  gridSize: 'normal',
  autoPlay: false,
  showNoteNames: true,
  enableAdvancedFeatures: false,
};

/**
 * Create a new empty composition
 */
function createNewComposition(name?: string): Composition {
  return {
    id: generateId(),
    name: name || `Composition ${new Date().toLocaleDateString()}`,
    createdAt: new Date(),
    modifiedAt: new Date(),
    sequence: [],
    tempo: DEFAULT_SETTINGS.defaultTempo,
    timeSignature: {
      numerator: 4,
      denominator: 4,
    },
    key: {
      root: 'C',
      scale: DEFAULT_SETTINGS.defaultScale,
    },
    instrument: DEFAULT_SETTINGS.defaultInstrument,
    volume: 0.8,
    loop: false,
    tags: [],
    difficulty: 'beginner',
    isTemplate: false,
  };
}

/**
 * Validate composition data
 */
function validateComposition(composition: Partial<Composition>): string[] {
  const errors: string[] = [];

  if (!composition.name?.trim()) {
    errors.push('Composition name is required');
  }

  if (!composition.sequence) {
    errors.push('Composition sequence is required');
  } else if (composition.sequence.length === 0) {
    errors.push('Composition must have at least one note');
  }

  if (composition.tempo && (composition.tempo < 60 || composition.tempo > 200)) {
    errors.push('Tempo must be between 60 and 200 BPM');
  }

  if (composition.volume && (composition.volume < 0 || composition.volume > 1)) {
    errors.push('Volume must be between 0 and 1');
  }

  // Validate sequence positioning
  if (composition.sequence) {
    const positions = composition.sequence.map(note => note.position);
    const duplicatePositions = positions.filter((pos, index) => positions.indexOf(pos) !== index);
    if (duplicatePositions.length > 0) {
      errors.push('Multiple notes cannot occupy the same position');
    }
  }

  return errors;
}

/**
 * Calculate composition metadata
 */
function calculateCompositionMeta(composition: Composition): CompositionMeta {
  const noteCount = composition.sequence.length;

  // Calculate duration based on tempo and sequence length
  // Assuming 2 bars with 4 beats each at given tempo
  const beatsPerComposition = 8; // 2 bars × 4 beats
  const duration = (beatsPerComposition / composition.tempo) * 60; // Convert to seconds

  return {
    id: composition.id,
    name: composition.name,
    createdAt: composition.createdAt,
    modifiedAt: composition.modifiedAt,
    duration,
    noteCount,
    difficulty: composition.difficulty,
    tags: composition.tags,
  };
}

/**
 * Hook return type
 */
interface UseCompositionReturn {
  // Current composition state
  composition: Composition | null;
  isModified: boolean;
  validationErrors: string[];

  // Composition operations
  createComposition: (name?: string) => void;
  loadComposition: (composition: Composition) => void;
  updateComposition: (updates: Partial<Composition>) => void;
  clearComposition: () => void;
  duplicateComposition: () => void;

  // Sequence operations
  addNote: (note: CompositionNote) => void;
  removeNote: (noteId: string) => void;
  updateNote: (noteId: string, updates: Partial<CompositionNote>) => void;
  moveNote: (noteId: string, newPosition: number) => void;
  clearSequence: () => void;
  replaceSequence: (newSequence: CompositionNote[]) => void;

  // Composition properties
  updateTempo: (tempo: number) => void;
  updateInstrument: (instrument: string) => void;
  updateKey: (root: NoteIdentifier['name'], scale: ScaleType) => void;
  updateVolume: (volume: number) => void;
  updateLoop: (loop: boolean) => void;

  // Utility functions
  getCompositionMeta: () => CompositionMeta | null;
  exportComposition: () => string;
  importComposition: (jsonData: string) => boolean;

  // Settings
  settings: MelodyMakerSettings;
  updateSettings: (updates: Partial<MelodyMakerSettings>) => void;
}

/**
 * Composition management hook
 *
 * Provides comprehensive composition state management including:
 * - CRUD operations for compositions
 * - Sequence manipulation (add/remove/update notes)
 * - Composition validation
 * - Import/export functionality
 * - Settings management
 */
export function useComposition(): UseCompositionReturn {
  const [composition, setComposition] = useState<Composition | null>(null);
  const [originalComposition, setOriginalComposition] = useState<Composition | null>(null);
  const [settings, setSettings] = useState<MelodyMakerSettings>(DEFAULT_SETTINGS);

  // Check if composition has been modified
  const isModified = useMemo(() => {
    if (!composition || !originalComposition) return false;
    return JSON.stringify(composition) !== JSON.stringify(originalComposition);
  }, [composition, originalComposition]);

  // Validate current composition
  const validationErrors = useMemo(() => {
    if (!composition) return [];
    return validateComposition(composition);
  }, [composition]);

  // Create new composition
  const createComposition = useCallback((name?: string) => {
    const newComposition = createNewComposition(name);
    setComposition(newComposition);
    setOriginalComposition(structuredClone(newComposition));
  }, []);

  // Load existing composition
  const loadComposition = useCallback((comp: Composition) => {
    setComposition(comp);
    setOriginalComposition(structuredClone(comp));
  }, []);

  // Update composition
  const updateComposition = useCallback((updates: Partial<Composition>) => {
    setComposition(prev => {
      if (!prev) return null;
      return {
        ...prev,
        ...updates,
        modifiedAt: new Date(),
      };
    });
  }, []);

  // Clear composition
  const clearComposition = useCallback(() => {
    setComposition(null);
    setOriginalComposition(null);
  }, []);

  // Duplicate composition
  const duplicateComposition = useCallback(() => {
    if (!composition) return;

    const duplicated: Composition = {
      ...composition,
      id: generateId(),
      name: `${composition.name} (Copy)`,
      createdAt: new Date(),
      modifiedAt: new Date(),
    };

    setComposition(duplicated);
    setOriginalComposition(structuredClone(duplicated));
  }, [composition]);

  // Add note to sequence
  const addNote = useCallback((note: CompositionNote) => {
    setComposition(prev => {
      if (!prev) return null;

      // Remove any existing note at the same position
      const filteredSequence = prev.sequence.filter(n => n.position !== note.position);

      // Add new note and sort by position
      const newSequence = [...filteredSequence, note].sort((a, b) => a.position - b.position);

      return {
        ...prev,
        sequence: newSequence,
        modifiedAt: new Date(),
      };
    });
  }, []);

  // Remove note from sequence
  const removeNote = useCallback((noteId: string) => {
    setComposition(prev => {
      if (!prev) return null;

      return {
        ...prev,
        sequence: prev.sequence.filter(note => note.id !== noteId),
        modifiedAt: new Date(),
      };
    });
  }, []);

  // Update existing note
  const updateNote = useCallback((noteId: string, updates: Partial<CompositionNote>) => {
    setComposition(prev => {
      if (!prev) return null;

      return {
        ...prev,
        sequence: prev.sequence.map(note =>
          note.id === noteId
            ? { ...note, ...updates }
            : note
        ),
        modifiedAt: new Date(),
      };
    });
  }, []);

  // Move note to new position
  const moveNote = useCallback((noteId: string, newPosition: number) => {
    setComposition(prev => {
      if (!prev) return null;

      // Remove note from current position
      const noteToMove = prev.sequence.find(n => n.id === noteId);
      if (!noteToMove) return prev;

      // Remove existing note at target position and the note being moved
      const filteredSequence = prev.sequence.filter(n =>
        n.id !== noteId && n.position !== newPosition
      );

      // Add moved note with new position
      const movedNote = { ...noteToMove, position: newPosition };
      const newSequence = [...filteredSequence, movedNote].sort((a, b) => a.position - b.position);

      return {
        ...prev,
        sequence: newSequence,
        modifiedAt: new Date(),
      };
    });
  }, []);

  // Clear all notes from sequence
  const clearSequence = useCallback(() => {
    setComposition(prev => {
      if (!prev) return null;

      return {
        ...prev,
        sequence: [],
        modifiedAt: new Date(),
      };
    });
  }, []);

  // Replace entire sequence
  const replaceSequence = useCallback((newSequence: CompositionNote[]) => {
    setComposition(prev => {
      if (!prev) return null;

      // Sort sequence by position
      const sortedSequence = [...newSequence].sort((a, b) => a.position - b.position);

      return {
        ...prev,
        sequence: sortedSequence,
        modifiedAt: new Date(),
      };
    });
  }, []);

  // Update tempo
  const updateTempo = useCallback((tempo: number) => {
    updateComposition({ tempo });
  }, [updateComposition]);

  // Update instrument
  const updateInstrument = useCallback((instrument: string) => {
    updateComposition({ instrument });
  }, [updateComposition]);

  // Update key signature
  const updateKey = useCallback((root: NoteIdentifier['name'], scale: ScaleType) => {
    updateComposition({
      key: { root, scale }
    });
  }, [updateComposition]);

  // Update volume
  const updateVolume = useCallback((volume: number) => {
    updateComposition({ volume });
  }, [updateComposition]);

  // Update loop setting
  const updateLoop = useCallback((loop: boolean) => {
    updateComposition({ loop });
  }, [updateComposition]);

  // Get composition metadata
  const getCompositionMeta = useCallback((): CompositionMeta | null => {
    if (!composition) return null;
    return calculateCompositionMeta(composition);
  }, [composition]);

  // Export composition to JSON string
  const exportComposition = useCallback((): string => {
    if (!composition) return '';
    return JSON.stringify(composition, null, 2);
  }, [composition]);

  // Import composition from JSON string
  const importComposition = useCallback((jsonData: string): boolean => {
    try {
      const imported = JSON.parse(jsonData) as Composition;

      // Basic validation
      const errors = validateComposition(imported);
      if (errors.length > 0) {
        console.error('Invalid composition data:', errors);
        return false;
      }

      // Convert date strings back to Date objects
      imported.createdAt = new Date(imported.createdAt);
      imported.modifiedAt = new Date(imported.modifiedAt);

      loadComposition(imported);
      return true;
    } catch (error) {
      console.error('Failed to import composition:', error);
      return false;
    }
  }, [loadComposition]);

  // Update settings
  const updateSettings = useCallback((updates: Partial<MelodyMakerSettings>) => {
    setSettings(prev => ({ ...prev, ...updates }));
  }, []);

  return {
    // State
    composition,
    isModified,
    validationErrors,

    // Composition operations
    createComposition,
    loadComposition,
    updateComposition,
    clearComposition,
    duplicateComposition,

    // Sequence operations
    addNote,
    removeNote,
    updateNote,
    moveNote,
    clearSequence,
    replaceSequence,

    // Composition properties
    updateTempo,
    updateInstrument,
    updateKey,
    updateVolume,
    updateLoop,

    // Utility functions
    getCompositionMeta,
    exportComposition,
    importComposition,

    // Settings
    settings,
    updateSettings,
  };
}

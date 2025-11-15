/**
 * Composition storage layer using localStorage
 */

import type {
  Composition,
  CompositionMeta
} from '../types/composition.js';

/**
 * Storage keys
 */
const STORAGE_KEYS = {
  COMPOSITIONS: 'melody-maker-compositions',
  META: 'melody-maker-meta',
  SETTINGS: 'melody-maker-settings',
} as const;

/**
 * Storage settings
 */
interface StorageSettings {
  lastOpenedId?: string;
  autoSave: boolean;
  maxCompositions: number;
}

/**
 * Default storage settings
 */
const defaultSettings: StorageSettings = {
  autoSave: true,
  maxCompositions: 50,
};

/**
 * Simple storage utilities
 */
class SimpleStorage {
  static get<T>(key: string, defaultValue: T): T {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch {
      return defaultValue;
    }
  }

  static set<T>(key: string, value: T): boolean {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch {
      return false;
    }
  }

  static remove(key: string): boolean {
    try {
      localStorage.removeItem(key);
      return true;
    } catch {
      return false;
    }
  }
}

/**
 * Calculate composition metadata
 */
function calculateMeta(composition: Composition): CompositionMeta {
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
 * Composition storage operations
 */
export const compositionStorageApi = {
  /**
   * Save a composition
   */
  async saveComposition(composition: Composition): Promise<void> {
    const compositions = SimpleStorage.get<Record<string, Composition>>(STORAGE_KEYS.COMPOSITIONS, {});
    const metas = SimpleStorage.get<Record<string, CompositionMeta>>(STORAGE_KEYS.META, {});
    const settings = SimpleStorage.get<StorageSettings>(STORAGE_KEYS.SETTINGS, defaultSettings);

    // Check composition limit
    const existingIds = Object.keys(compositions);
    if (!existingIds.includes(composition.id) && existingIds.length >= settings.maxCompositions) {
      // Remove oldest composition if at limit
      const oldestMeta = Object.values(metas)
        .sort((a, b) => new Date(a.modifiedAt).getTime() - new Date(b.modifiedAt).getTime())[0];

      if (oldestMeta) {
        delete compositions[oldestMeta.id];
        delete metas[oldestMeta.id];
      }
    }

    // Save composition and metadata
    const meta = calculateMeta(composition);
    compositions[composition.id] = composition;
    metas[composition.id] = meta;
    settings.lastOpenedId = composition.id;

    SimpleStorage.set(STORAGE_KEYS.COMPOSITIONS, compositions);
    SimpleStorage.set(STORAGE_KEYS.META, metas);
    SimpleStorage.set(STORAGE_KEYS.SETTINGS, settings);
  },

  /**
   * Load a composition by ID
   */
  async loadComposition(id: string): Promise<Composition | null> {
    const compositions = SimpleStorage.get<Record<string, Composition>>(STORAGE_KEYS.COMPOSITIONS, {});
    const composition = compositions[id];

    if (composition) {
      // Convert date strings back to Date objects if needed
      if (typeof composition.createdAt === 'string') {
        composition.createdAt = new Date(composition.createdAt);
      }
      if (typeof composition.modifiedAt === 'string') {
        composition.modifiedAt = new Date(composition.modifiedAt);
      }

      // Update last opened
      const settings = SimpleStorage.get<StorageSettings>(STORAGE_KEYS.SETTINGS, defaultSettings);
      settings.lastOpenedId = id;
      SimpleStorage.set(STORAGE_KEYS.SETTINGS, settings);

      return composition;
    }

    return null;
  },

  /**
   * Delete a composition
   */
  async deleteComposition(id: string): Promise<boolean> {
    const compositions = SimpleStorage.get<Record<string, Composition>>(STORAGE_KEYS.COMPOSITIONS, {});
    const metas = SimpleStorage.get<Record<string, CompositionMeta>>(STORAGE_KEYS.META, {});
    const settings = SimpleStorage.get<StorageSettings>(STORAGE_KEYS.SETTINGS, defaultSettings);

    if (compositions[id]) {
      delete compositions[id];
      delete metas[id];

      // Clear last opened if it was the deleted composition
      if (settings.lastOpenedId === id) {
        settings.lastOpenedId = undefined;
      }

      SimpleStorage.set(STORAGE_KEYS.COMPOSITIONS, compositions);
      SimpleStorage.set(STORAGE_KEYS.META, metas);
      SimpleStorage.set(STORAGE_KEYS.SETTINGS, settings);
      return true;
    }

    return false;
  },

  /**
   * List all composition metadata
   */
  async listCompositions(): Promise<CompositionMeta[]> {
    const metas = SimpleStorage.get<Record<string, CompositionMeta>>(STORAGE_KEYS.META, {});

    return Object.values(metas)
      .map(meta => ({
        ...meta,
        // Ensure dates are Date objects
        createdAt: typeof meta.createdAt === 'string' ? new Date(meta.createdAt) : meta.createdAt,
        modifiedAt: typeof meta.modifiedAt === 'string' ? new Date(meta.modifiedAt) : meta.modifiedAt,
      }))
      .sort((a, b) => b.modifiedAt.getTime() - a.modifiedAt.getTime()); // Most recent first
  },

  /**
   * Get composition metadata by ID
   */
  async getCompositionMeta(id: string): Promise<CompositionMeta | null> {
    const metas = SimpleStorage.get<Record<string, CompositionMeta>>(STORAGE_KEYS.META, {});
    const meta = metas[id];

    if (meta) {
      return {
        ...meta,
        createdAt: typeof meta.createdAt === 'string' ? new Date(meta.createdAt) : meta.createdAt,
        modifiedAt: typeof meta.modifiedAt === 'string' ? new Date(meta.modifiedAt) : meta.modifiedAt,
      };
    }

    return null;
  },

  /**
   * Check if a composition exists
   */
  async hasComposition(id: string): Promise<boolean> {
    const compositions = SimpleStorage.get<Record<string, Composition>>(STORAGE_KEYS.COMPOSITIONS, {});
    return id in compositions;
  },

  /**
   * Export all compositions as JSON
   */
  async exportAll(): Promise<string> {
    const compositions = SimpleStorage.get<Record<string, Composition>>(STORAGE_KEYS.COMPOSITIONS, {});

    return JSON.stringify({
      compositions,
      exportedAt: new Date().toISOString(),
      version: '1.0',
    }, null, 2);
  },

  /**
   * Clear all compositions
   */
  async clearAll(): Promise<void> {
    SimpleStorage.remove(STORAGE_KEYS.COMPOSITIONS);
    SimpleStorage.remove(STORAGE_KEYS.META);
    const settings = SimpleStorage.get<StorageSettings>(STORAGE_KEYS.SETTINGS, defaultSettings);
    settings.lastOpenedId = undefined;
    SimpleStorage.set(STORAGE_KEYS.SETTINGS, settings);
  },

  /**
   * Get last opened composition ID
   */
  async getLastOpenedId(): Promise<string | undefined> {
    const settings = SimpleStorage.get<StorageSettings>(STORAGE_KEYS.SETTINGS, defaultSettings);
    return settings.lastOpenedId;
  },
};

import type { StorageManager } from './manager.js';
import type { NamespacedStorage } from './types.js';

/**
 * Type-safe helper functions for common storage operations
 * Provides predefined schemas for settings, game data, and user preferences
 */

/**
 * Language type used throughout the application
 */
export type Lang = 'ja' | 'en';

/**
 * Global application settings schema
 */
export interface AppSettings {
  /** Current language */
  lang: Lang;
  /** Sound enabled/disabled */
  sound: boolean;
  /** Theme preference */
  theme?: 'light' | 'dark' | 'auto';
  /** Accessibility settings */
  accessibility?: {
    /** High contrast mode */
    highContrast?: boolean;
    /** Reduced motion */
    reducedMotion?: boolean;
    /** Large text */
    largeText?: boolean;
  };
}

/**
 * Game-specific settings schema
 */
export interface GameSettings {
  /** Difficulty level */
  difficulty?: 'easy' | 'medium' | 'hard';
  /** Game-specific sound volume (0-1) */
  volume?: number;
  /** Custom game options */
  options?: Record<string, unknown>;
}



/**
 * User progress data schema
 */
export interface UserProgress {
  /** Games completed */
  gamesCompleted: string[];
  /** Best scores for each game */
  bestScores: Record<string, number>;
  /** Total play time in minutes */
  totalPlayTime: number;
  /** Last played timestamp */
  lastPlayed: number;
  /** Current streak */
  streak: number;
  /** Achievements unlocked */
  achievements: string[];
}

/**
 * Cache data schema
 */
export interface CacheEntry<T = unknown> {
  /** Cached data */
  data: T;
  /** Cache timestamp */
  timestamp: number;
  /** Cache expiry time */
  expiresAt: number;
  /** Cache version for invalidation */
  version?: string;
}

/**
 * Default values for application settings
 */
export const DEFAULT_APP_SETTINGS: AppSettings = {
  lang: 'en',
  sound: true,
  theme: 'auto',
  accessibility: {
    highContrast: false,
    reducedMotion: false,
    largeText: false,
  },
};

/**
 * Default values for user progress
 */
export const DEFAULT_USER_PROGRESS: UserProgress = {
  gamesCompleted: [],
  bestScores: {},
  totalPlayTime: 0,
  lastPlayed: 0,
  streak: 0,
  achievements: [],
};

/**
 * Create a type-safe settings storage helper
 */
export function createSettingsStorage(storage: StorageManager): {
  getSettings(): Promise<AppSettings>;
  setSettings(settings: Partial<AppSettings>): Promise<boolean>;
  resetSettings(): Promise<boolean>;
  updateSetting<K extends keyof AppSettings>(
    key: K,
    value: AppSettings[K]
  ): Promise<boolean>;
  subscribe(callback: (settings: AppSettings) => void): () => void;
} {
  const settingsStorage = storage.namespace('settings');

  return {
    async getSettings(): Promise<AppSettings> {
      const settings = await settingsStorage.get<AppSettings>('app', DEFAULT_APP_SETTINGS);
      return { ...DEFAULT_APP_SETTINGS, ...settings };
    },

    async setSettings(settings: Partial<AppSettings>): Promise<boolean> {
      const current = await this.getSettings();
      const updated = { ...current, ...settings };
      return settingsStorage.set('app', updated);
    },

    async resetSettings(): Promise<boolean> {
      return settingsStorage.set('app', DEFAULT_APP_SETTINGS);
    },

    async updateSetting<K extends keyof AppSettings>(
      key: K,
      value: AppSettings[K]
    ): Promise<boolean> {
      const current = await this.getSettings();
      current[key] = value;
      return settingsStorage.set('app', current);
    },

    subscribe(callback: (settings: AppSettings) => void): () => void {
      return settingsStorage.subscribe?.((event) => {
        if (event.key === 'app' && event.newValue) {
          callback(event.newValue as AppSettings);
        }
      }) || (() => {});
    },
  };
}

/**
 * Create a type-safe game storage helper
 */
export function createGameStorage(storage: StorageManager, gameId: string): {
  getSettings(): Promise<GameSettings>;
  setSettings(settings: Partial<GameSettings>): Promise<boolean>;
  getProgress(): Promise<UserProgress>;
  updateProgress(update: Partial<UserProgress>): Promise<boolean>;
  addScore(score: number): Promise<boolean>;
  addPlayTime(minutes: number): Promise<boolean>;
  markCompleted(): Promise<boolean>;
  unlockAchievement(achievementId: string): Promise<boolean>;
  clear(): Promise<boolean>;
} {
  const gameStorage = storage.namespace(`games:${gameId}`);
  const progressStorage = storage.namespace('progress');

  return {
    async getSettings(): Promise<GameSettings> {
      return (await gameStorage.get<GameSettings>('settings')) || {};
    },

    async setSettings(settings: Partial<GameSettings>): Promise<boolean> {
      const current = await this.getSettings();
      const updated = { ...current, ...settings };
      return gameStorage.set('settings', updated);
    },

    async getProgress(): Promise<UserProgress> {
      const progress = await progressStorage.get<UserProgress>('user', DEFAULT_USER_PROGRESS);
      return { ...DEFAULT_USER_PROGRESS, ...progress };
    },

    async updateProgress(update: Partial<UserProgress>): Promise<boolean> {
      const current = await this.getProgress();
      const updated = { ...current, ...update };
      return progressStorage.set('user', updated);
    },

    async addScore(score: number): Promise<boolean> {
      const progress = await this.getProgress();
      const currentBest = progress.bestScores[gameId] || 0;
      if (score > currentBest) {
        progress.bestScores[gameId] = score;
        progress.lastPlayed = Date.now();
        return this.updateProgress(progress);
      }
      return true;
    },

    async addPlayTime(minutes: number): Promise<boolean> {
      const progress = await this.getProgress();
      progress.totalPlayTime += minutes;
      progress.lastPlayed = Date.now();
      return this.updateProgress(progress);
    },

    async markCompleted(): Promise<boolean> {
      const progress = await this.getProgress();
      if (!progress.gamesCompleted.includes(gameId)) {
        progress.gamesCompleted.push(gameId);
        progress.streak += 1;
        progress.lastPlayed = Date.now();
        return this.updateProgress(progress);
      }
      return true;
    },

    async unlockAchievement(achievementId: string): Promise<boolean> {
      const progress = await this.getProgress();
      const fullAchievementId = `${gameId}:${achievementId}`;
      if (!progress.achievements.includes(fullAchievementId)) {
        progress.achievements.push(fullAchievementId);
        return this.updateProgress(progress);
      }
      return true;
    },

    async clear(): Promise<boolean> {
      return gameStorage.clear();
    },
  };
}

/**
 * Create a type-safe cache storage helper
 */
export function createCacheStorage(storage: StorageManager): {
  get<T = unknown>(key: string): Promise<T | undefined>;
  set<T = unknown>(key: string, data: T, ttlMinutes?: number): Promise<boolean>;
  remove(key: string): Promise<boolean>;
  clear(): Promise<boolean>;
  cleanup(): Promise<number>;
  isExpired(key: string): Promise<boolean>;
} {
  const cacheStorage = storage.namespace('cache');

  return {
    async get<T = unknown>(key: string): Promise<T | undefined> {
      const entry = await cacheStorage.get<CacheEntry<T>>(key);
      if (!entry) return undefined;

      // Check if expired
      if (Date.now() > entry.expiresAt) {
        await cacheStorage.remove(key);
        return undefined;
      }

      return entry.data;
    },

    async set<T = unknown>(
      key: string,
      data: T,
      ttlMinutes: number = 60
    ): Promise<boolean> {
      const entry: CacheEntry<T> = {
        data,
        timestamp: Date.now(),
        expiresAt: Date.now() + ttlMinutes * 60 * 1000,
        version: '1.0',
      };
      return cacheStorage.set(key, entry);
    },

    async remove(key: string): Promise<boolean> {
      return cacheStorage.remove(key);
    },

    async clear(): Promise<boolean> {
      return cacheStorage.clear();
    },

    async cleanup(): Promise<number> {
      const keys = await cacheStorage.keys();
      let removedCount = 0;

      for (const key of keys) {
        const entry = await cacheStorage.get<CacheEntry>(key);
        if (entry && Date.now() > entry.expiresAt) {
          await cacheStorage.remove(key);
          removedCount++;
        }
      }

      return removedCount;
    },

    async isExpired(key: string): Promise<boolean> {
      const entry = await cacheStorage.get<CacheEntry>(key);
      return !entry || Date.now() > entry.expiresAt;
    },
  };
}

/**
 * Create a type-safe preferences storage helper
 */
export function createPreferencesStorage(storage: StorageManager): {
  get<T = unknown>(key: string, defaultValue?: T): Promise<T | undefined>;
  set<T = unknown>(key: string, value: T): Promise<boolean>;
  remove(key: string): Promise<boolean>;
  getAll(): Promise<Record<string, unknown>>;
  setMany(preferences: Record<string, unknown>): Promise<boolean>;
  subscribe(callback: (key: string, value: unknown) => void): () => void;
} {
  const preferencesStorage = storage.namespace('preferences');

  return {
    async get<T = unknown>(key: string, defaultValue?: T): Promise<T | undefined> {
      return preferencesStorage.get(key, defaultValue);
    },

    async set<T = unknown>(key: string, value: T): Promise<boolean> {
      return preferencesStorage.set(key, value);
    },

    async remove(key: string): Promise<boolean> {
      return preferencesStorage.remove(key);
    },

    async getAll(): Promise<Record<string, unknown>> {
      const keys = await preferencesStorage.keys();
      const preferences: Record<string, unknown> = {};

      for (const key of keys) {
        const value = await preferencesStorage.get(key);
        if (value !== undefined) {
          preferences[key] = value;
        }
      }

      return preferences;
    },

    async setMany(preferences: Record<string, unknown>): Promise<boolean> {
      try {
        for (const [key, value] of Object.entries(preferences)) {
          const success = await preferencesStorage.set(key, value);
          if (!success) return false;
        }
        return true;
      } catch {
        return false;
      }
    },

    subscribe(callback: (key: string, value: unknown) => void): () => void {
      return preferencesStorage.subscribe?.((event) => {
        callback(event.key, event.newValue);
      }) || (() => {});
    },
  };
}



/**
 * Storage factory for creating commonly used storage instances
 */
export class StorageFactory {
  constructor(private storage: StorageManager) {}

  /**
   * Create settings storage
   */
  settings() {
    return createSettingsStorage(this.storage);
  }

  /**
   * Create game storage for a specific game
   */
  game(gameId: string) {
    return createGameStorage(this.storage, gameId);
  }

  /**
   * Create cache storage
   */
  cache() {
    return createCacheStorage(this.storage);
  }

  /**
   * Create preferences storage
   */
  preferences() {
    return createPreferencesStorage(this.storage);
  }

  /**
   * Create custom namespaced storage
   */
  namespace(namespace: string): NamespacedStorage {
    return this.storage.namespace(namespace);
  }

  /**
   * Get the underlying storage manager
   */
  getManager(): StorageManager {
    return this.storage;
  }
}

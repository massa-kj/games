/**
 * Storage types and interfaces for the games platform
 * Provides abstraction layer for different storage implementations
 */

/**
 * Base storage operation result
 */
export interface StorageResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * Storage change event data
 */
export interface StorageChangeEvent<T = unknown> {
  key: string;
  oldValue?: T;
  newValue?: T;
  namespace?: string;
  timestamp: number;
}

/**
 * Storage configuration options
 */
export interface StorageConfig {
  /** Default namespace for all operations */
  namespace?: string;
  /** Enable automatic JSON serialization/deserialization */
  autoSerialize?: boolean;
  /** Enable change notifications */
  enableNotifications?: boolean;
  /** Custom error handler */
  onError?: (error: Error, operation: string, key?: string) => void;
}

/**
 * Storage provider interface
 * All storage implementations must implement this interface
 */
export interface StorageProvider {
  /**
   * Get a value by key
   */
  get<T = unknown>(key: string): Promise<StorageResult<T>>;

  /**
   * Set a value by key
   */
  set<T = unknown>(key: string, value: T): Promise<StorageResult<void>>;

  /**
   * Remove a value by key
   */
  remove(key: string): Promise<StorageResult<void>>;

  /**
   * Clear all values (optionally within a namespace)
   */
  clear(namespace?: string): Promise<StorageResult<void>>;

  /**
   * Check if the storage is available
   */
  isAvailable(): Promise<boolean>;

  /**
   * Get all keys (optionally within a namespace)
   */
  keys(namespace?: string): Promise<StorageResult<string[]>>;

  /**
   * Get the size of stored data in bytes (if available)
   */
  size(namespace?: string): Promise<StorageResult<number>>;

  /**
   * Subscribe to storage changes
   */
  subscribe?<T = unknown>(
    callback: (event: StorageChangeEvent<T>) => void,
    key?: string
  ): (() => void) | undefined;
}

/**
 * Namespaced storage interface for easier key management
 */
export interface NamespacedStorage {
  /**
   * Get a value from the current namespace
   */
  get<T = unknown>(key: string, defaultValue?: T): Promise<T | undefined>;

  /**
   * Set a value in the current namespace
   */
  set<T = unknown>(key: string, value: T): Promise<boolean>;

  /**
   * Remove a value from the current namespace
   */
  remove(key: string): Promise<boolean>;

  /**
   * Clear all values in the current namespace
   */
  clear(): Promise<boolean>;

  /**
   * Get all keys in the current namespace
   */
  keys(): Promise<string[]>;

  /**
   * Subscribe to changes in the current namespace
   */
  subscribe?<T = unknown>(
    callback: (event: StorageChangeEvent<T>) => void,
    key?: string
  ): (() => void) | undefined;

  /**
   * Get the namespace this storage is bound to
   */
  readonly namespace: string;
}

/**
 * Common storage namespaces used throughout the application
 */
export const STORAGE_NAMESPACES = {
  /** Global application settings */
  SETTINGS: 'settings',
  /** Game-specific data */
  GAMES: 'games',
  /** User progress and statistics */
  PROGRESS: 'progress',
  /** Audio and accessibility preferences */
  PREFERENCES: 'preferences',
  /** Temporary data that can be cleared */
  CACHE: 'cache',
} as const;

/**
 * Storage provider types
 */
export enum StorageProviderType {
  LOCAL_STORAGE = 'localStorage',
  INDEXED_DB = 'indexedDB',
  MEMORY = 'memory',
  SESSION_STORAGE = 'sessionStorage',
}

/**
 * Storage migration interface for version upgrades
 */
export interface StorageMigration {
  /** Version this migration targets */
  version: number;
  /** Migration function */
  migrate: (provider: StorageProvider) => Promise<void>;
  /** Description of what this migration does */
  description: string;
}

/**
 * Storage metrics interface for monitoring
 */
export interface StorageMetrics {
  /** Number of keys stored */
  keyCount: number;
  /** Total size in bytes */
  totalSize: number;
  /** Storage usage by namespace */
  namespaceUsage: Record<string, { keys: number; size: number }>;
  /** Last updated timestamp */
  lastUpdated: number;
}

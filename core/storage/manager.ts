import type {
  StorageProvider,
  StorageConfig,
  StorageChangeEvent,
  NamespacedStorage,
  StorageMetrics,
  StorageMigration,
} from './types.js';

/**
 * Main storage manager that provides a unified interface for different storage providers
 * Supports namespaces, change notifications, and provider switching
 */
export class StorageManager {
  private provider: StorageProvider;
  private config: Required<StorageConfig>;
  private listeners: Map<string, Set<(event: StorageChangeEvent) => void>> = new Map();
  private migrations: StorageMigration[] = [];

  constructor(provider: StorageProvider, config: StorageConfig = {}) {
    this.provider = provider;
    this.config = {
      namespace: '',
      autoSerialize: true,
      enableNotifications: true,
      onError: this.defaultErrorHandler,
      ...config,
    };
  }

  /**
   * Create a namespaced storage instance
   */
  namespace(namespace: string): NamespacedStorage {
    return new NamespacedStorageImpl(this, namespace);
  }

  /**
   * Get the current storage provider
   */
  getProvider(): StorageProvider {
    return this.provider;
  }

  /**
   * Switch to a different storage provider
   */
  async setProvider(provider: StorageProvider): Promise<boolean> {
    try {
      const isAvailable = await provider.isAvailable();
      if (!isAvailable) {
        this.config.onError(new Error('Storage provider is not available'), 'setProvider');
        return false;
      }

      this.provider = provider;
      return true;
    } catch (error) {
      this.config.onError(error as Error, 'setProvider');
      return false;
    }
  }

  /**
   * Get a value with optional namespace
   */
  async get<T = unknown>(key: string, namespace?: string): Promise<T | undefined> {
    const fullKey = this.buildKey(key, namespace);
    try {
      const result = await this.provider.get<T>(fullKey);
      if (result.success) {
        return result.data;
      }
      if (result.error) {
        this.config.onError(new Error(result.error), 'get', key);
      }
      return undefined;
    } catch (error) {
      this.config.onError(error as Error, 'get', key);
      return undefined;
    }
  }

  /**
   * Set a value with optional namespace
   */
  async set<T = unknown>(key: string, value: T, namespace?: string): Promise<boolean> {
    const fullKey = this.buildKey(key, namespace);
    try {
      // Get old value for change notification
      let oldValue: T | undefined;
      if (this.config.enableNotifications) {
        oldValue = await this.get<T>(key, namespace);
      }

      const result = await this.provider.set(fullKey, value);

      if (result.success && this.config.enableNotifications) {
        this.notifyChange({
          key,
          oldValue,
          newValue: value,
          namespace: namespace || this.config.namespace,
          timestamp: Date.now(),
        });
      }

      if (!result.success && result.error) {
        this.config.onError(new Error(result.error), 'set', key);
      }

      return result.success;
    } catch (error) {
      this.config.onError(error as Error, 'set', key);
      return false;
    }
  }

  /**
   * Remove a value with optional namespace
   */
  async remove(key: string, namespace?: string): Promise<boolean> {
    const fullKey = this.buildKey(key, namespace);
    try {
      // Get old value for change notification
      let oldValue: unknown;
      if (this.config.enableNotifications) {
        oldValue = await this.get(key, namespace);
      }

      const result = await this.provider.remove(fullKey);

      if (result.success && this.config.enableNotifications) {
        this.notifyChange({
          key,
          oldValue,
          newValue: undefined,
          namespace: namespace || this.config.namespace,
          timestamp: Date.now(),
        });
      }

      if (!result.success && result.error) {
        this.config.onError(new Error(result.error), 'remove', key);
      }

      return result.success;
    } catch (error) {
      this.config.onError(error as Error, 'remove', key);
      return false;
    }
  }

  /**
   * Clear all values in a namespace
   */
  async clear(namespace?: string): Promise<boolean> {
    try {
      const result = await this.provider.clear(namespace || this.config.namespace);

      if (!result.success && result.error) {
        this.config.onError(new Error(result.error), 'clear');
      }

      return result.success;
    } catch (error) {
      this.config.onError(error as Error, 'clear');
      return false;
    }
  }

  /**
   * Get all keys in a namespace
   */
  async keys(namespace?: string): Promise<string[]> {
    try {
      const result = await this.provider.keys(namespace || this.config.namespace);
      return result.success ? result.data || [] : [];
    } catch (error) {
      this.config.onError(error as Error, 'keys');
      return [];
    }
  }

  /**
   * Check if storage is available
   */
  async isAvailable(): Promise<boolean> {
    try {
      return await this.provider.isAvailable();
    } catch (error) {
      this.config.onError(error as Error, 'isAvailable');
      return false;
    }
  }

  /**
   * Subscribe to storage changes
   */
  subscribe<T = unknown>(
    callback: (event: StorageChangeEvent<T>) => void,
    key?: string,
    namespace?: string
  ): () => void {
    const listenerKey = this.buildKey(key || '*', namespace);

    if (!this.listeners.has(listenerKey)) {
      this.listeners.set(listenerKey, new Set());
    }

    this.listeners.get(listenerKey)!.add(callback as (event: StorageChangeEvent) => void);

    // Setup provider subscription if available
    let providerUnsubscribe: (() => void) | undefined;
    if (this.provider.subscribe) {
      const fullKey = key ? this.buildKey(key, namespace) : undefined;
      providerUnsubscribe = this.provider.subscribe(callback, fullKey);
    }

    // Return unsubscribe function
    return () => {
      const listeners = this.listeners.get(listenerKey);
      if (listeners) {
        listeners.delete(callback as (event: StorageChangeEvent) => void);
        if (listeners.size === 0) {
          this.listeners.delete(listenerKey);
        }
      }
      if (providerUnsubscribe) {
        providerUnsubscribe();
      }
    };
  }

  /**
   * Get storage metrics
   */
  async getMetrics(): Promise<StorageMetrics> {
    try {
      const allKeys = await this.keys();
      const namespaceUsage: Record<string, { keys: number; size: number }> = {};
      let totalSize = 0;

      // Group keys by namespace and calculate sizes
      for (const key of allKeys) {
        const [namespace] = this.parseKey(key);
        if (!namespaceUsage[namespace]) {
          namespaceUsage[namespace] = { keys: 0, size: 0 };
        }
        namespaceUsage[namespace].keys++;

        // Estimate size (this is approximate)
        const value = await this.get(key);
        const estimatedSize = this.estimateSize(value);
        namespaceUsage[namespace].size += estimatedSize;
        totalSize += estimatedSize;
      }

      return {
        keyCount: allKeys.length,
        totalSize,
        namespaceUsage,
        lastUpdated: Date.now(),
      };
    } catch (error) {
      this.config.onError(error as Error, 'getMetrics');
      return {
        keyCount: 0,
        totalSize: 0,
        namespaceUsage: {},
        lastUpdated: Date.now(),
      };
    }
  }

  /**
   * Add a migration
   */
  addMigration(migration: StorageMigration): void {
    this.migrations.push(migration);
    this.migrations.sort((a, b) => a.version - b.version);
  }

  /**
   * Run all pending migrations
   */
  async runMigrations(currentVersion: number = 0): Promise<boolean> {
    try {
      const pendingMigrations = this.migrations.filter(m => m.version > currentVersion);

      for (const migration of pendingMigrations) {
        try {
          await migration.migrate(this.provider);
          console.log(`Migration ${migration.version} completed: ${migration.description}`);
        } catch (error) {
          this.config.onError(error as Error, 'migration', migration.version.toString());
          return false;
        }
      }

      return true;
    } catch (error) {
      this.config.onError(error as Error, 'runMigrations');
      return false;
    }
  }

  /**
   * Build a full key with namespace
   */
  private buildKey(key: string, namespace?: string): string {
    const ns = namespace || this.config.namespace;
    return ns ? `${ns}:${key}` : key;
  }

  /**
   * Parse a key to extract namespace and base key
   */
  private parseKey(fullKey: string): [string, string] {
    const colonIndex = fullKey.indexOf(':');
    if (colonIndex === -1) {
      return ['', fullKey];
    }
    return [fullKey.slice(0, colonIndex), fullKey.slice(colonIndex + 1)];
  }

  /**
   * Notify listeners about storage changes
   */
  private notifyChange<T = unknown>(event: StorageChangeEvent<T>): void {
    if (!this.config.enableNotifications) return;

    // Notify specific key listeners
    const specificKey = this.buildKey(event.key, event.namespace);
    const specificListeners = this.listeners.get(specificKey);
    if (specificListeners) {
      specificListeners.forEach(callback => callback(event));
    }

    // Notify wildcard listeners
    const wildcardKey = this.buildKey('*', event.namespace);
    const wildcardListeners = this.listeners.get(wildcardKey);
    if (wildcardListeners) {
      wildcardListeners.forEach(callback => callback(event));
    }
  }

  /**
   * Estimate the size of a value in bytes
   */
  private estimateSize(value: unknown): number {
    if (value === null || value === undefined) return 0;

    try {
      const serialized = JSON.stringify(value);
      return new Blob([serialized]).size;
    } catch {
      return 0;
    }
  }

  /**
   * Default error handler
   */
  private defaultErrorHandler = (error: Error, operation: string, key?: string): void => {
    console.warn(`Storage error in ${operation}${key ? ` (key: ${key})` : ''}:`, error);
  };
}

/**
 * Implementation of NamespacedStorage
 */
class NamespacedStorageImpl implements NamespacedStorage {
  constructor(
    private manager: StorageManager,
    public readonly namespace: string
  ) {}

  async get<T = unknown>(key: string, defaultValue?: T): Promise<T | undefined> {
    const value = await this.manager.get<T>(key, this.namespace);
    return value !== undefined ? value : defaultValue;
  }

  async set<T = unknown>(key: string, value: T): Promise<boolean> {
    return this.manager.set(key, value, this.namespace);
  }

  async remove(key: string): Promise<boolean> {
    return this.manager.remove(key, this.namespace);
  }

  async clear(): Promise<boolean> {
    return this.manager.clear(this.namespace);
  }

  async keys(): Promise<string[]> {
    return this.manager.keys(this.namespace);
  }

  subscribe<T = unknown>(
    callback: (event: StorageChangeEvent<T>) => void,
    key?: string
  ): () => void {
    return this.manager.subscribe(callback, key, this.namespace);
  }
}

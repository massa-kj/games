import type { StorageProvider, StorageResult, StorageChangeEvent } from './types.js';

/**
 * IndexedDB provider implementation for larger data storage
 * Provides async storage with better performance for complex data
 */
export class IndexedDBProvider implements StorageProvider {
  private dbName: string;
  private dbVersion: number;
  private storeName: string;
  private db: IDBDatabase | null = null;
  private initPromise: Promise<void> | null = null;
  private listeners: Map<string, Set<(event: StorageChangeEvent) => void>> = new Map();

  constructor(
    dbName: string = 'GamesStorage',
    storeName: string = 'keyvalue',
    dbVersion: number = 1
  ) {
    this.dbName = dbName;
    this.dbVersion = dbVersion;
    this.storeName = storeName;
  }

  /**
   * Initialize the IndexedDB database
   */
  private async init(): Promise<void> {
    if (this.initPromise) {
      return this.initPromise;
    }

    this.initPromise = new Promise((resolve, reject) => {
      if (typeof window === 'undefined' || !window.indexedDB) {
        reject(new Error('IndexedDB is not available'));
        return;
      }

      const request = indexedDB.open(this.dbName, this.dbVersion);

      request.onerror = () => {
        reject(new Error(`Failed to open IndexedDB: ${request.error?.message}`));
      };

      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Create object store if it doesn't exist
        if (!db.objectStoreNames.contains(this.storeName)) {
          const store = db.createObjectStore(this.storeName, { keyPath: 'key' });
          store.createIndex('namespace', 'namespace', { unique: false });
          store.createIndex('timestamp', 'timestamp', { unique: false });
        }
      };
    });

    return this.initPromise;
  }

  /**
   * Get an item from IndexedDB
   */
  async get<T>(key: string): Promise<StorageResult<T>> {
    try {
      await this.init();
      if (!this.db) {
        return { success: false, error: 'Database not initialized' };
      }

      return new Promise((resolve) => {
        const transaction = this.db!.transaction([this.storeName], 'readonly');
        const store = transaction.objectStore(this.storeName);
        const request = store.get(key);

        request.onsuccess = () => {
          const result = request.result;
          resolve({
            success: true,
            data: result ? result.value : undefined,
          });
        };

        request.onerror = () => {
          resolve({
            success: false,
            error: `Failed to get item "${key}": ${request.error?.message}`,
          });
        };
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return { success: false, error: `Failed to get item "${key}": ${errorMessage}` };
    }
  }

  /**
   * Set an item in IndexedDB
   */
  async set<T>(key: string, value: T): Promise<StorageResult<void>> {
    try {
      await this.init();
      if (!this.db) {
        return { success: false, error: 'Database not initialized' };
      }

      // Parse namespace from key
      const colonIndex = key.indexOf(':');
      const namespace = colonIndex !== -1 ? key.slice(0, colonIndex) : '';

      const record = {
        key,
        value,
        namespace,
        timestamp: Date.now(),
      };

      return new Promise((resolve) => {
        const transaction = this.db!.transaction([this.storeName], 'readwrite');
        const store = transaction.objectStore(this.storeName);
        const request = store.put(record);

        request.onsuccess = () => {
          resolve({ success: true });
        };

        request.onerror = () => {
          resolve({
            success: false,
            error: `Failed to set item "${key}": ${request.error?.message}`,
          });
        };
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return { success: false, error: `Failed to set item "${key}": ${errorMessage}` };
    }
  }

  /**
   * Remove an item from IndexedDB
   */
  async remove(key: string): Promise<StorageResult<void>> {
    try {
      await this.init();
      if (!this.db) {
        return { success: false, error: 'Database not initialized' };
      }

      return new Promise((resolve) => {
        const transaction = this.db!.transaction([this.storeName], 'readwrite');
        const store = transaction.objectStore(this.storeName);
        const request = store.delete(key);

        request.onsuccess = () => {
          resolve({ success: true });
        };

        request.onerror = () => {
          resolve({
            success: false,
            error: `Failed to remove item "${key}": ${request.error?.message}`,
          });
        };
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return { success: false, error: `Failed to remove item "${key}": ${errorMessage}` };
    }
  }

  /**
   * Clear items from IndexedDB (optionally within a namespace)
   */
  async clear(namespace?: string): Promise<StorageResult<void>> {
    try {
      await this.init();
      if (!this.db) {
        return { success: false, error: 'Database not initialized' };
      }

      return new Promise((resolve) => {
        const transaction = this.db!.transaction([this.storeName], 'readwrite');
        const store = transaction.objectStore(this.storeName);

        if (namespace) {
          // Clear only items within the namespace
          const index = store.index('namespace');
          const request = index.openCursor(IDBKeyRange.only(namespace));

          request.onsuccess = (event) => {
            const cursor = (event.target as IDBRequest<IDBCursorWithValue>).result;
            if (cursor) {
              cursor.delete();
              cursor.continue();
            } else {
              resolve({ success: true });
            }
          };

          request.onerror = () => {
            resolve({
              success: false,
              error: `Failed to clear namespace "${namespace}": ${request.error?.message}`,
            });
          };
        } else {
          // Clear all items
          const request = store.clear();

          request.onsuccess = () => {
            resolve({ success: true });
          };

          request.onerror = () => {
            resolve({
              success: false,
              error: `Failed to clear IndexedDB: ${request.error?.message}`,
            });
          };
        }
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return { success: false, error: `Failed to clear IndexedDB: ${errorMessage}` };
    }
  }

  /**
   * Check if IndexedDB is available
   */
  async isAvailable(): Promise<boolean> {
    try {
      if (typeof window === 'undefined' || !window.indexedDB) {
        return false;
      }

      // Try to open a test database
      await this.init();
      return this.db !== null;
    } catch {
      return false;
    }
  }

  /**
   * Get all keys (optionally within a namespace)
   */
  async keys(namespace?: string): Promise<StorageResult<string[]>> {
    try {
      await this.init();
      if (!this.db) {
        return { success: false, error: 'Database not initialized' };
      }

      return new Promise((resolve) => {
        const transaction = this.db!.transaction([this.storeName], 'readonly');
        const store = transaction.objectStore(this.storeName);
        const keys: string[] = [];

        if (namespace) {
          // Get keys within the namespace
          const index = store.index('namespace');
          const request = index.openCursor(IDBKeyRange.only(namespace));

          request.onsuccess = (event) => {
            const cursor = (event.target as IDBRequest<IDBCursorWithValue>).result;
            if (cursor) {
              const key = cursor.value.key;
              // Strip namespace prefix
              keys.push(key.slice(namespace.length + 1));
              cursor.continue();
            } else {
              resolve({ success: true, data: keys });
            }
          };

          request.onerror = () => {
            resolve({
              success: false,
              error: `Failed to get keys: ${request.error?.message}`,
            });
          };
        } else {
          // Get all keys
          const request = store.openCursor();

          request.onsuccess = (event) => {
            const cursor = (event.target as IDBRequest<IDBCursorWithValue>).result;
            if (cursor) {
              keys.push(cursor.value.key);
              cursor.continue();
            } else {
              resolve({ success: true, data: keys });
            }
          };

          request.onerror = () => {
            resolve({
              success: false,
              error: `Failed to get keys: ${request.error?.message}`,
            });
          };
        }
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return { success: false, error: `Failed to get keys: ${errorMessage}` };
    }
  }

  /**
   * Get the size of stored data in bytes (approximate)
   */
  async size(namespace?: string): Promise<StorageResult<number>> {
    try {
      await this.init();
      if (!this.db) {
        return { success: false, error: 'Database not initialized' };
      }

      return new Promise((resolve) => {
        const transaction = this.db!.transaction([this.storeName], 'readonly');
        const store = transaction.objectStore(this.storeName);
        let totalSize = 0;

        const cursor = namespace
          ? store.index('namespace').openCursor(IDBKeyRange.only(namespace))
          : store.openCursor();

        cursor.onsuccess = (event) => {
          const result = (event.target as IDBRequest<IDBCursorWithValue>).result;
          if (result) {
            // Approximate size calculation
            const record = result.value;
            const size = new Blob([JSON.stringify(record)]).size;
            totalSize += size;
            result.continue();
          } else {
            resolve({ success: true, data: totalSize });
          }
        };

        cursor.onerror = () => {
          resolve({
            success: false,
            error: `Failed to calculate size: ${cursor.error?.message}`,
          });
        };
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return { success: false, error: `Failed to calculate size: ${errorMessage}` };
    }
  }

  /**
   * Subscribe to storage changes
   * Note: IndexedDB doesn't have built-in change notifications,
   * so this is a basic implementation for consistency
   */
  subscribe<T = unknown>(
    callback: (event: StorageChangeEvent<T>) => void,
    key?: string
  ): () => void {
    const listenerKey = key || '*';

    if (!this.listeners.has(listenerKey)) {
      this.listeners.set(listenerKey, new Set());
    }

    this.listeners.get(listenerKey)!.add(callback as (event: StorageChangeEvent) => void);

    // Return unsubscribe function
    return () => {
      const listeners = this.listeners.get(listenerKey);
      if (listeners) {
        listeners.delete(callback as (event: StorageChangeEvent) => void);
        if (listeners.size === 0) {
          this.listeners.delete(listenerKey);
        }
      }
    };
  }

  /**
   * Close the database connection
   */
  close(): void {
    if (this.db) {
      this.db.close();
      this.db = null;
    }
    this.initPromise = null;
    this.listeners.clear();
  }

  /**
   * Notify listeners about storage changes
   * This can be called manually when data changes to trigger notifications
   */
  notifyChange<T = unknown>(event: StorageChangeEvent<T>): void {
    // Notify specific key listeners
    const specificListeners = this.listeners.get(event.key);
    if (specificListeners) {
      specificListeners.forEach(callback => callback(event));
    }

    // Notify wildcard listeners
    const wildcardListeners = this.listeners.get('*');
    if (wildcardListeners) {
      wildcardListeners.forEach(callback => callback(event));
    }
  }
}

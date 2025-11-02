import type { StorageProvider, StorageResult, StorageChangeEvent } from './types.js';

/**
 * Local storage provider implementation using browser's localStorage
 * Implements the StorageProvider interface with error handling and JSON serialization
 */
export class LocalStorageProvider implements StorageProvider {
  private listeners: Map<string, Set<(event: StorageChangeEvent) => void>> = new Map();
  private storageListener?: (event: StorageEvent) => void;

  constructor() {
    this.setupStorageListener();
  }

  /**
   * Get an item from localStorage
   */
  async get<T>(key: string): Promise<StorageResult<T>> {
    try {
      const item = localStorage.getItem(key);
      if (item === null) {
        return { success: true, data: undefined };
      }
      const parsed = JSON.parse(item);
      return { success: true, data: parsed };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return { success: false, error: `Failed to get item "${key}": ${errorMessage}` };
    }
  }

  /**
   * Set an item in localStorage
   */
  async set<T>(key: string, value: T): Promise<StorageResult<void>> {
    try {
      const serialized = JSON.stringify(value);
      localStorage.setItem(key, serialized);
      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return { success: false, error: `Failed to set item "${key}": ${errorMessage}` };
    }
  }

  /**
   * Remove an item from localStorage
   */
  async remove(key: string): Promise<StorageResult<void>> {
    try {
      localStorage.removeItem(key);
      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return { success: false, error: `Failed to remove item "${key}": ${errorMessage}` };
    }
  }

  /**
   * Clear items from localStorage (optionally within a namespace)
   */
  async clear(namespace?: string): Promise<StorageResult<void>> {
    try {
      if (namespace) {
        // Clear only items within the namespace
        const keysToRemove: string[] = [];
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && key.startsWith(`${namespace}:`)) {
            keysToRemove.push(key);
          }
        }
        keysToRemove.forEach(key => localStorage.removeItem(key));
      } else {
        // Clear all items
        localStorage.clear();
      }
      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return { success: false, error: `Failed to clear localStorage: ${errorMessage}` };
    }
  }

  /**
   * Check if localStorage is available
   */
  async isAvailable(): Promise<boolean> {
    try {
      const testKey = '__localStorage_test__';
      localStorage.setItem(testKey, 'test');
      localStorage.removeItem(testKey);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get all keys (optionally within a namespace)
   */
  async keys(namespace?: string): Promise<StorageResult<string[]>> {
    try {
      const allKeys: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key) {
          if (namespace) {
            // Return only keys within the namespace, stripped of namespace prefix
            if (key.startsWith(`${namespace}:`)) {
              allKeys.push(key.slice(namespace.length + 1));
            }
          } else {
            allKeys.push(key);
          }
        }
      }
      return { success: true, data: allKeys };
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
      let totalSize = 0;

      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key) {
          const shouldCount = namespace ? key.startsWith(`${namespace}:`) : true;
          if (shouldCount) {
            const value = localStorage.getItem(key);
            if (value) {
              // Approximate size calculation (key + value)
              totalSize += new Blob([key + value]).size;
            }
          }
        }
      }

      return { success: true, data: totalSize };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      return { success: false, error: `Failed to calculate size: ${errorMessage}` };
    }
  }

  /**
   * Subscribe to storage changes
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
   * Setup listener for storage events from other tabs/windows
   */
  private setupStorageListener(): void {
    if (typeof window === 'undefined') return;

    this.storageListener = (event: StorageEvent) => {
      if (event.storageArea !== localStorage) return;

      const changeEvent: StorageChangeEvent = {
        key: event.key || '',
        oldValue: event.oldValue ? this.safeParse(event.oldValue) : undefined,
        newValue: event.newValue ? this.safeParse(event.newValue) : undefined,
        timestamp: Date.now(),
      };

      // Parse namespace from key
      const colonIndex = changeEvent.key.indexOf(':');
      if (colonIndex !== -1) {
        changeEvent.namespace = changeEvent.key.slice(0, colonIndex);
        changeEvent.key = changeEvent.key.slice(colonIndex + 1);
      }

      // Notify specific key listeners
      const specificListeners = this.listeners.get(changeEvent.key);
      if (specificListeners) {
        specificListeners.forEach(callback => callback(changeEvent));
      }

      // Notify wildcard listeners
      const wildcardListeners = this.listeners.get('*');
      if (wildcardListeners) {
        wildcardListeners.forEach(callback => callback(changeEvent));
      }
    };

    window.addEventListener('storage', this.storageListener);
  }

  /**
   * Safely parse JSON with fallback
   */
  private safeParse(value: string): unknown {
    try {
      return JSON.parse(value);
    } catch {
      return value;
    }
  }

  /**
   * Clean up listeners
   */
  destroy(): void {
    if (this.storageListener && typeof window !== 'undefined') {
      window.removeEventListener('storage', this.storageListener);
    }
    this.listeners.clear();
  }
}

/**
 * Legacy LocalStorage class for backward compatibility
 * @deprecated Use LocalStorageProvider with StorageManager instead
 */
export class LocalStorage {
  private static provider = new LocalStorageProvider();

  /**
   * Get an item from localStorage
   */
  static get<T>(key: string, defaultValue?: T): T | undefined {
    try {
      const item = localStorage.getItem(key);
      if (item === null) return defaultValue;
      return JSON.parse(item);
    } catch (error) {
      console.warn(`Failed to get item "${key}" from localStorage:`, error);
      return defaultValue;
    }
  }

  /**
   * Set an item in localStorage
   */
  static set<T>(key: string, value: T): boolean {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      console.warn(`Failed to set item "${key}" in localStorage:`, error);
      return false;
    }
  }

  /**
   * Remove an item from localStorage
   */
  static remove(key: string): boolean {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.warn(`Failed to remove item "${key}" from localStorage:`, error);
      return false;
    }
  }

  /**
   * Clear all items from localStorage
   */
  static clear(): boolean {
    try {
      localStorage.clear();
      return true;
    } catch (error) {
      console.warn('Failed to clear localStorage:', error);
      return false;
    }
  }

  /**
   * Check if localStorage is available
   */
  static isAvailable(): boolean {
    try {
      const testKey = '__localStorage_test__';
      localStorage.setItem(testKey, 'test');
      localStorage.removeItem(testKey);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get the modern provider instance
   */
  static getProvider(): LocalStorageProvider {
    return this.provider;
  }
}

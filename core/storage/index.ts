// Legacy export for backward compatibility
export { LocalStorage } from './local.js';

// Modern storage system exports
export * from './types.js';
export { StorageManager } from './manager.js';
export { LocalStorageProvider } from './local.js';
export { IndexedDBProvider } from './indexeddb.js';
export {
  createSettingsStorage,
  createGameStorage,
  createCacheStorage,
  createPreferencesStorage,
  StorageFactory,
  DEFAULT_APP_SETTINGS,
  DEFAULT_USER_PROGRESS,
} from './helpers.js';
export type {
  Lang,
  AppSettings,
  GameSettings,
  UserProgress,
  CacheEntry,
} from './helpers.js';

// Default storage instance factory
import { StorageManager } from './manager.js';
import { LocalStorageProvider } from './local.js';
import { StorageFactory } from './helpers.js';

/**
 * Create a default storage instance using localStorage
 */
export function createDefaultStorage(): StorageFactory {
  const provider = new LocalStorageProvider();
  const manager = new StorageManager(provider, {
    namespace: 'games',
    enableNotifications: true,
  });
  return new StorageFactory(manager);
}

/**
 * Create a storage instance with custom configuration
 */
export function createStorage(
  provider: LocalStorageProvider | any,
  options?: {
    namespace?: string;
    enableNotifications?: boolean;
  }
): StorageFactory {
  const manager = new StorageManager(provider, {
    namespace: 'games',
    enableNotifications: true,
    ...options,
  });
  return new StorageFactory(manager);
}

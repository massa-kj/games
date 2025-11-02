import { describe, it, expect, beforeEach, vi } from 'vitest';
import { LocalStorage } from './local.js';

// Mock localStorage
const createMockStorage = () => {
  const store: Record<string, string> = {};

  return {
    getItem: vi.fn((key: string) => store[key] || null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      Object.keys(store).forEach(key => delete store[key]);
    }),
    get length() {
      return Object.keys(store).length;
    },
    key: vi.fn((index: number) => {
      const keys = Object.keys(store);
      return keys[index] || null;
    })
  };
};

describe('LocalStorage', () => {
  let mockStorage: ReturnType<typeof createMockStorage>;

  beforeEach(() => {
    mockStorage = createMockStorage();
    Object.defineProperty(global, 'localStorage', {
      value: mockStorage,
      writable: true
    });

    // Clear console.warn mocks
    vi.clearAllMocks();
    vi.spyOn(console, 'warn').mockImplementation(() => { });
  });

  describe('get', () => {
    it('should return parsed JSON value for existing key', () => {
      const testData = { name: 'test', value: 42 };
      mockStorage.setItem('testKey', JSON.stringify(testData));

      const result = LocalStorage.get('testKey');

      expect(result).toEqual(testData);
      expect(mockStorage.getItem).toHaveBeenCalledWith('testKey');
    });

    it('should return default value when key does not exist', () => {
      const defaultValue = { default: true };

      const result = LocalStorage.get('nonExistentKey', defaultValue);

      expect(result).toEqual(defaultValue);
      expect(mockStorage.getItem).toHaveBeenCalledWith('nonExistentKey');
    });

    it('should return undefined when key does not exist and no default provided', () => {
      const result = LocalStorage.get('nonExistentKey');

      expect(result).toBeUndefined();
    });

    it('should return default value when JSON parsing fails', () => {
      const defaultValue = { safe: true };
      mockStorage.setItem('invalidJson', 'invalid json string');

      const result = LocalStorage.get('invalidJson', defaultValue);

      expect(result).toEqual(defaultValue);
      expect(console.warn).toHaveBeenCalledWith(
        'Failed to get item "invalidJson" from localStorage:',
        expect.any(Error)
      );
    });

    it('should handle localStorage.getItem throwing an error', () => {
      const defaultValue = { error: true };
      mockStorage.getItem.mockImplementation(() => {
        throw new Error('Storage quota exceeded');
      });

      const result = LocalStorage.get('testKey', defaultValue);

      expect(result).toEqual(defaultValue);
      expect(console.warn).toHaveBeenCalledWith(
        'Failed to get item "testKey" from localStorage:',
        expect.any(Error)
      );
    });

    it('should work with primitive values', () => {
      mockStorage.setItem('stringKey', JSON.stringify('hello'));
      mockStorage.setItem('numberKey', JSON.stringify(123));
      mockStorage.setItem('booleanKey', JSON.stringify(true));

      expect(LocalStorage.get('stringKey')).toBe('hello');
      expect(LocalStorage.get('numberKey')).toBe(123);
      expect(LocalStorage.get('booleanKey')).toBe(true);
    });
  });

  describe('set', () => {
    it('should store value as JSON string and return true', () => {
      const testData = { name: 'test', value: 42 };

      const result = LocalStorage.set('testKey', testData);

      expect(result).toBe(true);
      expect(mockStorage.setItem).toHaveBeenCalledWith('testKey', JSON.stringify(testData));
    });

    it('should return false and log warning when setItem throws error', () => {
      const testData = { data: 'test' };
      mockStorage.setItem.mockImplementation(() => {
        throw new Error('Storage quota exceeded');
      });

      const result = LocalStorage.set('testKey', testData);

      expect(result).toBe(false);
      expect(console.warn).toHaveBeenCalledWith(
        'Failed to set item "testKey" in localStorage:',
        expect.any(Error)
      );
    });

    it('should handle primitive values', () => {
      expect(LocalStorage.set('stringKey', 'hello')).toBe(true);
      expect(LocalStorage.set('numberKey', 123)).toBe(true);
      expect(LocalStorage.set('booleanKey', false)).toBe(true);
      expect(LocalStorage.set('nullKey', null)).toBe(true);

      expect(mockStorage.setItem).toHaveBeenCalledWith('stringKey', '"hello"');
      expect(mockStorage.setItem).toHaveBeenCalledWith('numberKey', '123');
      expect(mockStorage.setItem).toHaveBeenCalledWith('booleanKey', 'false');
      expect(mockStorage.setItem).toHaveBeenCalledWith('nullKey', 'null');
    });

    it('should handle complex objects and arrays', () => {
      const complexObject = {
        nested: { value: 'test' },
        array: [1, 2, 3],
        date: new Date('2023-01-01').toISOString()
      };

      const result = LocalStorage.set('complexKey', complexObject);

      expect(result).toBe(true);
      expect(mockStorage.setItem).toHaveBeenCalledWith('complexKey', JSON.stringify(complexObject));
    });
  });

  describe('remove', () => {
    it('should remove item and return true', () => {
      mockStorage.setItem('testKey', 'test value');

      const result = LocalStorage.remove('testKey');

      expect(result).toBe(true);
      expect(mockStorage.removeItem).toHaveBeenCalledWith('testKey');
    });

    it('should return false and log warning when removeItem throws error', () => {
      mockStorage.removeItem.mockImplementation(() => {
        throw new Error('Access denied');
      });

      const result = LocalStorage.remove('testKey');

      expect(result).toBe(false);
      expect(console.warn).toHaveBeenCalledWith(
        'Failed to remove item "testKey" from localStorage:',
        expect.any(Error)
      );
    });

    it('should handle removing non-existent keys gracefully', () => {
      const result = LocalStorage.remove('nonExistentKey');

      expect(result).toBe(true);
      expect(mockStorage.removeItem).toHaveBeenCalledWith('nonExistentKey');
    });
  });

  describe('clear', () => {
    it('should clear all items and return true', () => {
      mockStorage.setItem('key1', 'value1');
      mockStorage.setItem('key2', 'value2');

      const result = LocalStorage.clear();

      expect(result).toBe(true);
      expect(mockStorage.clear).toHaveBeenCalled();
      expect(mockStorage.length).toBe(0);
    });

    it('should return false and log warning when clear throws error', () => {
      mockStorage.clear.mockImplementation(() => {
        throw new Error('Access denied');
      });

      const result = LocalStorage.clear();

      expect(result).toBe(false);
      expect(console.warn).toHaveBeenCalledWith(
        'Failed to clear localStorage:',
        expect.any(Error)
      );
    });
  });

  describe('isAvailable', () => {
    it('should return true when localStorage is available', () => {
      const result = LocalStorage.isAvailable();

      expect(result).toBe(true);
      expect(mockStorage.setItem).toHaveBeenCalledWith('__localStorage_test__', 'test');
      expect(mockStorage.removeItem).toHaveBeenCalledWith('__localStorage_test__');
    });

    it('should return false when localStorage setItem throws error', () => {
      mockStorage.setItem.mockImplementation(() => {
        throw new Error('Storage not available');
      });

      const result = LocalStorage.isAvailable();

      expect(result).toBe(false);
    });

    it('should return false when localStorage removeItem throws error', () => {
      mockStorage.removeItem.mockImplementation(() => {
        throw new Error('Storage not available');
      });

      const result = LocalStorage.isAvailable();

      expect(result).toBe(false);
    });

    it('should clean up test key even if available', () => {
      LocalStorage.isAvailable();

      expect(mockStorage.setItem).toHaveBeenCalledWith('__localStorage_test__', 'test');
      expect(mockStorage.removeItem).toHaveBeenCalledWith('__localStorage_test__');
    });
  });

  describe('integration tests', () => {
    it('should handle complete workflow: set, get, remove', () => {
      const testData = { workflow: 'test', steps: ['set', 'get', 'remove'] };

      // Set
      const setResult = LocalStorage.set('workflowKey', testData);
      expect(setResult).toBe(true);

      // Get
      const getData = LocalStorage.get('workflowKey');
      expect(getData).toEqual(testData);

      // Remove
      const removeResult = LocalStorage.remove('workflowKey');
      expect(removeResult).toBe(true);

      // Verify removed
      const removedData = LocalStorage.get('workflowKey', 'default');
      expect(removedData).toBe('default');
    });

    it('should handle multiple keys independently', () => {
      const data1 = { key: 'data1' };
      const data2 = { key: 'data2' };

      LocalStorage.set('key1', data1);
      LocalStorage.set('key2', data2);

      expect(LocalStorage.get('key1')).toEqual(data1);
      expect(LocalStorage.get('key2')).toEqual(data2);

      LocalStorage.remove('key1');

      expect(LocalStorage.get('key1')).toBeUndefined();
      expect(LocalStorage.get('key2')).toEqual(data2);
    });

    it('should preserve data types through serialization cycle', () => {
      const testCases = [
        { key: 'string', value: 'hello world' },
        { key: 'number', value: 42.5 },
        { key: 'boolean', value: true },
        { key: 'null', value: null },
        { key: 'array', value: [1, 'two', { three: 3 }] },
        { key: 'object', value: { nested: { deep: { value: 'found' } } } }
      ];

      testCases.forEach(({ key, value }) => {
        LocalStorage.set(key, value);
        const retrieved = LocalStorage.get(key);
        expect(retrieved).toEqual(value);
      });
    });
  });

  describe('edge cases', () => {
    it('should handle empty string keys', () => {
      const result = LocalStorage.set('', 'empty key value');
      expect(result).toBe(true);

      const retrieved = LocalStorage.get('');
      expect(retrieved).toBe('empty key value');
    });

    it('should handle undefined as a value', () => {
      const result = LocalStorage.set('undefinedKey', undefined);
      expect(result).toBe(true);

      const retrieved = LocalStorage.get('undefinedKey');
      expect(retrieved).toBeUndefined();
    });

    it('should handle very large objects', () => {
      const largeObject = {
        data: new Array(1000).fill(0).map((_, i) => ({ index: i, value: `item-${i}` }))
      };

      const result = LocalStorage.set('largeObject', largeObject);
      expect(result).toBe(true);

      const retrieved = LocalStorage.get('largeObject');
      expect(retrieved).toEqual(largeObject);
    });

    it('should handle special characters in keys', () => {
      const specialKeys = [
        'key with spaces',
        'key-with-dashes',
        'key_with_underscores',
        'key.with.dots',
        'key/with/slashes',
        'キー日本語',
        '🔑emoji-key'
      ];

      specialKeys.forEach(key => {
        const value = `value for ${key}`;
        LocalStorage.set(key, value);
        expect(LocalStorage.get(key)).toBe(value);
      });
    });
  });
});

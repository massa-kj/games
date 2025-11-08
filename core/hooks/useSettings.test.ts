import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useSettings } from './useSettings.js';
import type { Settings } from '../types.js';

// Mock dependencies
vi.mock('../i18n/i18n.js', () => ({
  changeLanguage: vi.fn(),
}));

vi.mock('../audio/soundManager.js', () => ({
  soundManager: {
    setEnabled: vi.fn(),
  },
}));

// Mock localStorage
const mockLocalStorage = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
  length: 0,
  key: vi.fn(),
};

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage,
  writable: true,
});

describe('useSettings', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset localStorage mock
    mockLocalStorage.getItem.mockReturnValue(null);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('initialization', () => {
    it('should initialize with default settings when localStorage is empty', () => {
      mockLocalStorage.getItem.mockReturnValue(null);

      const { result } = renderHook(() => useSettings());

      expect(result.current.settings).toEqual({
        lang: 'en',
        sound: true,
      });
    });

    it('should load settings from localStorage when available', () => {
      const storedSettings: Settings = {
        lang: 'ja',
        sound: false,
      };
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(storedSettings));

      const { result } = renderHook(() => useSettings());

      expect(result.current.settings).toEqual(storedSettings);
      expect(mockLocalStorage.getItem).toHaveBeenCalledWith('settings');
    });

    it('should merge stored settings with defaults', () => {
      // Only store partial settings
      const partialSettings = { lang: 'ja' as const };
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify(partialSettings));

      const { result } = renderHook(() => useSettings());

      expect(result.current.settings).toEqual({
        lang: 'ja',
        sound: true, // default value
      });
    });

    it('should use defaults when localStorage contains invalid JSON', () => {
      mockLocalStorage.getItem.mockReturnValue('invalid json');
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => { });

      const { result } = renderHook(() => useSettings());

      expect(result.current.settings).toEqual({
        lang: 'en',
        sound: true,
      });
      expect(consoleSpy).toHaveBeenCalledWith('Failed to load settings:', expect.any(Error));
    });

    it('should handle localStorage getItem throwing error', () => {
      mockLocalStorage.getItem.mockImplementation(() => {
        throw new Error('Storage error');
      });
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => { });

      const { result } = renderHook(() => useSettings());

      expect(result.current.settings).toEqual({
        lang: 'en',
        sound: true,
      });
      expect(consoleSpy).toHaveBeenCalledWith('Failed to load settings:', expect.any(Error));
    });
  });

  describe('settings persistence and side effects', () => {
    it('should save settings to localStorage when settings change', async () => {
      const { result } = renderHook(() => useSettings());

      await act(async () => {
        result.current.updateSettings({ lang: 'ja' });
      });

      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        'settings',
        JSON.stringify({ lang: 'ja', sound: true })
      );
    });

    it('should call changeLanguage when language changes', async () => {
      const { changeLanguage } = await import('../i18n/i18n.js');
      const { result } = renderHook(() => useSettings());

      await act(async () => {
        result.current.setLanguage('ja');
      });

      expect(changeLanguage).toHaveBeenCalledWith('ja');
    });

    it('should call soundManager.setEnabled when sound setting changes', async () => {
      const { soundManager } = await import('../audio/soundManager.js');
      const { result } = renderHook(() => useSettings());

      await act(async () => {
        result.current.toggleSound();
      });

      expect(soundManager.setEnabled).toHaveBeenCalledWith(false);
    });

    it('should handle localStorage setItem errors gracefully', async () => {
      mockLocalStorage.setItem.mockImplementation(() => {
        throw new Error('Storage full');
      });
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => { });

      const { result } = renderHook(() => useSettings());

      await act(async () => {
        result.current.updateSettings({ lang: 'ja' });
      });

      expect(consoleSpy).toHaveBeenCalledWith('Failed to save settings:', expect.any(Error));
    });
  });

  describe('updateSettings', () => {
    it('should update settings with partial object', async () => {
      const { result } = renderHook(() => useSettings());

      await act(async () => {
        result.current.updateSettings({ lang: 'ja' });
      });

      expect(result.current.settings).toEqual({
        lang: 'ja',
        sound: true,
      });
    });

    it('should merge multiple partial updates', async () => {
      const { result } = renderHook(() => useSettings());

      await act(async () => {
        result.current.updateSettings({ lang: 'ja' });
      });

      await act(async () => {
        result.current.updateSettings({ sound: false });
      });

      expect(result.current.settings).toEqual({
        lang: 'ja',
        sound: false,
      });
    });

    it('should handle empty partial object', async () => {
      const { result } = renderHook(() => useSettings());
      const initialSettings = result.current.settings;

      await act(async () => {
        result.current.updateSettings({});
      });

      expect(result.current.settings).toEqual(initialSettings);
    });
  });

  describe('setLanguage', () => {
    it('should update language setting', async () => {
      const { result } = renderHook(() => useSettings());

      await act(async () => {
        result.current.setLanguage('ja');
      });

      expect(result.current.settings.lang).toBe('ja');
    });

    it('should work with English language', async () => {
      const { result } = renderHook(() => useSettings());

      // Start with Japanese
      await act(async () => {
        result.current.setLanguage('ja');
      });

      // Switch back to English
      await act(async () => {
        result.current.setLanguage('en');
      });

      expect(result.current.settings.lang).toBe('en');
    });
  });

  describe('toggleSound', () => {
    it('should toggle sound from true to false', async () => {
      const { result } = renderHook(() => useSettings());

      // Initially sound should be true
      expect(result.current.settings.sound).toBe(true);

      await act(async () => {
        result.current.toggleSound();
      });

      expect(result.current.settings.sound).toBe(false);
    });

    it('should toggle sound from false to true', async () => {
      // Start with sound disabled
      mockLocalStorage.getItem.mockReturnValue(JSON.stringify({ lang: 'en', sound: false }));

      const { result } = renderHook(() => useSettings());
      expect(result.current.settings.sound).toBe(false);

      await act(async () => {
        result.current.toggleSound();
      });

      expect(result.current.settings.sound).toBe(true);
    });

    it('should toggle multiple times correctly', async () => {
      const { result } = renderHook(() => useSettings());

      // Toggle off
      await act(async () => {
        result.current.toggleSound();
      });
      expect(result.current.settings.sound).toBe(false);

      // Toggle on
      await act(async () => {
        result.current.toggleSound();
      });
      expect(result.current.settings.sound).toBe(true);

      // Toggle off again
      await act(async () => {
        result.current.toggleSound();
      });
      expect(result.current.settings.sound).toBe(false);
    });
  });

  describe('integration', () => {
    it('should handle complete settings workflow', async () => {
      const { changeLanguage } = await import('../i18n/i18n.js');
      const { soundManager } = await import('../audio/soundManager.js');

      const { result } = renderHook(() => useSettings());

      // Update multiple settings
      await act(async () => {
        result.current.updateSettings({ lang: 'ja', sound: false });
      });

      expect(result.current.settings).toEqual({ lang: 'ja', sound: false });
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        'settings',
        JSON.stringify({ lang: 'ja', sound: false })
      );
      expect(changeLanguage).toHaveBeenCalledWith('ja');
      expect(soundManager.setEnabled).toHaveBeenCalledWith(false);
    });

    it('should apply all side effects on initial load', async () => {
      const { changeLanguage } = await import('../i18n/i18n.js');
      const { soundManager } = await import('../audio/soundManager.js');

      mockLocalStorage.getItem.mockReturnValue(JSON.stringify({ lang: 'ja', sound: false }));

      renderHook(() => useSettings());

      // Side effects should be applied during initialization
      expect(changeLanguage).toHaveBeenCalledWith('ja');
      expect(soundManager.setEnabled).toHaveBeenCalledWith(false);
    });
  });
});

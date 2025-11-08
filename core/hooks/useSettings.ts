import { useState, useEffect } from 'react';
import type { Settings, Lang } from '../types.js';
import { changeLanguage } from '../i18n/i18n.js';
import { soundManager } from '../audio/soundManager.js';

const DEFAULT_SETTINGS: Settings = {
  lang: 'en',
  sound: true,
};

export function useSettings() {
  const [settings, setSettings] = useState<Settings>(() => {
    try {
      const stored = localStorage.getItem('settings');
      if (stored) {
        const parsed = JSON.parse(stored);
        return { ...DEFAULT_SETTINGS, ...parsed };
      }
    } catch (error) {
      console.warn('Failed to load settings:', error);
    }
    return DEFAULT_SETTINGS;
  });

  // Sync settings to localStorage and apply changes
  useEffect(() => {
    try {
      localStorage.setItem('settings', JSON.stringify(settings));

      // Apply language change
      changeLanguage(settings.lang);

      // Apply sound setting
      soundManager.setEnabled(settings.sound);
    } catch (error) {
      console.warn('Failed to save settings:', error);
    }
  }, [settings]);

  const updateSettings = (partial: Partial<Settings>) => {
    setSettings(prev => ({ ...prev, ...partial }));
  };

  const setLanguage = (lang: Lang) => {
    updateSettings({ lang });
  };

  const toggleSound = () => {
    updateSettings({ sound: !settings.sound });
  };

  return {
    settings,
    updateSettings,
    setLanguage,
    toggleSound,
  };
}

import { createDefaultStorage } from '@core/storage';
import type { RGB, SavedColor, ColorMixerGameData } from '@/types';

// Create a storage instance for color-mixer using generic namespace
const storage = createDefaultStorage();
const gameStorage = storage.namespace('games:color-mixer');

// Default game data
const defaultGameData: ColorMixerGameData = {
  savedColors: [],
  stats: {
    totalMixes: 0,
    uniqueColorsCreated: 0,
    lastPlayedAt: Date.now(),
  },
};

/**
 * Get saved colors from storage
 */
export async function getSavedColors(): Promise<SavedColor[]> {
  try {
    const gameData = await gameStorage.get<ColorMixerGameData>('data', defaultGameData);
    return gameData?.savedColors || [];
  } catch (error) {
    console.warn('Failed to load saved colors:', error);
    return [];
  }
}

/**
 * Save a color to a specific slot or add to the end
 */
export async function saveColor(rgb: RGB, slotIndex?: number): Promise<SavedColor | null> {
  try {
    const gameData = await gameStorage.get<ColorMixerGameData>('data', defaultGameData);
    const savedColors = [...(gameData?.savedColors || [])];

    const newColor: SavedColor = {
      id: `color-${Date.now()}`,
      rgb,
      createdAt: Date.now(),
    };

    if (slotIndex !== undefined && slotIndex >= 0 && slotIndex < 3) {
      // Save to specific slot
      savedColors[slotIndex] = newColor;
    } else {
      // Add to end and keep only last 3
      savedColors.push(newColor);
      savedColors.splice(0, savedColors.length - 3);
    }

    const updated: ColorMixerGameData = {
      ...gameData!,
      savedColors,
      stats: {
        ...(gameData?.stats || defaultGameData.stats!),
        uniqueColorsCreated: (gameData?.stats?.uniqueColorsCreated || 0) + 1,
        lastPlayedAt: Date.now(),
      }
    };

    const success = await gameStorage.set('data', updated);
    return success ? newColor : null;
  } catch (error) {
    console.warn('Failed to save color:', error);
    return null;
  }
}

/**
 * Clear all saved colors
 */
export async function clearSavedColors(): Promise<void> {
  try {
    const gameData = await gameStorage.get<ColorMixerGameData>('data', defaultGameData);
    const updated: ColorMixerGameData = { ...gameData!, savedColors: [] };
    await gameStorage.set('data', updated);
  } catch (error) {
    console.warn('Failed to clear saved colors:', error);
  }
}

/**
 * Remove a specific saved color
 */
export async function removeSavedColor(id: string): Promise<void> {
  try {
    const gameData = await gameStorage.get<ColorMixerGameData>('data', defaultGameData);
    const savedColors = (gameData?.savedColors || []).filter(color => color.id !== id);
    const updated: ColorMixerGameData = { ...gameData!, savedColors };
    await gameStorage.set('data', updated);
  } catch (error) {
    console.warn('Failed to remove saved color:', error);
  }
}

/**
 * Update mixing statistics
 */
export async function updateMixingStats(): Promise<void> {
  try {
    const gameData = await gameStorage.get<ColorMixerGameData>('data', defaultGameData);
    const updated: ColorMixerGameData = {
      ...gameData!,
      stats: {
        ...(gameData?.stats || defaultGameData.stats!),
        totalMixes: (gameData?.stats?.totalMixes || 0) + 1,
        lastPlayedAt: Date.now(),
      }
    };
    await gameStorage.set('data', updated);
  } catch (error) {
    console.warn('Failed to update mixing stats:', error);
  }
}

/**
 * Get game statistics
 */
export async function getGameStats(): Promise<ColorMixerGameData['stats']> {
  try {
    const gameData = await gameStorage.get<ColorMixerGameData>('data', defaultGameData);
    return gameData?.stats || defaultGameData.stats!;
  } catch (error) {
    console.warn('Failed to get game stats:', error);
    return defaultGameData.stats!;
  }
}

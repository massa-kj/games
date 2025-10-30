import type { RGB, SavedColor } from '@/types';

const STORAGE_KEY = 'color-mixer-saved-colors';
const MAX_SAVED_COLORS = 2;

/**
 * Get saved colors from localStorage
 */
export function getSavedColors(): SavedColor[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];

    const colors = JSON.parse(stored);
    return colors.map((color: any) => ({
      ...color,
      createdAt: new Date(color.createdAt),
    }));
  } catch (error) {
    console.warn('Failed to load saved colors:', error);
    return [];
  }
}

/**
 * Save a color (max 2 colors, overwrite style)
 */
export function saveColor(rgb: RGB): SavedColor {
  const savedColors = getSavedColors();

  const newColor: SavedColor = {
    id: `color-${Date.now()}`,
    rgb,
    createdAt: new Date(),
  };

  // Add newest color to the front and remove excess colors
  const updatedColors = [newColor, ...savedColors].slice(0, MAX_SAVED_COLORS);

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedColors));
  } catch (error) {
    console.warn('Failed to save color:', error);
  }

  return newColor;
}

/**
 * Clear all saved colors
 */
export function clearSavedColors(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.warn('Failed to clear saved colors:', error);
  }
}

/**
 * Remove a specific saved color
 */
export function removeSavedColor(id: string): void {
  const savedColors = getSavedColors();
  const filteredColors = savedColors.filter(color => color.id !== id);

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filteredColors));
  } catch (error) {
    console.warn('Failed to remove saved color:', error);
  }
}

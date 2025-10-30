import { useState, useEffect, useCallback } from 'react';
import { GameHeader, Card } from '@core/ui';
import { useSettings } from '@core/hooks';
import '@/styles.css';

// Import translations
import enTranslations from '@/data/locales/en.json';
import jaTranslations from '@/data/locales/ja.json';

// Import components
import ColorPalette from '@/components/ColorPalette';
import ColorMixer from '@/components/ColorMixer';

// Import types and utilities
import type { ColorDefinition, ColorMixerState, GameTranslations } from '@/types';
import { PRIMARY_COLORS, mixColors } from '@/utils/colorUtils';
import { getSavedColors, saveColor, clearSavedColors } from '@/utils/storage';
import { useColorMixerSounds } from '@/hooks/useColorMixerSounds';

export default function ColorMixerApp() {
  const { settings } = useSettings();
  const currentLang = settings.lang;
  const translations = (currentLang === 'en' ? enTranslations : jaTranslations) as GameTranslations;

  const sounds = useColorMixerSounds();

  // Game state
  const [gameState, setGameState] = useState<ColorMixerState>({
    selectedColors: [],
    savedColors: [],
    isAnimating: false,
    mixedColor: null,
  });

  // Initialize saved colors
  useEffect(() => {
    const saved = getSavedColors();
    setGameState(prev => ({ ...prev, savedColors: saved }));
  }, []);

  // Select color
  const handleColorSelect = useCallback(async (color: ColorDefinition) => {
    if (gameState.isAnimating) return;

    await sounds.playClickSound();

    setGameState(prev => {
      const selected = [...prev.selectedColors];

      // If color is already selected, deselect it
      const existingIndex = selected.findIndex(c => c.name === color.name);
      if (existingIndex !== -1) {
        selected.splice(existingIndex, 1);
      } else {
        // Select new color (max 2 colors)
        if (selected.length >= 2) {
          selected.shift(); // Remove first color
        }
        selected.push(color);
      }

      return {
        ...prev,
        selectedColors: selected,
        mixedColor: null, // Reset mixed result when selection changes
      };
    });
  }, [gameState.isAnimating, sounds]);

  // Mix colors
  const handleMixColors = useCallback(async () => {
    if (gameState.selectedColors.length !== 2 || gameState.isAnimating) return;

    setGameState(prev => ({ ...prev, isAnimating: true }));

    // Play mixing sound
    await sounds.playMixSound();

    // Animation timing (synced with sound)
    setTimeout(async () => {
      const [color1, color2] = gameState.selectedColors;
      const mixed = mixColors(color1.rgb, color2.rgb);

      await sounds.playSuccessSound();

      setGameState(prev => ({
        ...prev,
        mixedColor: mixed,
        isAnimating: false,
      }));
    }, 800);
  }, [gameState.selectedColors, gameState.isAnimating, sounds]);

  // Save color
  const handleSaveColor = useCallback(async () => {
    if (!gameState.mixedColor) return;

    const saved = saveColor(gameState.mixedColor);
    await sounds.playSaveSound();

    setGameState(prev => ({
      ...prev,
      savedColors: [saved, ...prev.savedColors].slice(0, 2), // Max 2 colors
    }));

    // Show notification message (simple implementation)
    const message = translations.colorSaved;
    console.log(message); // In a real app, use toast notification
  }, [gameState.mixedColor, sounds, translations]);

  // Clear selection
  const handleClearSelection = useCallback(() => {
    setGameState(prev => ({
      ...prev,
      selectedColors: [],
      mixedColor: null,
    }));
  }, []);

  // Clear saved colors
  const handleClearSaved = useCallback(() => {
    clearSavedColors();
    setGameState(prev => ({ ...prev, savedColors: [] }));
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50">
      <GameHeader />

      <main className="container mx-auto px-4 py-6 max-w-4xl">
        {/* Game title */}
        <div className="text-center mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-2">
            {translations.title}
          </h1>
          <p className="text-lg text-gray-600">
            {translations.description}
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Color palette */}
          <Card className="order-2 lg:order-1" padding="lg">
            <ColorPalette
              primaryColors={PRIMARY_COLORS}
              savedColors={gameState.savedColors}
              selectedColors={gameState.selectedColors}
              onColorSelect={handleColorSelect}
              onClearSaved={handleClearSaved}
              translations={translations}
            />
          </Card>

          {/* Color mixer */}
          <Card className="order-1 lg:order-2" padding="lg">
            <ColorMixer
              selectedColors={gameState.selectedColors}
              mixedColor={gameState.mixedColor}
              isAnimating={gameState.isAnimating}
              onMix={handleMixColors}
              onSaveColor={handleSaveColor}
              onClearSelection={handleClearSelection}
              translations={translations}
            />
          </Card>
        </div>
      </main>
    </div>
  );
}

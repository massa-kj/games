import { useState, useEffect, useCallback } from 'react';
import { GameHeader, Card, DragManagerProvider } from '@core/ui';
import { useSettings } from '@core/hooks';
import '@/styles.css';

// Import translations
import enTranslations from '@/data/locales/en.json';
import jaTranslations from '@/data/locales/ja.json';

// Import components
import { IntegratedColorMixer } from '@/components/IntegratedColorMixer';

// Import types and utilities
import type { ColorMixerState, GameTranslations, RGB } from '@/types';
import { getSavedColors } from '@/utils/storage';
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

  // Save color (updated for 3 slots)
  const handleSaveColor = useCallback((color: RGB, slotIndex?: number) => {
    setGameState(prev => {
      const newSavedColors = [...prev.savedColors];
      const savedColor = {
        id: Date.now().toString(),
        rgb: color,
        createdAt: new Date(),
      };

      if (slotIndex !== undefined && slotIndex >= 0 && slotIndex < 3) {
        // Save to specific slot
        newSavedColors[slotIndex] = savedColor;
      } else {
        // Add to end and keep only last 3 (old behavior for backward compatibility)
        newSavedColors.push(savedColor);
        newSavedColors.splice(0, newSavedColors.length - 3);
      }

      return {
        ...prev,
        savedColors: newSavedColors
      };
    });
    sounds.playSuccessSound();
  }, [sounds]);

  // Clear saved colors (for future use)
  // const handleClearSaved = useCallback(() => {
  //   clearSavedColors();
  //   setGameState(prev => ({ ...prev, savedColors: [] }));
  // }, []);

  return (
    <DragManagerProvider>
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50">
        <GameHeader />

        <main className="container mx-auto px-4 py-6 max-w-4xl">
          {/* Game title */}
          <div className="text-center mb-8">
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-800 mb-2">
              {translations.title}
            </h1>
            <p className="text-lg text-gray-600">
              ドラッグ＆ドロップで色を混ぜよう！
            </p>
          </div>

          {/* Integrated Color Mixer */}
          <Card className="max-w-2xl mx-auto" padding="md">
            <IntegratedColorMixer
              savedColors={gameState.savedColors}
              onSaveColor={handleSaveColor}
              translations={translations}
              onPlayMixSound={sounds.playMixSound}
              onPlaySuccessSound={sounds.playSuccessSound}
            />
          </Card>
        </main>
      </div>
    </DragManagerProvider>
  );
}

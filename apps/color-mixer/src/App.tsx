import { useState, useEffect, useCallback } from 'react';
import { GameHeader, Card, DragManagerProvider } from '@core/ui';
import { GameContainer } from '@core/ui/GameContainer';
import { useSettings } from '@core/hooks';
import '@/styles.css';

// Import translations
import enTranslations from '@/data/locales/en.json';
import jaTranslations from '@/data/locales/ja.json';

// Import components
import { IntegratedColorMixer } from '@/components';

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
        <GameHeader
          title={translations.title}
          showHomeButton={true}
          className='bg-gradient-to-br from-blue-200 to-purple-200'
        />

        <main className="container mx-auto px-4 py-6 max-w-4xl">
          {/* Integrated Color Mixer */}
          <IntegratedColorMixer
            savedColors={gameState.savedColors}
            onSaveColor={handleSaveColor}
            translations={translations}
            onPlayMixSound={sounds.playMixSound}
            onPlaySuccessSound={sounds.playSuccessSound}
          />
        </main>
      </div>
    </DragManagerProvider>
  );
}

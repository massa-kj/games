import { useState, useEffect, useCallback } from 'react';
import { GameHeader, DragManagerProvider } from '@core/ui';
import { I18nProvider } from '@core/i18n';
import '@/styles.css';

// Import components
import { IntegratedColorMixer } from '@/components';

// Import types and utilities
import type { ColorMixerState, RGB } from '@/types';
import { getSavedColors, saveColor, updateMixingStats } from '@/utils/storage';
import { useColorMixerSounds } from '@/hooks/useColorMixerSounds';
import { useL10n } from '@/locales';

export default function ColorMixerApp() {
  return (
    <I18nProvider>
      <GameContent />
    </I18nProvider>
  );
}

function GameContent() {
  const { t } = useL10n();

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
    const loadSavedColors = async () => {
      const saved = await getSavedColors();
      setGameState(prev => ({ ...prev, savedColors: saved }));
    };
    loadSavedColors();
  }, []);

  // Save color (updated for 3 slots)
  const handleSaveColor = useCallback(async (color: RGB, slotIndex?: number) => {
    try {
      await saveColor(color, slotIndex);

      // Reload saved colors to update UI
      const updatedColors = await getSavedColors();
      setGameState(prev => ({ ...prev, savedColors: updatedColors }));

      sounds.playSuccessSound();
    } catch (error) {
      console.warn('Failed to save color:', error);
    }
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
          title={t('title')}
          showHomeButton={true}
          className='bg-gradient-to-br from-blue-200 to-purple-200'
        />

        <main className="container mx-auto px-4 py-6 max-w-4xl">
          {/* Integrated Color Mixer */}
          <IntegratedColorMixer
            savedColors={gameState.savedColors}
            onSaveColor={handleSaveColor}
            onMixColors={updateMixingStats}
            t={t}
            onPlayMixSound={sounds.playMixSound}
            onPlaySuccessSound={sounds.playSuccessSound}
          />
        </main>
      </div>
    </DragManagerProvider>
  );
}

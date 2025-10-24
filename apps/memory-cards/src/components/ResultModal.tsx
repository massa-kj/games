import { useMemo } from 'react';
import { Modal } from '@core/ui/Modal';
import { Button } from '@core/ui/Button';
import { StarsRating } from '@core/ui';
import { useSettings } from '@core/hooks/useSettings';
import type { MemoryGameState, Difficulty } from '@/types';

// Import the translations - we'll use them directly for now
import jaTranslations from '@/data/locales/ja.json';
import enTranslations from '@/data/locales/en.json';

interface ResultModalProps {
  isOpen: boolean;
  gameState: MemoryGameState;
  onPlayAgain: () => void;
  onClose: () => void;
}

export function ResultModal({ isOpen, gameState, onPlayAgain, onClose }: ResultModalProps) {
  const { settings } = useSettings();
  const currentLang = settings.lang;

  const translations = currentLang === 'en' ? enTranslations : jaTranslations;

  const score = useMemo(() => {
    const { attempts, matches } = gameState;
    const efficiency = matches > 0 ? (matches / attempts) * 100 : 0;

    let stars = 3;
    if (efficiency < 50) stars = 1;
    else if (efficiency < 75) stars = 2;

    return { efficiency: Math.round(efficiency), stars };
  }, [gameState]);

  const getDifficultyLabel = (difficulty: Difficulty): string => {
    return translations.difficulty[difficulty] || difficulty;
  };

  if (!isOpen || !gameState.cleared) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="md"
    >
      <div className="text-center p-6">
        {/* Congratulations Header */}
        <div className="mb-6">
          <div className="text-6xl mb-4 animate-bounce">🎉</div>
          <h2 className="text-3xl font-bold text-green-600 mb-2">
            {translations.congratulations}
          </h2>
          <p className="text-lg text-gray-700">
            {translations.allMatched}
          </p>
        </div>

        {/* Stars Rating */}
        <div className="mb-6">
          <div className="flex justify-center mb-2">
            <StarsRating
              rating={score.stars}
              maxStars={3}
              size="lg"
            />
          </div>
          <p className="text-sm text-gray-600">
            {score.efficiency}% {translations.efficiency}
          </p>
        </div>

        {/* Game Stats */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-green-600">
                {gameState.matches}
              </div>
              <div className="text-sm text-gray-600">
                {translations.matches}
              </div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-600">
                {gameState.attempts}
              </div>
              <div className="text-sm text-gray-600">
                {translations.attempts}
              </div>
            </div>
          </div>
          <div className="mt-3 pt-3 border-t border-gray-200">
            <div className="text-sm text-gray-600">
              {getDifficultyLabel(gameState.difficulty)}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <Button
            onClick={onPlayAgain}
            className="flex-1 bg-green-500 hover:bg-green-600 text-white"
          >
            {translations.playAgain}
          </Button>
          <Button
            onClick={onClose}
            className="flex-1 bg-gray-500 hover:bg-gray-600 text-white"
          >
            {translations.close}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

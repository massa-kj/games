import { useMemo } from 'react';
import { Modal } from '@core/ui/Modal';
import { Button } from '@core/ui/Button';
import { StarsRating } from '@core/ui';
import { useSound } from '@core/hooks';
import { useL10n } from '@/locales';
import { memoryCardSounds } from '@/audio/sounds';
import type { MemoryGameState, Difficulty } from '@/types';
import type { useGameTimer } from '@/hooks/useGameTimer';

interface ResultModalProps {
  isOpen: boolean;
  gameState: MemoryGameState;
  timer: ReturnType<typeof useGameTimer>;
  onPlayAgain: () => void;
  onClose: () => void;
}

export function ResultModal({ isOpen, gameState, timer, onPlayAgain, onClose }: ResultModalProps) {
  const { t } = useL10n();
  const { play } = useSound(memoryCardSounds);

  const handlePlayAgain = () => {
    play('buttonClick');
    onPlayAgain();
  };

  const handleClose = () => {
    play('buttonClick');
    onClose();
  };

  const score = useMemo(() => {
    const { attempts, matches } = gameState;
    const efficiency = matches > 0 ? (matches / attempts) * 100 : 0;

    // If the number of attempts is less than the number of pairs * 1.6 rounded up, it will be 3 stars.
    const calc = (rate: number) => attempts <= Math.ceil(matches * rate);
    console.log(Math.ceil(matches * 1.6))

    let stars = 0;
    if (calc(1.6)) stars = 3;
    else if (calc(2.5)) stars = 2;
    else if (calc(3.5)) stars = 1;

    return { efficiency: Math.round(efficiency), stars };
  }, [gameState]);

  const getDifficultyLabel = (difficulty: Difficulty): string => {
    return t(`difficulty.${difficulty}`);
  };

  return (
    <Modal
      isOpen={isOpen && gameState.cleared}
      onClose={onClose}
      size="md"
    >
      <div className="text-center p-6">
        {/* Congratulations Header */}
        <div className="mb-6">
          <div className="text-6xl mb-4 animate-bounce">🎉</div>
          <h2 className="text-3xl font-bold text-green-600 mb-2">
            {t('congratulations')}
          </h2>
          <p className="text-lg text-gray-700">
            {t('allMatched')}
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
            {score.efficiency}% {t('efficiency')}
          </p>
        </div>

        {/* Game Stats */}
        <div className="bg-gray-50 rounded-lg p-4 mb-6">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold text-green-600">
                {gameState.matches}
              </div>
              <div className="text-sm text-gray-600">
                {t('matches')}
              </div>
            </div>
            <div>
              <div className="text-2xl font-bold text-blue-600">
                {gameState.attempts}
              </div>
              <div className="text-sm text-gray-600">
                {t('attempts')}
              </div>
            </div>
            <div>
              <div className="text-2xl font-bold text-purple-600">
                {timer.formattedTime}
              </div>
              <div className="text-sm text-gray-600">
                {t('time')}
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
            onClick={handlePlayAgain}
            className="flex-1 bg-green-500 hover:bg-green-600 text-white"
          >
            {t('playAgain')}
          </Button>
          <Button
            onClick={handleClose}
            className="flex-1 bg-gray-500 hover:bg-gray-600 text-white"
          >
            {t('close')}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

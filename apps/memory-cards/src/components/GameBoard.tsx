import { GameContainer } from '@core/ui/GameContainer';
import { Card } from '@/components/Card';
import { useL10n } from '@/locales';
import type { MemoryGameState, Difficulty } from '@/types';
import type { useGameTimer } from '@/hooks/useGameTimer';
import { DIFFICULTY_CONFIGS } from '@/types';

interface GameBoardProps {
  gameState: MemoryGameState;
  onCardFlip: (cardId: string) => void;
  timer: ReturnType<typeof useGameTimer>;
}

export function GameBoard({ gameState, onCardFlip, timer }: GameBoardProps) {
  const { cards, isLocked, difficulty } = gameState;
  const config = DIFFICULTY_CONFIGS[difficulty];
  const { t } = useL10n();

  const getGridClassName = (difficulty: Difficulty): string => {
    const gridClasses = {
      easy: 'grid-2x2',
      medium: 'grid-2x3',
      hard: 'grid-2x4',
      expert: 'grid-3x4'
    };
    return gridClasses[difficulty];
  };

  if (!cards.length) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <div className="text-center">
          <div className="text-6xl mb-4">🎮</div>
          <div className="text-xl text-gray-600">
            {t('readyToPlay')}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center">
      {/* Game Stats */}
      <div className="mb-6 flex gap-8 text-center">
        <div className="bg-white rounded-lg px-4 py-2 shadow-md">
          <div className="text-sm text-gray-600">{t('matches')}</div>
          <div className="text-2xl font-bold text-green-600">
            {gameState.matches}/{config.pairs}
          </div>
        </div>
        <div className="bg-white rounded-lg px-4 py-2 shadow-md">
          <div className="text-sm text-gray-600">{t('attempts')}</div>
          <div className="text-2xl font-bold text-blue-600">
            {gameState.attempts}
          </div>
        </div>
        <div className="bg-white rounded-lg px-4 py-2 shadow-md">
          <div className="text-sm text-gray-600">{t('time')}</div>
          <div className="text-2xl font-bold text-purple-600">
            {timer.formattedTime}
          </div>
        </div>
      </div>

      {/* Game Grid */}
      <GameContainer preventScroll>
        <div className={`game-grid ${getGridClassName(difficulty)}`}>
          {cards.map((card) => (
            <Card
              key={card.id}
              card={card}
              onFlip={onCardFlip}
              disabled={isLocked}
            />
          ))}
        </div>
      </GameContainer>

      {/* Game Status */}
      {isLocked && (
        <div className="mt-4 text-center">
          <div className="text-lg text-gray-600 animate-pulse">
            {t('checking')}
          </div>
        </div>
      )}
    </div>
  );
}

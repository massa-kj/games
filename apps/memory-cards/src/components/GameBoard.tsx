import { GameContainer } from '@core/ui/GameContainer';
import { useSettings } from '@core/hooks/useSettings';
import { Card } from '@/components/Card';
import type { MemoryGameState, Difficulty } from '@/types';
import { DIFFICULTY_CONFIGS } from '@/types';

// Import translations
import enTranslations from '@/data/locales/en.json';
import jaTranslations from '@/data/locales/ja.json';

interface GameBoardProps {
  gameState: MemoryGameState;
  onCardFlip: (cardId: string) => void;
}

export function GameBoard({ gameState, onCardFlip }: GameBoardProps) {
  const { cards, isLocked, difficulty } = gameState;
  const config = DIFFICULTY_CONFIGS[difficulty];
  const { settings } = useSettings();
  const currentLang = settings.lang;
  const translations = currentLang === 'en' ? enTranslations : jaTranslations;

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
            {translations.readyToPlay}
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
          <div className="text-sm text-gray-600">{translations.matches}</div>
          <div className="text-2xl font-bold text-green-600">
            {gameState.matches}/{config.pairs}
          </div>
        </div>
        <div className="bg-white rounded-lg px-4 py-2 shadow-md">
          <div className="text-sm text-gray-600">{translations.attempts}</div>
          <div className="text-2xl font-bold text-blue-600">
            {gameState.attempts}
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
            {translations.checking}
          </div>
        </div>
      )}
    </div>
  );
}

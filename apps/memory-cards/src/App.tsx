import { Button, GameHeader } from '@core/ui';
import { I18nProvider } from '@core/i18n';
import { useSound } from '@core/hooks';
import { GameBoard, DifficultyMenu, ResultModal } from '@/components';
import { useGameLogic } from '@/hooks/useGameLogic';
import { useL10n } from '@/locales';
import { memoryCardSounds } from '@/audio/sounds';
import type { Difficulty } from '@/types';
import '@/styles.css';

function MemoryCardsGame() {
  const { state, timer, startGame, flipCard, restartGame, setDifficulty, clearJustCleared } = useGameLogic();
  const { t } = useL10n();
  const { play } = useSound(memoryCardSounds);

  const handleStartGame = (difficulty: Difficulty) => {
    play('buttonClick');
    setDifficulty(difficulty);
    startGame(difficulty);
  };

  const handlePlayAgain = () => {
    play('buttonClick');
    restartGame();
  };

  const handleRestartGame = () => {
    play('buttonClick');
    restartGame();
  };

  // Show result modal when game is just cleared
  const isResultModalOpen = state.justCleared;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-purple-100 no-select">
      <GameHeader
        title={t('title')}
        showHomeButton={true}
        showSettingsButton={true}
        className='bg-gradient-to-br from-blue-200 to-purple-200'
      />
      <div className="max-w-4xl p-4 mx-auto">
        {/* Game Content */}
        {!state.gameStarted ? (
          /* Start Screen */
          <DifficultyMenu onStartGame={handleStartGame} />
        ) : (
          /* Game Screen */
          <div>
            {/* Game Controls */}
            <div className="flex justify-center mb-6">
              <div className="flex gap-4">
                <Button
                  onClick={handleRestartGame}
                  className="bg-blue-500 hover:bg-blue-600 text-white"
                >
                  New Game
                </Button>
              </div>
            </div>

            {/* Game Board */}
            <GameBoard
              gameState={state}
              onCardFlip={flipCard}
              timer={timer}
            />
          </div>
        )}

        {/* Result Modal */}
        <ResultModal
          isOpen={isResultModalOpen}
          gameState={state}
          timer={timer}
          onPlayAgain={handlePlayAgain}
          onClose={clearJustCleared}
        />
      </div>
    </div>
  );
}

export default function MemoryCardsApp() {
  return (
    <I18nProvider>
      <MemoryCardsGame />
    </I18nProvider>
  );
}

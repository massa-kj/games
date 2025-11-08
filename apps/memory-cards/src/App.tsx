import { Button, GameHeader } from '@core/ui';
import { I18nProvider } from '@core/i18n';
import { useSound } from '@core/hooks';
import { GameBoard } from '@/components/GameBoard';
import { ResultModal } from '@/components/ResultModal';
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
          <div className="text-center">
            <div className="bg-white rounded-2xl shadow-lg p-4 mb-8 max-w-md mx-auto">
              <div className="text-6xl mb-4">🎮</div>
              <p className="text-lg text-gray-700 mb-6">
                {t('clickToStart')}
                <br />
                {t('description')}
              </p>

              {/* Difficulty Selection */}
              <div className="mb-6">
                <h3 className="text-lg font-bold mb-4 text-gray-800">
                  {t('selectDifficulty')}
                </h3>
                <div className="grid grid-cols-1 gap-3">
                  {(['easy', 'medium', 'hard', 'expert'] as const).map((key) => (
                    <Button
                      key={key}
                      onClick={() => handleStartGame(key as Difficulty)}
                      className="bg-blue-500 hover:bg-blue-600 text-white py-3 px-6 text-lg"
                    >
                      {t(`difficulty.${key}`)}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </div>
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

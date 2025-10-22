import { Button } from '@core/ui';
import { useSettings } from '@core/hooks';
import { GameBoard } from '@/components/GameBoard';
import { ResultModal } from '@/components/ResultModal';
import { useGameLogic } from '@/hooks/useGameLogic';
import type { Difficulty } from '@/types';
import '@/styles.css';

// Import translations
import enTranslations from '@/data/locales/en.json';
import jaTranslations from '@/data/locales/ja.json';

export default function MemoryCardsApp() {
  const { settings } = useSettings();
  const { state, startGame, flipCard, restartGame, setDifficulty, clearJustCleared } = useGameLogic();
  const currentLang = settings.lang;
  const translations = currentLang === 'en' ? enTranslations : jaTranslations;

  const handleStartGame = (difficulty: Difficulty) => {
    setDifficulty(difficulty);
    startGame(difficulty);
  };

  const handlePlayAgain = () => {
    restartGame();
  };

  // Show result modal when game is just cleared
  const isResultModalOpen = state.justCleared;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-purple-100 p-4 no-select">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">
            {translations.title}
          </h1>
          <p className="text-gray-600">
            {translations.description}
          </p>
        </header>

        {/* Game Content */}
        {!state.gameStarted ? (
          /* Start Screen */
          <div className="text-center">
            <div className="bg-white rounded-2xl shadow-lg p-8 mb-8 max-w-md mx-auto">
              <div className="text-6xl mb-4">🎮</div>
              <p className="text-lg text-gray-700 mb-6">
                {translations.clickToStart}
              </p>

              {/* Difficulty Selection */}
              <div className="mb-6">
                <h3 className="text-lg font-bold mb-4 text-gray-800">
                  {translations.selectDifficulty}
                </h3>
                <div className="grid grid-cols-1 gap-3">
                  {Object.entries(translations.difficulty).map(([key, label]) => (
                    <Button
                      key={key}
                      onClick={() => handleStartGame(key as Difficulty)}
                      className="bg-blue-500 hover:bg-blue-600 text-white py-3 px-6 text-lg"
                    >
                      {label}
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
                  onClick={restartGame}
                  className="bg-gray-500 hover:bg-gray-600 text-white"
                >
                  {translations.restart}
                </Button>
                <Button
                  onClick={() => {
                    restartGame();
                  }}
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
            />
          </div>
        )}

        {/* Result Modal */}
        <ResultModal
          isOpen={isResultModalOpen}
          gameState={state}
          onPlayAgain={handlePlayAgain}
          onClose={clearJustCleared}
        />
      </div>
    </div>
  );
}

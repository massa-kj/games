import { GameHeader } from '@core/ui';
import { useSettings } from '@core/hooks';
import { Motion } from '@core/ui/motion';
import useGameState from '@/hooks/useGameState';
import { useTicTacToeSound } from '@/hooks/useTicTacToeSound';
import GameBoard from '@/components/GameBoard';
import { GameInfo } from '@/components/GameInfo';
import '@/styles.css';

// Import translations
import enTranslations from '@/data/locales/en.json';
import jaTranslations from '@/data/locales/ja.json';
import type { GameTranslations, Player } from '@/types';
import { useEffect } from 'react';

export default function TicTacToeApp() {
  const { settings } = useSettings();
  const currentLang = settings.lang;
  const translations = currentLang === 'en' ? enTranslations : jaTranslations as GameTranslations;

  const { gameState, makeMove, resetGame, resetScores } = useGameState();
  const {
    playMoveSound,
    playVictorySound,
    playTieSound,
    playResetSound
  } = useTicTacToeSound();

  // Handle cell clicks
  const handleCellClick = async (cellIndex: number) => {
    const success = makeMove(cellIndex);
    if (success) {
      await playMoveSound(gameState.currentPlayer);
    }
  };

  // Handle new game
  const handleNewGame = async () => {
    resetGame();
    await playResetSound();
  };

  // Handle reset scores
  const handleResetScores = async () => {
    resetScores();
    await playResetSound();
  };

  // Play sound effects when game ends
  useEffect(() => {
    if (gameState.status === 'won' && gameState.winner) {
      playVictorySound(gameState.winner as Player);
    } else if (gameState.status === 'tie') {
      playTieSound();
    }
  }, [gameState.status, gameState.winner, playVictorySound, playTieSound]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      <GameHeader
        title={translations.title}
        gameSettings={[
          {
            id: 'sound',
            type: 'checkbox',
            label: currentLang === 'en' ? 'Sound Effects' : 'サウンド効果',
            value: settings.sound,
            onChange: () => {
              // This will be handled by the GameHeader internally via useSettings
            }
          }
        ]}
      />

      <main className="container mx-auto px-4 py-8 max-w-6xl">
        <Motion
          type="fade"
          show={true}
          speed="normal"
          className="text-center mb-8"
        >
          <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 mb-4">
            {translations.title}
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            {translations.description}
          </p>
        </Motion>

        <div className="grid lg:grid-cols-2 gap-8 items-start">
          {/* Game Board */}
          <Motion
            type="scale"
            show={true}
            speed="normal"
            className="flex justify-center"
          >
            <div className="w-full max-w-md">
              <GameBoard
                board={gameState.board}
                onCellClick={handleCellClick}
                disabled={gameState.status !== 'playing'}
                winningLine={gameState.winningLine}
                className="shadow-2xl"
              />
            </div>
          </Motion>

          {/* Game Info */}
          <Motion
            type="slideUp"
            show={true}
            speed="normal"
            className="w-full"
          >
            <GameInfo
              gameState={gameState}
              translations={translations}
              onNewGame={handleNewGame}
              onResetScores={handleResetScores}
            />
          </Motion>
        </div>

        {/* Footer */}
        <Motion
          type="fade"
          show={true}
          speed="slow"
          className="text-center mt-12"
        >
          <p className="text-sm text-gray-500">
            {gameState.status === 'playing' && translations.clickToPlay}
          </p>
        </Motion>
      </main>
    </div>
  );
}

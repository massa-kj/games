import { GameHeader } from '@core/ui';
import { I18nProvider } from '@core/i18n';
import { Motion } from '@core/ui/motion';
import useGameState from '@/hooks/useGameState';
import { useTicTacToeSound } from '@/hooks/useTicTacToeSound';
import { useL10n } from '@/locales';
import GameBoard from '@/components/GameBoard';
import { GameInfo } from '@/components/GameInfo';
import type { Player } from '@/types';
import { useEffect } from 'react';
import '@/styles.css';

function TicTacToeGame() {
  const { t } = useL10n();

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
        title={t('title')}
        gameSettings={[
          {
            id: 'sound',
            type: 'checkbox',
            label: 'Sound Effects', // This will be handled by GameHeader internally
            value: true, // This will be handled by GameHeader internally via useSettings
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
            {t('title')}
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            {t('description')}
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
            {gameState.status === 'playing' && t('clickToPlay')}
          </p>
        </Motion>
      </main>
    </div>
  );
}

export default function TicTacToeApp() {
  return (
    <I18nProvider>
      <TicTacToeGame />
    </I18nProvider>
  );
}

import { Card, Button } from '@core/ui';
import { Motion } from '@core/ui/motion';
import type { GameState, GameTranslations } from '@/types';

interface GameInfoProps {
  gameState: GameState;
  translations: GameTranslations;
  onNewGame: () => void;
  onResetScores: () => void;
  className?: string;
}

/**
 * Display current game information including scores, current player, and game status
 */
export function GameInfo({
  gameState,
  translations,
  onNewGame,
  onResetScores,
  className = ''
}: GameInfoProps) {
  const { currentPlayer, status, winner, scores } = gameState;



  const getStatusMessage = (): string => {
    if (status === 'won' && winner) {
      return translations.playerWins.replace('{{player}}',
        winner === 'X' ? translations.playerX : translations.playerO
      );
    }
    if (status === 'tie') {
      return translations.itsATie;
    }
    return translations.gameInProgress;
  };

  const getStatusColor = (): string => {
    if (status === 'won') return 'text-green-600';
    if (status === 'tie') return 'text-yellow-600';
    return 'text-gray-600';
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Current Game Status */}
      <Card className="text-center">
        <Motion type="scale" show={true} speed="normal">
          <h2 className={`text-2xl font-bold mb-2 ${getStatusColor()}`}>
            {getStatusMessage()}
          </h2>

          {status === 'playing' && (
            <div className="flex items-center justify-center space-x-2">
              <span className="text-lg text-gray-600">{translations.currentPlayer}:</span>
              <div className={`player-indicator player-${currentPlayer.toLowerCase()}`}>
                {currentPlayer}
              </div>
            </div>
          )}

          {status === 'playing' && (
            <p className="text-sm text-gray-500 mt-2">
              {translations.clickToPlay}
            </p>
          )}
        </Motion>
      </Card>

      {/* Score Board */}
      <Card className="bg-gradient-to-r from-blue-50 to-red-50">
        <h3 className="text-xl font-semibold text-center mb-4 text-gray-800">
          {translations.score}
        </h3>

        <div className="grid grid-cols-3 gap-4">
          {/* Player X Score */}
          <Motion type="slideUp" show={true} speed="fast">
            <div className="score-card score-x">
              <div className="text-2xl font-bold text-blue-600 mb-1">X</div>
              <div className="text-3xl font-bold text-blue-800">{scores.X}</div>
              <div className="text-sm text-blue-600">{translations.wins}</div>
            </div>
          </Motion>

          {/* Ties Score */}
          <Motion type="slideUp" show={true} speed="fast">
            <div className="score-card score-tie">
              <div className="text-2xl font-bold text-yellow-600 mb-1">―</div>
              <div className="text-3xl font-bold text-yellow-800">{scores.ties}</div>
              <div className="text-sm text-yellow-600">{translations.ties}</div>
            </div>
          </Motion>

          {/* Player O Score */}
          <Motion type="slideUp" show={true} speed="fast">
            <div className="score-card score-o">
              <div className="text-2xl font-bold text-red-600 mb-1">O</div>
              <div className="text-3xl font-bold text-red-800">{scores.O}</div>
              <div className="text-sm text-red-600">{translations.wins}</div>
            </div>
          </Motion>
        </div>
      </Card>

      {/* Game Actions */}
      <Card>
        <div className="flex flex-col sm:flex-row gap-3">
          <Button
            onClick={onNewGame}
            variant="primary"
            size="lg"
            className="flex-1"
          >
            {status === 'playing' ? translations.newGame : translations.playAgain}
          </Button>

          <Button
            onClick={onResetScores}
            variant="secondary"
            size="lg"
            className="flex-1"
          >
            {translations.resetScore}
          </Button>
        </div>
      </Card>
    </div>
  );
}

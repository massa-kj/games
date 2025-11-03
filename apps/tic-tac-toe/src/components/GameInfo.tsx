import { Card, Button } from '@core/ui';
import { Motion } from '@core/ui/motion';
import { useL10n } from '@/locales';
import type { GameState } from '@/types';

interface GameInfoProps {
  gameState: GameState;
  onNewGame: () => void;
  onResetScores: () => void;
  className?: string;
}

/**
 * Display current game information including scores, current player, and game status
 */
export function GameInfo({
  gameState,
  onNewGame,
  onResetScores,
  className = ''
}: GameInfoProps) {
  const { currentPlayer, status, winner, scores } = gameState;
  const { t } = useL10n();



  const getStatusMessage = (): string => {
    if (status === 'won' && winner) {
      return t('playerWins').replace('{{player}}',
        winner === 'X' ? t('playerX') : t('playerO')
      );
    }
    if (status === 'tie') {
      return t('itsATie');
    }
    return t('gameInProgress');
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
              <span className="text-lg text-gray-600">{t('currentPlayer')}:</span>
              <div className={`player-indicator player-${currentPlayer.toLowerCase()}`}>
                {currentPlayer}
              </div>
            </div>
          )}

          {status === 'playing' && (
            <p className="text-sm text-gray-500 mt-2">
              {t('clickToPlay')}
            </p>
          )}
        </Motion>
      </Card>

      {/* Score Board */}
      <Card className="bg-gradient-to-r from-blue-50 to-red-50">
        <h3 className="text-xl font-semibold text-center mb-4 text-gray-800">
          {t('score')}
        </h3>

        <div className="grid grid-cols-3 gap-4">
          {/* Player X Score */}
          <Motion type="slideUp" show={true} speed="fast">
            <div className="score-card score-x">
              <div className="text-2xl font-bold text-blue-600 mb-1">X</div>
              <div className="text-3xl font-bold text-blue-800">{scores.X}</div>
              <div className="text-sm text-blue-600">{t('wins')}</div>
            </div>
          </Motion>

          {/* Ties Score */}
          <Motion type="slideUp" show={true} speed="fast">
            <div className="score-card score-tie">
              <div className="text-2xl font-bold text-yellow-600 mb-1">―</div>
              <div className="text-3xl font-bold text-yellow-800">{scores.ties}</div>
              <div className="text-sm text-yellow-600">{t('ties')}</div>
            </div>
          </Motion>

          {/* Player O Score */}
          <Motion type="slideUp" show={true} speed="fast">
            <div className="score-card score-o">
              <div className="text-2xl font-bold text-red-600 mb-1">O</div>
              <div className="text-3xl font-bold text-red-800">{scores.O}</div>
              <div className="text-sm text-red-600">{t('wins')}</div>
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
            {status === 'playing' ? t('newGame') : t('playAgain')}
          </Button>

          <Button
            onClick={onResetScores}
            variant="secondary"
            size="lg"
            className="flex-1"
          >
            {t('resetScore')}
          </Button>
        </div>
      </Card>
    </div>
  );
}

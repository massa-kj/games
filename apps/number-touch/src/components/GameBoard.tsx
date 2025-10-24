import React, { useEffect, useState } from 'react';
import { useSettings } from '@core/hooks';
import { GameContainer } from '@core/ui/GameContainer';
import { NumberButton } from '@/components/NumberButton';
import { NumberButton as NumberButtonType, DIFFICULTY_CONFIGS, Difficulty } from '@/types';

// Import locale data
import enLocale from '@/data/locales/en.json';
import jaLocale from '@/data/locales/ja.json';

const locales = {
  en: enLocale,
  ja: jaLocale
};

interface GameBoardProps {
  numbers: NumberButtonType[];
  currentTarget: number;
  onNumberClick: (value: number) => void;
  isGameActive: boolean;
  gameStarted: boolean;
  gameCompleted: boolean;
  getFormattedTime: () => string;
  lastClickedNumber: number | null;
  isMistake: boolean;
  onMistakeAnimationEnd: () => void;
  difficulty: Difficulty;
  showTargetHint: boolean;
  onStartGame: () => void;
  onRestartGame: () => void;
  onOpenSettings: () => void;
}

export const GameBoard: React.FC<GameBoardProps> = ({
  numbers,
  currentTarget,
  onNumberClick,
  isGameActive,
  gameStarted,
  gameCompleted,
  getFormattedTime,
  lastClickedNumber,
  isMistake,
  onMistakeAnimationEnd,
  difficulty,
  showTargetHint,
  onStartGame,
  onRestartGame,
  onOpenSettings
}) => {
  const { settings } = useSettings();
  const [currentTime, setCurrentTime] = useState('0.000');

  // Simple translation function
  const t = (key: string): string => {
    const currentLocale = locales[settings.lang || 'en'];
    const keys = key.split('.');
    let value: any = currentLocale;

    for (const k of keys) {
      value = value?.[k];
    }

    return value || key;
  };

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isGameActive && gameStarted) {
      interval = setInterval(() => {
        setCurrentTime(getFormattedTime());
      }, 10); // Update every 10ms
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isGameActive, gameStarted, getFormattedTime]);

  const config = DIFFICULTY_CONFIGS[difficulty];
  const gridStyle = {
    display: 'grid',
    gridTemplateColumns: `repeat(${config.gridCols}, 1fr)`,
    gridTemplateRows: `repeat(${config.gridRows}, 1fr)`,
    gap: '8px',
    width: '100%',
    height: '100%'
  };

  return (
    <div className="flex flex-col items-center w-full px-2 sm:px-4">
      {/* Header with settings button */}
      <div className="flex justify-between items-center w-full max-w-sm sm:max-w-lg md:max-w-xl lg:max-w-2xl mb-4">
        <div /> {/* Spacer */}
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-800 text-center">
          {t('game.title')}
        </h1>
        <button
          onClick={onOpenSettings}
          className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
          title="Settings"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </button>
      </div>

      {/* Game info display - Fixed height to prevent layout shift */}
      <div className="mb-4 sm:mb-6 text-center px-2 h-12 sm:h-14 flex items-center justify-center">
        {gameStarted && (
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-6 text-base sm:text-lg">
            <div className="font-mono">
              {t('game.time')}: <span className="font-bold text-blue-600">{currentTime}s</span>
            </div>
          </div>
        )}
      </div>

      {/* Game board */}
      <div
        className="
          relative
          w-full max-w-sm sm:max-w-lg md:max-w-xl lg:max-w-2xl
          rounded-xl border-2 border-white/30
          game-board-container
          overflow-hidden
        "
      >
        <GameContainer preventScroll>
          <div className="aspect-[5/4] p-3 sm:p-4 md:p-6 w-full h-auto">
            <div style={gridStyle} className="w-full h-full">
              {numbers.map((number) => (
                <NumberButton
                  key={number.id}
                  number={number}
                  onClick={onNumberClick}
                  isTarget={number.value === currentTarget}
                  isMistake={isMistake && lastClickedNumber === number.value}
                  onMistakeAnimationEnd={onMistakeAnimationEnd}
                  showTargetHint={showTargetHint}
                />
              ))}
            </div>
          </div>
        </GameContainer>

        {!gameStarted && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/95 rounded-xl">
            <div className="text-center px-4">
              <div className="text-xl sm:text-2xl font-bold text-gray-700 mb-4">
                {gameCompleted ? t('game.gameComplete') : t('game.ready')}
              </div>
              <div className="text-sm sm:text-base text-gray-600">
                {gameCompleted
                  ? t('game.clickStartToPlayAgain')
                  : t('game.instructions').replace('{{count}}', numbers.length.toString())
                }
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Control buttons during game */}
      {gameStarted && isGameActive && (
        <div className="mt-4">
          <button
            onClick={onRestartGame}
            className="px-6 py-2 bg-orange-500 text-white rounded-lg font-medium hover:bg-orange-600 active:scale-95 transition-all duration-200"
          >
            {t('game.restart')}
          </button>
        </div>
      )}

      {/* Start button when game is not started or completed */}
      {(!gameStarted || gameCompleted) && (
        <div className="mt-4">
          <button
            onClick={gameCompleted ? onRestartGame : onStartGame}
            className="px-8 py-3 bg-blue-500 text-white rounded-lg font-bold text-lg hover:bg-blue-600 active:scale-95 transition-all duration-200 shadow-lg"
          >
            {gameCompleted ? t('game.playAgain') : t('game.startGame')}
          </button>
        </div>
      )}
    </div>
  );
};

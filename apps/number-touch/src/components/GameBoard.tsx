import React, { useEffect, useState } from 'react';
import { NumberButton } from './NumberButton';
import { NumberButton as NumberButtonType, DIFFICULTY_CONFIGS, Difficulty } from '../types';
import { useSettings } from '@core/hooks';

// Import locale data
import enLocale from '../data/locales/en.json';
import jaLocale from '../data/locales/ja.json';

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
  getFormattedTime: () => string;
  lastClickedNumber: number | null;
  isMistake: boolean;
  onMistakeAnimationEnd: () => void;
  difficulty: Difficulty;
  showTargetHint: boolean;
}

export const GameBoard: React.FC<GameBoardProps> = ({
  numbers,
  currentTarget,
  onNumberClick,
  isGameActive,
  gameStarted,
  getFormattedTime,
  lastClickedNumber,
  isMistake,
  onMistakeAnimationEnd,
  difficulty,
  showTargetHint
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
    <div className="flex flex-col items-center">
      {/* Game info display */}
      <div className="mb-6 text-center">
        {gameStarted && (
          <div className="flex items-center gap-6 text-lg">
            <div className="font-mono">
              {t('game.time')}: <span className="font-bold text-blue-600">{currentTime}s</span>
            </div>
            <div>
              {t('game.next')}: <span className="font-bold text-green-600">{currentTarget}</span>
            </div>
          </div>
        )}
      </div>

      {/* Game board */}
      <div className="relative w-[500px] h-[400px] rounded-xl border-2 border-white/30 p-4 game-board-container">
        <div style={gridStyle}>
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

        {!gameStarted && (
          <div className="absolute inset-0 flex items-center justify-center bg-white/95 rounded-xl">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-700 mb-2">
                {t('game.ready')}
              </div>
              <div className="text-gray-600">
                {t('game.instructions').replace('{{count}}', numbers.length.toString())}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

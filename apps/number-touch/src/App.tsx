import React, { useState } from 'react';
import { useGameLogic } from './hooks';
import { GameBoard, ResultModal } from './components';
import { Difficulty } from './types';
import { useSettings } from '@core/hooks';
import './styles.css';

// Import locale data
import enLocale from './data/locales/en.json';
import jaLocale from './data/locales/ja.json';

const locales = {
  en: enLocale,
  ja: jaLocale
};

export default function App() {
  const { settings: appSettings } = useSettings();

  // Simple translation function
  const t = (key: string): string => {
    const currentLocale = locales[appSettings.lang || 'en'];
    const keys = key.split('.');
    let value: any = currentLocale;

    for (const k of keys) {
      value = value?.[k];
    }

    return value || key;
  };
  const {
    numbers,
    currentTarget,
    isGameActive,
    gameStarted,
    gameCompleted,
    difficulty,
    mistakes,
    lastClickedNumber,
    isMistake,
    settings,
    startGame,
    clickNumber,
    restartGame,
    setDifficulty,
    clearMistake,
    toggleTargetHint,
    getElapsedTime,
    getFormattedTime
  } = useGameLogic();

  const [showResults, setShowResults] = useState(false);

  React.useEffect(() => {
    if (gameCompleted) {
      setShowResults(true);
    }
  }, [gameCompleted]);

  const handleStartGame = () => {
    startGame(difficulty);
    setShowResults(false);
  };

  const handleRestartGame = () => {
    restartGame();
    setShowResults(false);
  };

  const handleCloseResults = () => {
    setShowResults(false);
  };

  const getDifficultyConfig = () => {
    return {
      easy: { label: t('game.difficulty.easy'), maxNumber: 10 },
      hard: { label: t('game.difficulty.hard'), maxNumber: 20 }
    };
  };

  return (
    <div className="game-container">
      {/* Header */}
      <div className="game-header">
        <h1 className="text-5xl font-bold text-gray-800 mb-3">{t('game.title')}</h1>
        <p className="text-xl text-gray-600">
          {t('game.subtitle')}
        </p>
      </div>

      {/* Control panel */}
      <div className="control-panel">
        {/* Difficulty selection */}
        <div className="difficulty-selector">
          {Object.entries(getDifficultyConfig()).map(([key, config]) => (
            <button
              key={key}
              onClick={() => setDifficulty(key as Difficulty)}
              className={`difficulty-button ${difficulty === key ? 'active' : 'inactive'
                }`}
              disabled={gameStarted && isGameActive}
            >
              {config.label}
            </button>
          ))}
        </div>

        {/* Settings options */}
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input
              type="checkbox"
              checked={settings.showTargetHint}
              onChange={toggleTargetHint}
              className="w-4 h-4 rounded accent-blue-500"
            />
            {t('game.showTargetHint')}
          </label>
        </div>

        {/* Start/Restart game buttons */}
        <div className="flex gap-2">
          {!gameStarted || gameCompleted ? (
            <button
              onClick={handleStartGame}
              className="start-button"
            >
              {gameCompleted ? t('game.playAgain') : t('game.startGame')}
            </button>
          ) : (
            <button
              onClick={handleRestartGame}
              className="restart-button"
            >
              {t('game.restart')}
            </button>
          )}
        </div>
      </div>

      {/* Game board */}
      <div className="flex justify-center">
        <GameBoard
          numbers={numbers}
          currentTarget={currentTarget}
          onNumberClick={clickNumber}
          isGameActive={isGameActive}
          gameStarted={gameStarted}
          getFormattedTime={getFormattedTime}
          lastClickedNumber={lastClickedNumber}
          isMistake={isMistake}
          onMistakeAnimationEnd={clearMistake}
          difficulty={difficulty}
          showTargetHint={settings.showTargetHint}
        />
      </div>

      {/* Statistics */}
      {gameStarted && (
        <div className="mt-8 text-center">
          <div className="inline-flex items-center gap-6 bg-white rounded-xl p-4 shadow-md border border-gray-200">
            <div>
              <span className="text-gray-600">{t('game.mistakes')}: </span>
              <span className="font-bold text-red-500">{mistakes}</span>
            </div>
            <div>
              <span className="text-gray-600">{t('game.target')}: </span>
              <span className="font-bold text-green-600">{currentTarget}</span>
            </div>
            <div>
              <span className="text-gray-600">{t('game.progress')}: </span>
              <span className="font-bold text-blue-600">
                {currentTarget - 1}/{numbers.length}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Result modal */}
      <ResultModal
        isOpen={showResults}
        onClose={handleCloseResults}
        onRestart={handleRestartGame}
        time={getElapsedTime()}
        difficulty={difficulty}
        mistakes={mistakes}
      />
    </div>
  );
}

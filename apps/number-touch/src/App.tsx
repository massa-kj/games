import React, { useState } from 'react';
import { useGameLogic } from './hooks';
import { GameBoard, ResultModal } from './components';
import { Difficulty } from './types';
import { useSettings } from '@core/hooks';
import { GameSettingsModal } from '@core/ui';
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
  const [showSettings, setShowSettings] = useState(false);

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

  const gameSettings = [
    {
      id: 'showTargetHint',
      type: 'checkbox' as const,
      label: t('game.showTargetHint'),
      value: settings.showTargetHint,
      onChange: toggleTargetHint
    }
  ];

  const difficulties = [
    { key: 'easy', label: t('game.difficulty.easy'), description: t('game.difficulty.easyDescription') },
    { key: 'hard', label: t('game.difficulty.hard'), description: t('game.difficulty.hardDescription') }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 py-4">
      {/* Game board - now contains everything */}
      <GameBoard
        numbers={numbers}
        currentTarget={currentTarget}
        onNumberClick={clickNumber}
        isGameActive={isGameActive}
        gameStarted={gameStarted}
        gameCompleted={gameCompleted}
        getFormattedTime={getFormattedTime}
        lastClickedNumber={lastClickedNumber}
        isMistake={isMistake}
        onMistakeAnimationEnd={clearMistake}
        difficulty={difficulty}
        showTargetHint={settings.showTargetHint}
        onStartGame={handleStartGame}
        onRestartGame={handleRestartGame}
        onOpenSettings={() => setShowSettings(true)}
      />

      {/* Settings modal */}
      <GameSettingsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        title={t('settings.title')}
        difficulties={difficulties}
        currentDifficulty={difficulty}
        onDifficultyChange={(d) => setDifficulty(d as Difficulty)}
        gameSettings={gameSettings}
        texts={{
          difficultyLabel: t('game.difficulty.label'),
          close: t('settings.close')
        }}
      />

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

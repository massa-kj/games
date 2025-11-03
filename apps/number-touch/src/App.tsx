import React, { useState } from 'react';
import { I18nProvider } from '@core/i18n';
import { useGameLogic } from '@/hooks';
import { GameBoard, ResultModal } from '@/components';
import { useL10n } from '@/locales';
import { Difficulty } from '@/types';
import '@/styles.css';

function NumberTouchGame() {
  const { t } = useL10n();
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

  const gameSettings = [
    {
      id: 'difficulty',
      type: 'button-group' as const,
      label: t('game.difficulty.label'),
      value: difficulty,
      onChange: (d: Difficulty) => setDifficulty(d),
      options: [
        {
          value: 'easy',
          label: t('game.difficulty.easy'),
          description: t('game.difficulty.easy')
        },
        {
          value: 'hard',
          label: t('game.difficulty.hard'),
          description: t('game.difficulty.hard')
        }
      ]
    },
    {
      id: 'showTargetHint',
      type: 'checkbox' as const,
      label: t('game.showTargetHint'),
      value: settings.showTargetHint,
      onChange: toggleTargetHint
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-100 to-green-100">
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
        gameSettings={gameSettings}
      />
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

export default function App() {
  return (
    <I18nProvider>
      <NumberTouchGame />
    </I18nProvider>
  );
}

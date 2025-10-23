import React from 'react';
import { calculateStars, Difficulty } from '@/types';
import { useSettings } from '@core/hooks';
import { Modal } from '@core/ui';

// Import locale data
import enLocale from '@/data/locales/en.json';
import jaLocale from '@/data/locales/ja.json';

const locales = {
  en: enLocale,
  ja: jaLocale
};

interface ResultModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRestart: () => void;
  time: number;
  difficulty: Difficulty;
  mistakes: number;
}

export const ResultModal: React.FC<ResultModalProps> = ({
  isOpen,
  onClose,
  onRestart,
  time,
  difficulty,
  mistakes
}) => {
  const { settings } = useSettings();

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

  if (!isOpen) return null;

  const stars = calculateStars(time, difficulty);
  const maxNumber = difficulty === 'easy' ? 10 : 20;

  const renderStars = () => {
    return Array.from({ length: 3 }, (_, index) => (
      <span
        key={index}
        className={`text-4xl ${index < stars ? 'text-yellow-400' : 'text-gray-300'
          }`}
      >
        ★
      </span>
    ));
  };

  const getPerformanceMessage = () => {
    if (stars === 3) return t('results.performance.excellent');
    if (stars === 2) return t('results.performance.great');
    if (stars === 1) return t('results.performance.good');
    return t('results.performance.tryAgain');
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t('results.gameComplete')}
      size="md"
      showCloseButton={false}
    >
      <div className="text-center">
        <div className="mb-6">
          <div className="text-lg text-gray-600">
            {t('results.numbersCompleted').replace('{{count}}', maxNumber.toString())}
          </div>
        </div>

        {/* Star rating */}
        <div className="mb-6">
          <div className="flex justify-center mb-2">
            {renderStars()}
          </div>
          <div className="text-xl font-semibold text-gray-700">
            {getPerformanceMessage()}
          </div>
        </div>

        {/* Result details */}
        <div className="space-y-3 mb-8">
          <div className="flex justify-between items-center">
            <span className="text-gray-600">{t('game.time')}:</span>
            <span className="font-bold text-blue-600 font-mono">
              {time.toFixed(3)}s
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600">{t('game.mistakes')}:</span>
            <span className="font-bold text-red-500">
              {mistakes}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600">{t('game.difficulty.label')}:</span>
            <span className="font-bold text-purple-600 capitalize">
              {difficulty === 'easy' ? t('game.difficulty.easy') : t('game.difficulty.hard')}
            </span>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
          >
            {t('results.close')}
          </button>
          <button
            onClick={onRestart}
            className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
          >
            {t('results.playAgain')}
          </button>
        </div>
      </div>
    </Modal>
  );
};

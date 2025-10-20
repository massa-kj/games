import React, { useEffect } from 'react';
import { NumberButton as NumberButtonType } from '../types';

interface NumberButtonProps {
  number: NumberButtonType;
  onClick: (value: number) => void;
  isTarget: boolean;
  isMistake: boolean;
  onMistakeAnimationEnd: () => void;
  showTargetHint: boolean;
}

export const NumberButton: React.FC<NumberButtonProps> = ({
  number,
  onClick,
  isTarget,
  isMistake,
  onMistakeAnimationEnd,
  showTargetHint
}) => {
  useEffect(() => {
    if (isMistake) {
      const timer = setTimeout(onMistakeAnimationEnd, 500);
      return () => clearTimeout(timer);
    }
  }, [isMistake, onMistakeAnimationEnd]);

  const handleClick = () => {
    onClick(number.value);
  };

  const getButtonClass = () => {
    let baseClass = "w-full h-full rounded-lg flex items-center justify-center text-2xl font-bold transition-all duration-200 cursor-pointer select-none border-2";

    if (number.isCompleted) {
      return `${baseClass} bg-green-500 text-white border-green-600 scale-95 opacity-80`;
    }

    if (isMistake) {
      return `${baseClass} bg-red-500 text-white border-red-600 animate-shake`;
    }

    if (isTarget && showTargetHint) {
      return `${baseClass} bg-blue-500 text-white border-blue-600 hover:bg-blue-600 active:scale-95 ring-2 ring-blue-300 animate-pulse`;
    }

    return `${baseClass} bg-white text-gray-800 border-gray-300 hover:bg-gray-50 active:scale-95 shadow-sm`;
  }; const getGridStyles = () => {
    const { row, col } = number.gridPosition;
    return {
      gridColumn: col + 1,
      gridRow: row + 1,
    };
  };

  return (
    <div
      className={getButtonClass()}
      style={getGridStyles()}
      onClick={handleClick}
    >
      {number.value}
    </div>
  );
};

import { Motion } from '@core/ui/motion';
import type { CellValue } from '@/types';

interface GameCellProps {
  value: CellValue;
  onClick: () => void;
  disabled: boolean;
  isWinningCell: boolean;
  className?: string;
}

/**
 * Individual cell component for the Tic Tac Toe board
 */
export function GameCell({
  value,
  onClick,
  disabled,
  isWinningCell,
  className = ''
}: GameCellProps) {
  const handleClick = () => {
    if (!disabled && !value) {
      onClick();
    }
  };

  const cellClasses = [
    'tic-tac-toe-cell',
    className
  ];

  if (disabled || value) {
    cellClasses.push('cursor-not-allowed');
  }

  if (isWinningCell) {
    cellClasses.push('winning');
  }

  const getPlayerColor = (player: CellValue) => {
    if (player === 'X') return 'text-blue-600';
    if (player === 'O') return 'text-red-600';
    return '';
  };

  return (
    <button
      onClick={handleClick}
      disabled={disabled || !!value}
      className={cellClasses.join(' ')}
      aria-label={value ? `Cell filled with ${value}` : 'Empty cell'}
    >
      {value && (
        <Motion
          type="scale"
          show={true}
          speed="fast"
          className={getPlayerColor(value)}
        >
          <span className="drop-shadow-sm">
            {value}
          </span>
        </Motion>
      )}

      {/* Hover effect for empty cells */}
      {!value && !disabled && (
        <div className="absolute inset-0 opacity-0 hover:opacity-20 transition-opacity duration-200 bg-blue-500 rounded-sm" />
      )}
    </button>
  );
}

import { Motion } from '@core/ui/motion';
import { GameCell } from './GameCell';
import type { Board } from '@/types';

interface GameBoardProps {
  board: Board;
  onCellClick: (index: number) => void;
  disabled: boolean;
  winningLine: number[] | null;
  className?: string;
}

/**
 * 3x3 Tic Tac Toe game board component
 */
export default function GameBoard({
  board,
  onCellClick,
  disabled,
  winningLine,
  className = ''
}: GameBoardProps) {
  const handleCellClick = (index: number) => {
    if (!disabled) {
      onCellClick(index);
    }
  };

  const isWinningCell = (index: number): boolean => {
    return winningLine ? winningLine.includes(index) : false;
  };

  return (
    <Motion
      type="scale"
      show={true}
      speed="normal"
      className={`relative ${className}`}
    >
      <div className="relative">
        {/* 3x3 Grid */}
        <div className="tic-tac-toe-board">
          {board.map((cell, index) => (
            <GameCell
              key={index}
              value={cell}
              onClick={() => handleCellClick(index)}
              disabled={disabled}
              isWinningCell={isWinningCell(index)}
            />
          ))}
        </div>

        {/* Winning Line Animation */}
        {winningLine && (
          <Motion
            type="scale"
            show={true}
            speed="slow"
            className="absolute inset-0 pointer-events-none"
          >
            <div className="absolute inset-0 rounded-2xl border-4 border-green-400 bg-green-50 bg-opacity-20 animate-pulse" />
          </Motion>
        )}
      </div>
    </Motion>
  );
}

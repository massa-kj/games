import { Card } from '@core/ui';
import type { ReactNode } from 'react';

interface GameBoardProps {
  children: ReactNode;
  className?: string;
}

export default function GameBoard({ children, className = '' }: GameBoardProps) {
  return (
    <Card className={`game-board p-6 min-h-[400px] ${className}`}>
      {children}
    </Card>
  );
}

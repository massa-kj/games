import { Card } from '@core/ui';
import type { ReactNode } from 'react';

interface GameCardProps {
  children: ReactNode;
  onClick?: () => void;
  isSelected?: boolean;
  isDisabled?: boolean;
  className?: string;
}

export default function GameCard({
  children,
  onClick,
  isSelected = false,
  isDisabled = false,
  className = ''
}: GameCardProps) {
  return (
    <Card
      className={`
        game-card cursor-pointer transition-all duration-200
        ${isSelected ? 'ring-2 ring-blue-500' : ''}
        ${isDisabled ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'}
        ${className}
      `}
      onClick={isDisabled ? undefined : onClick}
    >
      {children}
    </Card>
  );
}

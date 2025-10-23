import React from 'react';

export interface FlipCardProps {
  /** Whether the card is flipped to show the front */
  isFlipped: boolean;
  /** Content to show on the back (when not flipped) */
  backContent: React.ReactNode;
  /** Content to show on the front (when flipped) */
  frontContent: React.ReactNode;
  /** Optional overlay content (e.g., match indicator) */
  overlayContent?: React.ReactNode;
  /** Click handler */
  onClick?: () => void;
  /** Whether the card is disabled */
  disabled?: boolean;
  /** Custom className */
  className?: string;
  /** Animation duration in milliseconds */
  flipDuration?: number;
}

export function FlipCard({
  isFlipped,
  backContent,
  frontContent,
  overlayContent,
  onClick,
  disabled = false,
  className = '',
  flipDuration = 500,
}: FlipCardProps) {
  const handleClick = () => {
    if (!disabled && onClick) {
      onClick();
    }
  };

  return (
    <div
      className={`
        core-flip-card
        ${disabled ? 'disabled' : ''}
        ${className}
      `}
      onClick={handleClick}
      style={{
        '--flip-duration': `${flipDuration}ms`,
      } as React.CSSProperties}
    >
      <div
        className={`
          core-flip-card-inner
          ${isFlipped ? 'flipped' : ''}
        `}
      >
        {/* Card Back */}
        <div className="core-flip-card-back">
          {backContent}
        </div>

        {/* Card Front */}
        <div className="core-flip-card-front">
          {frontContent}
        </div>

        {/* Overlay Content */}
        {overlayContent && (
          <div className="core-flip-card-overlay">
            {overlayContent}
          </div>
        )}
      </div>
    </div>
  );
}

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
  /** Border radius for the card (CSS value) */
  borderRadius?: string;
}

/**
 * Animated flip card component with front and back content.
 *
 * Features 3D flip animation with customizable duration and optional overlay content.
 * Commonly used in memory card games and interactive content displays.
 *
 * @param isFlipped Whether the card shows front content (true) or back content (false)
 * @param backContent Content displayed when not flipped
 * @param frontContent Content displayed when flipped
 * @param overlayContent Optional overlay content (e.g., match indicators)
 * @param onClick Click handler for card interaction
 * @param disabled Whether the card is disabled from interaction
 * @param className Additional CSS classes
 * @param flipDuration Animation duration in milliseconds
 * @param borderRadius Custom border radius CSS value
 *
 * @example
 * ```tsx
 * <FlipCard
 *   isFlipped={showAnswer}
 *   backContent={<div>?</div>}
 *   frontContent={<div>Answer</div>}
 *   onClick={() => setShowAnswer(!showAnswer)}
 * />
 * ```
 */
export function FlipCard({
  isFlipped,
  backContent,
  frontContent,
  overlayContent,
  onClick,
  disabled = false,
  className = '',
  flipDuration = 500,
  borderRadius,
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
        '--border-radius': borderRadius,
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

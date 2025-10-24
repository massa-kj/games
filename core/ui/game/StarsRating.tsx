export interface StarsRatingProps {
  /** Current rating (0 to maxStars) */
  rating: number;
  /** Maximum number of stars (default: 5) */
  maxStars?: number;
  /** Size of the stars */
  size?: 'sm' | 'md' | 'lg' | 'xl';
  /** Color for filled stars */
  filledColor?: string;
  /** Color for empty stars */
  emptyColor?: string;
  /** Custom className for the container */
  className?: string;
  /** Whether to show fractional stars */
  allowHalf?: boolean;
  /** Whether stars are interactive (clickable) */
  interactive?: boolean;
  /** Callback when rating changes (only for interactive mode) */
  onRatingChange?: (rating: number) => void;
  /** Accessibility label */
  'aria-label'?: string;
}

const sizeClasses = {
  sm: 'text-lg',
  md: 'text-2xl',
  lg: 'text-4xl',
  xl: 'text-6xl',
};

const defaultColors = {
  filled: 'text-yellow-400',
  empty: 'text-gray-300',
};

export function StarsRating({
  rating,
  maxStars = 5,
  size = 'md',
  filledColor = defaultColors.filled,
  emptyColor = defaultColors.empty,
  className = '',
  allowHalf = false,
  interactive = false,
  onRatingChange,
  'aria-label': ariaLabel,
}: StarsRatingProps) {
  // Ensure rating is within bounds
  const clampedRating = Math.max(0, Math.min(maxStars, rating));

  const handleStarClick = (index: number) => {
    if (interactive && onRatingChange) {
      onRatingChange(index + 1);
    }
  };

  const handleStarHover = (_index: number) => {
    if (interactive) {
      // Could add hover state handling here in the future
    }
  };

  const getStarInfo = (index: number): { icon: string; color: string } => {
    let isFilled: boolean;
    if (allowHalf) {
      const starPosition = index + 1;
      if (starPosition <= clampedRating) {
        isFilled = true;
      } else if (starPosition - 0.5 <= clampedRating) {
        // For half stars, we could implement a gradient or different icon
        isFilled = true;
      } else {
        isFilled = false;
      }
    } else {
      // Floor the rating for non-half mode
      isFilled = index < Math.floor(clampedRating);
    }

    return {
      icon: isFilled ? '⭐' : '☆',
      color: isFilled ? filledColor : emptyColor
    };
  };

  const stars = Array.from({ length: maxStars }, (_, index) => {
    const starInfo = getStarInfo(index);
    const isClickable = interactive && onRatingChange;

    return (
      <span
        key={index}
        className={`${sizeClasses[size]} ${starInfo.color} ${
          isClickable
            ? 'cursor-pointer hover:scale-110 transition-transform duration-150'
            : ''
        }`}
        onClick={isClickable ? () => handleStarClick(index) : undefined}
        onMouseEnter={isClickable ? () => handleStarHover(index) : undefined}
        role={isClickable ? 'button' : undefined}
        tabIndex={isClickable ? 0 : undefined}
        onKeyDown={
          isClickable
            ? (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleStarClick(index);
                }
              }
            : undefined
        }
      >
        {starInfo.icon}
      </span>
    );
  });

  return (
    <div
      className={`inline-flex gap-1 ${className}`}
      role="img"
      aria-label={
        ariaLabel || `${clampedRating} out of ${maxStars} stars`
      }
    >
      {stars}
    </div>
  );
}

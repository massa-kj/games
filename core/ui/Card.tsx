import React from 'react';

export interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  hoverable?: boolean;
  padding?: 'sm' | 'md' | 'lg' | 'xl';
}

/**
 * Versatile card component for displaying content with consistent styling.
 *
 * Automatically becomes interactive (button) when onClick is provided,
 * otherwise renders as a div container.
 *
 * @param children Content to display inside the card
 * @param className Additional CSS classes to apply
 * @param onClick Click handler that makes the card interactive
 * @param hoverable Whether to show hover effects without onClick
 * @param padding Padding size variant
 *
 * @example
 * ```tsx
 * <Card padding="lg">
 *   <h3>Card Title</h3>
 *   <p>Card content</p>
 * </Card>
 * ```
 */
export function Card({
  children,
  className = '',
  onClick,
  hoverable = false,
  padding = 'md',
}: CardProps) {
  const isInteractive = hoverable || onClick;

  const classes = [
    'game-card',
    `padding-${padding}`,
    isInteractive ? 'interactive' : '',
    className,
  ].filter(Boolean).join(' ');

  const Component = onClick ? 'button' : 'div';

  return (
    <Component className={classes} onClick={onClick}>
      {children}
    </Component>
  );
}

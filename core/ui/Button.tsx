import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Button style variant */
  variant?: 'primary' | 'secondary' | 'accent' | 'success' | 'warning' | 'error';
  /** Button size */
  size?: 'sm' | 'md' | 'lg' | 'xl';
  /** Button content */
  children: React.ReactNode;
}

/**
 * Large button for young children.
 *
 * @param variant Button style variant
 * @param size Button size
 * @param children Button content
 *
 * @example
 * ```tsx
 * <Button onClick={() => alert('OK!')}>OK</Button>
 * ```
 *
 * @example
 * ```tsx
 * <Button variant="secondary" size="lg">Large Button</Button>
 * ```
 */
export function Button({
  variant = 'primary',
  size = 'md',
  className = '',
  children,
  disabled,
  ...props
}: ButtonProps) {
  const classes = [
    'core-button',
    `variant-${variant}`,
    `size-${size}`,
    className,
  ].join(' ');

  return (
    <button className={classes} disabled={disabled} {...props}>
      {children}
    </button>
  );
}

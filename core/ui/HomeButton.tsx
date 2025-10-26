import { Button, type ButtonProps } from './Button.js';

export interface HomeButtonProps extends Omit<ButtonProps, 'children'> {
  /**
   * The text to display on the button. If not provided, will use a home icon.
   */
  text?: string;
  /**
   * Whether to show both icon and text. Defaults to false (icon only).
   */
  showText?: boolean;
  /**
   * Custom onClick handler. If not provided, will navigate to the site root.
   */
  onClick?: () => void;
}

export function HomeButton({
  text = 'Home',
  showText = false,
  onClick,
  variant = 'secondary',
  size = 'md',
  className = '',
  ...props
}: HomeButtonProps) {
  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      // Navigate to the site root (adjust this URL based on your deployment structure)
      window.location.href = '/';
    }
  };

  const homeIcon = (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={showText ? 'mr-2' : ''}
    >
      <path
        d="M3 12L5 10M5 10L12 3L19 10M5 10V20C5 20.5523 5.44772 21 6 21H9M19 10L21 12M19 10V20C19 20.5523 18.5523 21 18 21H15M9 21C9.55228 21 10 20.5523 10 20V16C10 15.4477 10.4477 15 11 15H13C13.5523 15 14 15.4477 14 16V20C14 20.5523 14.4477 21 15 21M9 21H15"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );

  return (
    <Button
      variant={variant}
      size={size}
      className={`flex items-center justify-center ${className}`}
      onClick={handleClick}
      title={text}
      {...props}
    >
      {homeIcon}
      {showText && <span>{text}</span>}
    </Button>
  );
}

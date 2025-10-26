import { useState, useEffect } from "react";

export type MotionVariant = "fade" | "scale" | "slideUp";

export interface MotionProps {
  type?: MotionVariant;
  show?: boolean;
  children: React.ReactNode;
  /** Animation speed preset: 'fast' | 'normal' | 'slow' or custom duration in seconds */
  speed?: 'fast' | 'normal' | 'slow' | number;
  className?: string;
  /** Called when exit animation completes */
  onAnimationEnd?: () => void;
}

export function Motion({
  type = "fade",
  show = true,
  children,
  speed = 'normal',
  className,
  onAnimationEnd,
}: MotionProps) {
  const [isVisible, setIsVisible] = useState(show);
  const [shouldRender, setShouldRender] = useState(show);

  // Convert speed preset to duration (in milliseconds for CSS)
  const getDuration = () => {
    if (typeof speed === 'number') return speed * 1000;
    switch (speed) {
      case 'fast': return 150;
      case 'slow': return 600;
      default: return 300; // normal
    }
  };

  const duration = getDuration();

  // Handle show/hide transitions
  useEffect(() => {
    if (show) {
      setShouldRender(true);
      // Trigger animation after render
      requestAnimationFrame(() => {
        setIsVisible(true);
      });
    } else {
      setIsVisible(false);
      // Remove from DOM after animation
      const timer = setTimeout(() => {
        setShouldRender(false);
        onAnimationEnd?.();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [show, duration, onAnimationEnd]);

  if (!shouldRender) return null;

  // Get CSS classes based on animation type
  const getAnimationClasses = () => {
    const baseClasses = `transition-all duration-${duration === 150 ? '[150ms]' : duration === 600 ? '[600ms]' : '[300ms]'} ease-out`;

    switch (type) {
      case 'fade':
        return `${baseClasses} ${isVisible ? 'opacity-100' : 'opacity-0'}`;
      case 'scale':
        return `${baseClasses} ${isVisible ? 'scale-100 opacity-100' : 'scale-95 opacity-0'}`;
      case 'slideUp':
        return `${baseClasses} ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'}`;
      default:
        return `${baseClasses} ${isVisible ? 'opacity-100' : 'opacity-0'}`;
    }
  };

  return (
    <div
      className={`${getAnimationClasses()} ${className || ''}`}
      style={{
        transitionDuration: `${duration}ms`,
      }}
    >
      {children}
    </div>
  );
}

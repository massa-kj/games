import { useRef } from "react";
import { usePreventScroll } from "@core/hooks/usePreventScroll";

interface GameContainerProps {
  children: React.ReactNode;
  preventScroll?: boolean;
  className?: string;
}

/**
 * Container component for game content with scroll prevention capabilities.
 *
 * Provides a full-screen container that prevents scrolling and touch interactions
 * when needed, making it ideal for touch-based games.
 *
 * @param children Game content to render inside the container
 * @param preventScroll Whether to prevent scrolling and touch interactions
 * @param className Additional CSS classes to apply
 *
 * @remarks Uses usePreventScroll hook internally to manage scroll behavior.
 */
export const GameContainer: React.FC<GameContainerProps> = ({
  children,
  preventScroll = true,
  className,
}) => {
  const ref = useRef<HTMLDivElement>(null);
  usePreventScroll(preventScroll, ref);

  return (
    <div
      ref={ref}
      className={`w-full h-full overflow-hidden ${
        preventScroll ? "touch-none select-none" : ""
      } ${className}`}
    >
      {children}
    </div>
  );
}

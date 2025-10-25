import { useRef } from "react";
import { usePreventScroll } from "@core/hooks/usePreventScroll";

interface GameContainerProps {
  children: React.ReactNode;
  preventScroll?: boolean;
  className?: string;
}

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

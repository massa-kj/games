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
  usePreventScroll(preventScroll);

  return (
    <div
      className={`relative w-full h-full overflow-hidden ${
        preventScroll ? "touch-none select-none" : ""
      } ${className}`}
    >
      {children}
    </div>
  );
}

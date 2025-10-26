import { motion, AnimatePresence } from "motion/react";
import { variants } from "./variants";

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
  const v = variants[type];

  // Convert speed preset to duration
  const getDuration = () => {
    if (typeof speed === 'number') return speed;
    switch (speed) {
      case 'fast': return 0.15;
      case 'slow': return 0.6;
      default: return 0.3; // normal
    }
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={v.initial}
          animate={v.animate}
          exit={v.exit}
          transition={{ duration: getDuration() }}
          className={className}
          onAnimationComplete={(definition) => {
            if (definition === "exit" && onAnimationEnd) onAnimationEnd();
          }}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}



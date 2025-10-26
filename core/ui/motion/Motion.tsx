import { motion, AnimatePresence } from "motion/react";
import { variants } from "./variants";
import { getDurationFromSpeed } from "./transitions";

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

  // Convert speed preset to duration using CSS variables
  const duration = getDurationFromSpeed(speed, 'seconds');

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={v.initial}
          animate={v.animate}
          exit={v.exit}
          transition={{ duration }}
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



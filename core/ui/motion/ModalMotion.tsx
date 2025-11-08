import { useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { modalVariants } from "./variants";
import { ModalAnimationType, getCssMotionValue, getDurationFromSpeed } from "./transitions";

export interface ModalMotionProps {
  isOpen: boolean;
  onClose?: () => void;
  children: React.ReactNode;
  zIndex?: number;
  disableEscapeClose?: boolean;
  disableBackdropClose?: boolean;
  onAnimationEnd?: () => void;
  animationType?: ModalAnimationType;
  /** Animation speed preset: 'fast' | 'normal' | 'slow' or custom duration in seconds */
  speed?: 'fast' | 'normal' | 'slow' | number;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  backdropClassName?: string;
}

/**
 * Animated modal container component with backdrop and keyboard handling.
 *
 * Provides modal-specific animations, escape key handling, backdrop click
 * detection, and customizable animation types and speeds.
 *
 * @param isOpen Whether the modal is visible
 * @param onClose Callback to close modal
 * @param children Modal content to render
 * @param zIndex CSS z-index for modal layering
 * @param disableEscapeClose Disable closing with Escape key
 * @param disableBackdropClose Disable closing when clicking backdrop
 * @param onAnimationEnd Callback when animation sequence completes
 * @param animationType Type of animation to use for modal
 * @param speed Animation speed preset or custom duration
 * @param size Modal size variant
 * @param className Additional CSS classes for modal content
 * @param backdropClassName Additional CSS classes for backdrop
 *
 * @example
 * ```tsx
 * <ModalMotion
 *   isOpen={showModal}
 *   onClose={() => setShowModal(false)}
 *   animationType="scale"
 *   speed="fast"
 * >
 *   <div>Modal content here</div>
 * </ModalMotion>
 * ```
 *
 * @remarks Uses Framer Motion AnimatePresence for smooth enter/exit animations.
 */
export function ModalMotion({
  isOpen,
  onClose,
  children,
  zIndex = 50,
  disableEscapeClose = false,
  disableBackdropClose = false,
  onAnimationEnd,
  animationType = "modal",
  speed = 'normal',
  size = 'md',
  className,
  backdropClassName,
}: ModalMotionProps) {
  // Close on Escape key
  useEffect(() => {
    if (!isOpen || !onClose || disableEscapeClose) return;
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    document.addEventListener('keydown', handleEscapeKey);
    return () => document.removeEventListener('keydown', handleEscapeKey);
  }, [isOpen, onClose, disableEscapeClose]);

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && !disableBackdropClose && onClose) {
      onClose();
    }
  };

  // Get animation variants based on type
  const contentVariant = modalVariants[animationType];
  const backdropVariant = modalVariants.backdrop;

  // Get transitions based on type with custom speed
  const baseDuration = getDurationFromSpeed(speed, 'seconds');
  const contentTransition = animationType === "modal"
    ? {
        type: "spring" as const,
        duration: baseDuration,
        bounce: getCssMotionValue("--motion-spring-bounce", 0.25)
      }
    : {
        duration: baseDuration,
        ease: "easeInOut" as const
      };

  const backdropTransition = { duration: baseDuration * 0.6 }; // Backdrop is slightly faster

  return (
    <AnimatePresence initial={false} mode="wait">
      {isOpen && (
        <motion.div
          className={`modal ${backdropClassName || ''}`}
          style={{ zIndex }}
          initial={backdropVariant.initial}
          animate={backdropVariant.animate}
          exit={backdropVariant.exit}
          transition={backdropTransition}
        >
          {/* Backdrop */}
          <div
            className="modal-backdrop"
            onClick={handleBackdropClick}
          />

          {/* Modal content */}
          <motion.div
            className={`modal-content size-${size} ${className || ''}`}
            initial={contentVariant.initial}
            animate={contentVariant.animate}
            exit={contentVariant.exit}
            transition={contentTransition}
            onAnimationComplete={(definition) => {
              if (definition === "exit" && onAnimationEnd) onAnimationEnd();
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

import { motion, AnimatePresence } from "motion/react";
import { useEffect } from "react";
import { variants } from "./variants";
import { transitions } from "./transitions";

export type MotionVariant = "fade" | "scale" | "slideUp" | "modal" | "modalBackdrop";

export interface MotionProps {
  type?: MotionVariant;
  show?: boolean;
  children: React.ReactNode;
  duration?: number;
  customTransition?: any;
  className?: string;
  // Modal Props
  onClose?: () => void;
  disableEscapeClose?: boolean;
  disableBackdropClose?: boolean;
  zIndex?: number;
  onAnimationComplete?: () => void;
  includeModalBackdrop?: boolean;
}

export function Motion({
  type = "fade",
  show = true,
  children,
  duration = 0.3,
  customTransition,
  className,
  onClose,
  disableEscapeClose = false,
  disableBackdropClose = false,
  zIndex = 50,
  onAnimationComplete,
  includeModalBackdrop = false,
}: MotionProps) {
  // Close on Escape key (for modals only)
  useEffect(() => {
    if (!show || !onClose || disableEscapeClose || !includeModalBackdrop) return;

    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscapeKey);
    return () => document.removeEventListener('keydown', handleEscapeKey);
  }, [show, onClose, disableEscapeClose, includeModalBackdrop]);

  const v = variants[type];

  // Use custom transition or type-based transition
  const getTransition = () => {
    if (customTransition) return customTransition;
    if (type === "modal") return transitions.modal;
    if (type === "modalBackdrop") return transitions.modalBackdrop;
    return { duration };
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && !disableBackdropClose && onClose) {
      onClose();
    }
  };

  // Modal Props
  if (includeModalBackdrop) {
    const backdropVariant = variants.modalBackdrop;

    return (
      <AnimatePresence>
        {show && (
          <motion.div
            className={`core-modal ${className || ''}`}
            style={{ zIndex }}
            initial={backdropVariant.initial}
            animate={backdropVariant.animate}
            exit={backdropVariant.exit}
            transition={transitions.modalBackdrop}
          >
            {/* Backdrop */}
            <div
              className="core-modal-backdrop"
              onClick={handleBackdropClick}
            />

            {/* Modal Content */}
            <motion.div
              initial={v.initial}
              animate={v.animate}
              exit={v.exit}
              transition={{
                ...getTransition(),
                reducedMotion: "user" // Respect prefers-reduced-motion
              }}
              onAnimationComplete={(definition) => {
                if (definition === "exit" && onAnimationComplete) onAnimationComplete();
              }}
            >
              {children}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    );
  }

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={v.initial}
          animate={v.animate}
          exit={v.exit}
          transition={getTransition()}
          className={className}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}



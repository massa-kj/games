import { useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { modalVariants } from "./variants";
import { transitions, ModalAnimationType } from "./transitions";

export interface ModalMotionProps {
  isOpen: boolean;
  onClose?: () => void;
  children: React.ReactNode;
  zIndex?: number;
  disableEscapeClose?: boolean;
  disableBackdropClose?: boolean;
  onAnimationEnd?: () => void;
  animationType?: ModalAnimationType;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  backdropClassName?: string;
}

export function ModalMotion({
  isOpen,
  onClose,
  children,
  zIndex = 50,
  disableEscapeClose = false,
  disableBackdropClose = false,
  onAnimationEnd,
  animationType = "modal",
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

  // Get transitions based on type
  const contentTransition = animationType === "modal" ? transitions.modal : transitions[animationType];
  const backdropTransition = transitions.modalBackdrop;

  return (
    <AnimatePresence initial={false} mode="wait">
      {isOpen && (
        <motion.div
          className={`core-modal ${backdropClassName || ''}`}
          style={{ zIndex }}
          initial={backdropVariant.initial}
          animate={backdropVariant.animate}
          exit={backdropVariant.exit}
          transition={backdropTransition}
        >
          {/* Backdrop */}
          <div
            className="core-modal-backdrop"
            onClick={handleBackdropClick}
          />

          {/* Modal content */}
          <motion.div
            className={`core-modal-content size-${size} ${className || ''}`}
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

import { useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { variants } from "./variants";
import { transitions } from "./transitions";

interface ModalMotionProps {
  isOpen: boolean;
  onClose?: () => void;
  children: React.ReactNode;
  zIndex?: number;
  disableEscapeClose?: boolean;
  disableBackdropClose?: boolean;
  onAnimationComplete?: () => void;
}

export function ModalMotion({
  isOpen,
  onClose,
  children,
  zIndex = 50,
  disableEscapeClose = false,
  disableBackdropClose = false,
  onAnimationComplete
}: ModalMotionProps) {
  // Close on Escape key
  useEffect(() => {
    if (!isOpen || !onClose || disableEscapeClose) return;
    const handle = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", handle);
    return () => document.removeEventListener("keydown", handle);
  }, [isOpen, onClose, disableEscapeClose]);

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && !disableBackdropClose && onClose) {
      onClose();
    }
  };

  return (
    <AnimatePresence initial={false} mode="wait">
      {isOpen && (
        <motion.div
          className="core-modal-wrapper"
          style={{ zIndex }}
          initial={variants.modalBackdrop.initial}
          animate={variants.modalBackdrop.animate}
          exit={variants.modalBackdrop.exit}
          transition={transitions.modalBackdrop}
          onClick={handleBackdropClick}
        >
          {/* Modal content */}
          <motion.div
            className="core-modal-content"
            initial={variants.modal.initial}
            animate={variants.modal.animate}
            exit={variants.modal.exit}
            transition={transitions.modal}
            onAnimationComplete={onAnimationComplete}
            onClick={(e) => e.stopPropagation()}
          >
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

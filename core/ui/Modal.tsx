import { Motion, ModalAnimationType } from "./motion";

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showCloseButton?: boolean;
  animationType?: ModalAnimationType;
  /** Disable backdrop click to close */
  disableBackdropClose?: boolean;
  /** Custom animation duration (seconds) */
  animationDuration?: number;
  /** Modal z-index */
  zIndex?: number;
  /** Open/close callback */
  onAnimationComplete?: () => void;
  /** Disable close on ESC key */
  disableEscapeClose?: boolean;
}

export function Modal({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  showCloseButton = true,
  animationType = 'modal',
  disableBackdropClose = false,
  animationDuration,
  zIndex = 50,
  onAnimationComplete,
  disableEscapeClose = false,
}: ModalProps) {
  const customTransition = animationDuration
    ? { duration: animationDuration }
    : undefined;
  // if (!isOpen) return null;

  return (
    // <div className="core-modal">
    //   {/* Backdrop */}
    //   <div
    //     className="core-modal-backdrop"
    //     onClick={onClose}
    //   />

    //   {/* Modal */}
    //   <div className={`core-modal-content size-${size} animate-bounce-in`}>
    <Motion
      type={animationType}
      show={isOpen}
      onClose={onClose}
      disableEscapeClose={disableEscapeClose}
      disableBackdropClose={disableBackdropClose}
      zIndex={zIndex}
      onAnimationComplete={onAnimationComplete}
      includeModalBackdrop={true}
      customTransition={customTransition}
    >
      <div className={`core-modal-content size-${size}`}>
        {/* Header */}
        {(title || showCloseButton) && (
          <div className="core-modal-header">
            {title && (
              <h2 className="core-modal-title">{title}</h2>
            )}
            {showCloseButton && (
              <button
                onClick={onClose}
                className="core-modal-close"
                aria-label="Close modal"
              >
                ×
              </button>
            )}
          </div>
        )}

        {/* Content */}
        <div className="core-modal-body">
          {children}
        </div>
      </div>
    </Motion>
  );
}

import { ModalMotion, ModalAnimationType } from "./motion";

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showCloseButton?: boolean;
  animationType?: ModalAnimationType;
  /** Animation speed preset: 'fast' | 'normal' | 'slow' or custom duration in seconds */
  speed?: 'fast' | 'normal' | 'slow' | number;
  /** Disable backdrop click to close */
  disableBackdropClose?: boolean;
  /** Modal z-index */
  zIndex?: number;
  /** Open/close callback */
  onAnimationEnd?: () => void;
  /** Disable close on ESC key */
  disableEscapeClose?: boolean;
}

/**
 * Flexible modal dialog component with animation support.
 *
 * Features customizable animations, multiple sizes, backdrop click handling,
 * and keyboard navigation support.
 *
 * @param isOpen Whether the modal is visible
 * @param onClose Callback when modal should close
 * @param title Optional modal title
 * @param children Modal content
 * @param size Modal size variant
 * @param showCloseButton Whether to show the close button in header
 * @param animationType Animation style for modal appearance
 * @param speed Animation speed preset or custom duration
 * @param disableBackdropClose Prevent closing when clicking backdrop
 * @param zIndex CSS z-index for modal layering
 * @param onAnimationEnd Callback when animation completes
 * @param disableEscapeClose Prevent closing with Escape key
 *
 * @example
 * ```tsx
 * <Modal
 *   isOpen={showModal}
 *   onClose={() => setShowModal(false)}
 *   title="Confirmation"
 *   size="md"
 * >
 *   <p>Are you sure?</p>
 * </Modal>
 * ```
 *
 * @remarks Uses ModalMotion internally for animation handling.
 */
export function Modal({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  showCloseButton = true,
  animationType = 'modal',
  speed = 'slow',
  disableBackdropClose = false,
  zIndex = 50,
  onAnimationEnd,
  disableEscapeClose = false,
}: ModalProps) {
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
    <ModalMotion
      animationType={animationType}
      isOpen={isOpen}
      onClose={onClose}
      disableEscapeClose={disableEscapeClose}
      disableBackdropClose={disableBackdropClose}
      zIndex={zIndex}
      size={size}
      speed={speed}
      onAnimationEnd={onAnimationEnd}
    >
      {/* <div className={`core-modal-content size-${size}`}> */}
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
      {/* </div> */}
    </ModalMotion>
  );
}

import { ModalMotion, ModalAnimationType } from "./motion";

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
  /** Modal z-index */
  zIndex?: number;
  /** Open/close callback */
  onAnimationEnd?: () => void;
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

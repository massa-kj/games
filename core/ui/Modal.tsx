import React from 'react';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showCloseButton?: boolean;
}

export function Modal({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  showCloseButton = true,
}: ModalProps) {
  if (!isOpen) return null;

  return (
    <div className="core-modal">
      {/* Backdrop */}
      <div
        className="core-modal-backdrop"
        onClick={onClose}
      />

      {/* Modal */}
      <div className={`core-modal-content size-${size} animate-bounce-in`}>
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
    </div>
  );
}

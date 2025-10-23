/// <reference types="@testing-library/jest-dom" />
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Modal } from './Modal.js';

describe('Modal', () => {
  describe('basic functionality', () => {
    it('should render when open is true', () => {
      render(
        <Modal isOpen={true} onClose={() => { }}>
          <p>Modal content</p>
        </Modal>
      );

      expect(screen.getByText('Modal content')).toBeInTheDocument();
    });

    it('should not render when open is false', () => {
      render(
        <Modal isOpen={false} onClose={() => { }}>
          <p>Hidden content</p>
        </Modal>
      );

      expect(screen.queryByText('Hidden content')).not.toBeInTheDocument();
    });

    it('should render with title', () => {
      render(
        <Modal isOpen={true} onClose={() => { }} title="Test Modal">
          <p>Content</p>
        </Modal>
      );

      expect(screen.getByText('Test Modal')).toBeInTheDocument();
    });

    it('should have core modal classes', () => {
      const { container } = render(
        <Modal isOpen={true} onClose={() => { }}>
          <p>Content</p>
        </Modal>
      );

      const modalContainer = container.querySelector('.core-modal');
      expect(modalContainer).toBeInTheDocument();
    });
  });

  describe('interactions', () => {
    it('should call onClose when backdrop is clicked', () => {
      const handleClose = vi.fn();
      const { container } = render(
        <Modal isOpen={true} onClose={handleClose}>
          <p>Content</p>
        </Modal>
      );

      const backdrop = container.querySelector('.core-modal-backdrop');
      if (backdrop) {
        fireEvent.click(backdrop);
      }

      expect(handleClose).toHaveBeenCalledTimes(1);
    });

    it('should call onClose when close button is clicked', () => {
      const handleClose = vi.fn();
      render(
        <Modal isOpen={true} onClose={handleClose}>
          <p>Content</p>
        </Modal>
      );

      const closeButton = screen.getByRole('button');
      fireEvent.click(closeButton);

      expect(handleClose).toHaveBeenCalledTimes(1);
    });

    it('should not render close button when showCloseButton is false', () => {
      render(
        <Modal isOpen={true} onClose={() => { }} showCloseButton={false}>
          <p>Content</p>
        </Modal>
      );

      const closeButton = screen.queryByRole('button');
      expect(closeButton).not.toBeInTheDocument();
    });
  });
});

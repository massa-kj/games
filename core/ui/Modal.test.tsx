/// <reference types="@testing-library/jest-dom" />
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { Modal, type ModalProps } from './Modal.js';

describe('Modal', () => {
  describe('rendering', () => {
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

    it('should render without title', () => {
      render(
        <Modal isOpen={true} onClose={() => { }}>
          <p>No title content</p>
        </Modal>
      );

      expect(screen.getByText('No title content')).toBeInTheDocument();
    });
  });

  describe('sizes', () => {
    it('should apply medium size by default', () => {
      const { container } = render(
        <Modal isOpen={true} onClose={() => { }}>
          <p>Medium modal</p>
        </Modal>
      );

      const modal = container.querySelector('.max-w-md');
      expect(modal).toBeInTheDocument();
    });

    it('should apply small size', () => {
      const { container } = render(
        <Modal isOpen={true} onClose={() => { }} size="sm">
          <p>Small modal</p>
        </Modal>
      );

      const modal = container.querySelector('.max-w-sm');
      expect(modal).toBeInTheDocument();
    });

    it('should apply large size', () => {
      const { container } = render(
        <Modal isOpen={true} onClose={() => { }} size="lg">
          <p>Large modal</p>
        </Modal>
      );

      const modal = container.querySelector('.max-w-lg');
      expect(modal).toBeInTheDocument();
    });

    it('should apply extra large size', () => {
      const { container } = render(
        <Modal isOpen={true} onClose={() => { }} size="xl">
          <p>Extra large modal</p>
        </Modal>
      );

      const modal = container.querySelector('.max-w-xl');
      expect(modal).toBeInTheDocument();
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

      const backdrop = container.querySelector('.bg-black.bg-opacity-50');
      if (backdrop) {
        fireEvent.click(backdrop);
      }

      expect(handleClose).toHaveBeenCalledTimes(1);
    });

    it('should not call onClose when modal content is clicked', () => {
      const handleClose = vi.fn();
      render(
        <Modal isOpen={true} onClose={handleClose}>
          <p>Content</p>
        </Modal>
      );

      const content = screen.getByText('Content');
      fireEvent.click(content);

      expect(handleClose).not.toHaveBeenCalled();
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

  describe('header behavior', () => {
    it('should render header when title is provided', () => {
      const { container } = render(
        <Modal isOpen={true} onClose={() => { }} title="Header Test">
          <p>Content</p>
        </Modal>
      );

      const header = container.querySelector('.flex.items-center.justify-between');
      expect(header).toBeInTheDocument();
    });

    it('should render header when close button is shown', () => {
      const { container } = render(
        <Modal isOpen={true} onClose={() => { }} showCloseButton={true}>
          <p>Content</p>
        </Modal>
      );

      const header = container.querySelector('.flex.items-center.justify-between');
      expect(header).toBeInTheDocument();
    });

    it('should not render header when no title and close button is hidden', () => {
      const { container } = render(
        <Modal isOpen={true} onClose={() => { }} showCloseButton={false}>
          <p>Content</p>
        </Modal>
      );

      const header = container.querySelector('.flex.items-center.justify-between');
      expect(header).not.toBeInTheDocument();
    });
  });

  describe('edge cases', () => {
    it('should handle undefined title gracefully', () => {
      render(
        <Modal isOpen={true} onClose={() => { }} title={undefined}>
          <p>Content</p>
        </Modal>
      );

      expect(screen.getByText('Content')).toBeInTheDocument();
    });

    it('should handle empty title gracefully', () => {
      render(
        <Modal isOpen={true} onClose={() => { }} title="">
          <p>Content</p>
        </Modal>
      );

      expect(screen.getByText('Content')).toBeInTheDocument();
    });

    it('should work with minimal props', () => {
      render(
        <Modal isOpen={true} onClose={() => { }}>
          <p>Minimal modal</p>
        </Modal>
      );

      expect(screen.getByText('Minimal modal')).toBeInTheDocument();
    });
  });

  describe('conditional rendering', () => {
    it('should return null when closed', () => {
      const { container } = render(
        <Modal isOpen={false} onClose={() => { }}>
          <p>Should not render</p>
        </Modal>
      );

      expect(container.firstChild).toBeNull();
    });

    it('should render when open', () => {
      const { container } = render(
        <Modal isOpen={true} onClose={() => { }}>
          <p>Should render</p>
        </Modal>
      );

      expect(container.firstChild).not.toBeNull();
      expect(screen.getByText('Should render')).toBeInTheDocument();
    });
  });
});

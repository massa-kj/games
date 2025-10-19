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

  describe('backdrop', () => {
    it('should render backdrop overlay', () => {
      const { container } = render(
        <Modal isOpen={true} onClose={() => { }}>
          <p>Content</p>
        </Modal>
      );

      const backdrop = container.querySelector('.bg-black.bg-opacity-50');
      expect(backdrop).toBeInTheDocument();
    });

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
  });

  describe('close button', () => {
    it('should render close button by default', () => {
      render(
        <Modal isOpen={true} onClose={() => { }}>
          <p>Content</p>
        </Modal>
      );

      const closeButton = screen.getByRole('button');
      expect(closeButton).toBeInTheDocument();
      expect(closeButton).toHaveTextContent('×');
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

  describe('styling', () => {
    it('should have correct backdrop styling', () => {
      const { container } = render(
        <Modal isOpen={true} onClose={() => { }}>
          <p>Content</p>
        </Modal>
      );

      const backdrop = container.querySelector('.bg-black.bg-opacity-50');
      expect(backdrop).toHaveClass(
        'absolute',
        'inset-0',
        'bg-black',
        'bg-opacity-50'
      );
    });

    it('should have correct modal container styling', () => {
      const { container } = render(
        <Modal isOpen={true} onClose={() => { }}>
          <p>Content</p>
        </Modal>
      );

      const modal = container.querySelector('.bg-bg-secondary');
      expect(modal).toHaveClass(
        'relative',
        'bg-bg-secondary',
        'rounded-2xl',
        'shadow-hover',
        'p-6',
        'mx-4',
        'w-full'
      );
    });

    it('should style title correctly', () => {
      render(
        <Modal isOpen={true} onClose={() => { }} title="Styled Title">
          <p>Content</p>
        </Modal>
      );

      const title = screen.getByText('Styled Title');
      expect(title).toHaveClass('text-2xl', 'font-bold', 'text-text');
    });

    it('should style close button correctly', () => {
      render(
        <Modal isOpen={true} onClose={() => { }}>
          <p>Content</p>
        </Modal>
      );

      const closeButton = screen.getByRole('button');
      expect(closeButton).toHaveClass(
        'text-text-light',
        'hover:text-text',
        'text-2xl',
        'font-bold'
      );
    });

    it('should have content wrapper styling', () => {
      const { container } = render(
        <Modal isOpen={true} onClose={() => { }}>
          <p>Content</p>
        </Modal>
      );

      const contentWrapper = container.querySelector('.text-text');
      expect(contentWrapper).toHaveClass('text-text');
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
    it('should handle empty children gracefully', () => {
      const { container } = render(
        <Modal isOpen={true} onClose={() => { }}>
          {null}
        </Modal>
      );

      const modalContent = container.querySelector('.text-text');
      expect(modalContent).toBeInTheDocument();
    });

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

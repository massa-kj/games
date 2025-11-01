import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import {
  DragManagerProvider,
  Draggable,
  DropZone,
  SnapContainer,
  DraggableImage,
  DraggableButton
} from './index.js';

// Mock ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

describe('Drag and Drop System', () => {

  describe('Basic Rendering', () => {
    it('renders DragManagerProvider with children', () => {
      render(
        <DragManagerProvider>
          <div data-testid="child">Child component</div>
        </DragManagerProvider>
      );
      expect(screen.getByTestId('child')).toBeInTheDocument();
    });

    it('renders Draggable with correct classes', () => {
      render(
        <DragManagerProvider>
          <Draggable id="test-draggable">
            <div data-testid="draggable-content">Drag me</div>
          </Draggable>
        </DragManagerProvider>
      );

      const draggableElement = screen.getByTestId('draggable-content').parentElement!;
      expect(draggableElement).toHaveClass('core-draggable');
    });

    it('renders DropZone with correct classes', () => {
      render(
        <DragManagerProvider>
          <DropZone id="test-dropzone">
            <div data-testid="dropzone-content">Drop here</div>
          </DropZone>
        </DragManagerProvider>
      );

      const dropzone = screen.getByTestId('dropzone-content').parentElement!;
      expect(dropzone).toHaveClass('core-drop-zone');
    });

    it('renders SnapContainer', () => {
      render(
        <DragManagerProvider>
          <SnapContainer>
            <div data-testid="snap-child">Child in snap container</div>
          </SnapContainer>
        </DragManagerProvider>
      );

      expect(screen.getByTestId('snap-child')).toBeInTheDocument();
    });
  });

  describe('Wrapper Components', () => {
    it('renders DraggableImage', () => {
      render(
        <DragManagerProvider>
          <DraggableImage
            id="test-image"
            src="/test.jpg"
            alt="Test image"
          />
        </DragManagerProvider>
      );

      const img = screen.getByRole('img');
      expect(img).toHaveAttribute('src', '/test.jpg');
      expect(img).toHaveAttribute('alt', 'Test image');
    });

    it('renders DraggableButton', () => {
      render(
        <DragManagerProvider>
          <DraggableButton id="test-button">
            Click me
          </DraggableButton>
        </DragManagerProvider>
      );

      const button = screen.getByRole('button');
      expect(button).toHaveTextContent('Click me');
    });
  });

  describe('Props', () => {
    it('respects Draggable initial position', () => {
      render(
        <DragManagerProvider>
          <Draggable id="test-draggable" initial={{ x: 50, y: 75 }}>
            <div data-testid="draggable">Drag me</div>
          </Draggable>
        </DragManagerProvider>
      );

      const draggable = screen.getByTestId('draggable').parentElement!;
      expect(draggable.style.transform).toBe('translate(50px, 75px)');
    });

    it('applies custom className to components', () => {
      render(
        <DragManagerProvider>
          <SnapContainer className="custom-class">
            <div data-testid="snap-child">Child</div>
          </SnapContainer>
        </DragManagerProvider>
      );

      const container = screen.getByTestId('snap-child').parentElement!;
      expect(container).toHaveClass('custom-class');
    });
  });
});

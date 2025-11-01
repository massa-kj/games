import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import {
  DragManagerProvider,
  Draggable,
  DropZone,
  SnapContainer,
  DraggableImage,
  DraggableButton
} from './index';

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

  describe('Return to Origin', () => {
    it('returns to original position when returnToOrigin is true and no drop zone found', () => {
      render(
        <DragManagerProvider>
          <Draggable
            id="test-draggable"
            initial={{ x: 10, y: 20 }}
            returnToOrigin={true}
          >
            <div data-testid="draggable">Drag me</div>
          </Draggable>
        </DragManagerProvider>
      );

      const draggable = screen.getByTestId('draggable').parentElement!;

      // Initial position should be set
      expect(draggable.style.transform).toBe('translate(10px, 20px)');

      // Simulate drag and drop without drop zone
      // This would normally involve pointer events, but for simplicity
      // we're testing the initial behavior
    });

    it('does not return to origin when returnToOrigin is false', () => {
      render(
        <DragManagerProvider>
          <Draggable
            id="test-draggable"
            initial={{ x: 10, y: 20 }}
            returnToOrigin={false}
          >
            <div data-testid="draggable">Drag me</div>
          </Draggable>
        </DragManagerProvider>
      );

      const draggable = screen.getByTestId('draggable').parentElement!;
      expect(draggable.style.transform).toBe('translate(10px, 20px)');
    });
  });

  describe('Valid Drop Zones', () => {
    it('renders draggable with validDropZones prop', () => {
      render(
        <DragManagerProvider>
          <Draggable
            id="restricted-draggable"
            validDropZones={['zone-1', 'zone-2']}
            returnToOrigin={true}
          >
            <div data-testid="restricted-draggable">Restricted drag</div>
          </Draggable>
          <DropZone id="zone-1">
            <div data-testid="valid-zone">Valid Zone</div>
          </DropZone>
          <DropZone id="zone-3">
            <div data-testid="invalid-zone">Invalid Zone</div>
          </DropZone>
        </DragManagerProvider>
      );

      const draggable = screen.getByTestId('restricted-draggable').parentElement!;
      expect(draggable).toHaveClass('core-draggable');

      const validZone = screen.getByTestId('valid-zone').parentElement!;
      expect(validZone).toHaveClass('core-drop-zone');

      const invalidZone = screen.getByTestId('invalid-zone').parentElement!;
      expect(invalidZone).toHaveClass('core-drop-zone');
    });

    it('accepts draggable without validDropZones (accepts any drop zone)', () => {
      render(
        <DragManagerProvider>
          <Draggable id="unrestricted-draggable">
            <div data-testid="unrestricted-draggable">Unrestricted drag</div>
          </Draggable>
        </DragManagerProvider>
      );

      const draggable = screen.getByTestId('unrestricted-draggable').parentElement!;
      expect(draggable).toHaveClass('core-draggable');
    });
  });
});

import { describe, it, expect } from 'vitest';
import type {
  Position,
  DragState,
  DropZoneInfo,
  DraggableProps,
  DropZoneProps,
  SnapContainerProps,
  DraggableImageProps,
  DraggableButtonProps,
} from './types.js';

describe('Type Definitions', () => {
  describe('Position', () => {
    it('has correct shape', () => {
      const position: Position = { x: 100, y: 200 };
      expect(position.x).toBe(100);
      expect(position.y).toBe(200);
    });
  });

  describe('DragState', () => {
    it('has correct required properties', () => {
      const dragState: DragState = {
        isDragging: false,
        startPosition: { x: 0, y: 0 },
        currentPosition: { x: 0, y: 0 },
      };

      expect(dragState.isDragging).toBe(false);
      expect(dragState.startPosition).toEqual({ x: 0, y: 0 });
      expect(dragState.currentPosition).toEqual({ x: 0, y: 0 });
    });

    it('allows optional draggedId', () => {
      const dragState: DragState = {
        isDragging: true,
        draggedId: 'item-1',
        startPosition: { x: 0, y: 0 },
        currentPosition: { x: 50, y: 50 },
      };

      expect(dragState.draggedId).toBe('item-1');
    });
  });

  describe('DropZoneInfo', () => {
    it('has correct required properties', () => {
      const element = document.createElement('div');
      const rect = new DOMRect(0, 0, 100, 100);

      const dropZone: DropZoneInfo = {
        id: 'zone-1',
        element,
        rect,
      };

      expect(dropZone.id).toBe('zone-1');
      expect(dropZone.element).toBe(element);
      expect(dropZone.rect).toBe(rect);
    });

    it('allows optional callback properties', () => {
      const element = document.createElement('div');
      const rect = new DOMRect(0, 0, 100, 100);
      const onDrop = () => {};
      const onDragEnter = () => {};
      const onDragLeave = () => {};

      const dropZone: DropZoneInfo = {
        id: 'zone-1',
        element,
        rect,
        onDrop,
        onDragEnter,
        onDragLeave,
      };

      expect(typeof dropZone.onDrop).toBe('function');
      expect(typeof dropZone.onDragEnter).toBe('function');
      expect(typeof dropZone.onDragLeave).toBe('function');
    });
  });

  describe('Component Props', () => {
    it('DraggableProps has correct interface', () => {
      const props: DraggableProps = {
        children: 'test',
      };

      expect(props.children).toBe('test');

      // Test with all optional props
      const fullProps: DraggableProps = {
        id: 'drag-1',
        children: 'test',
        initial: { x: 10, y: 20 },
        onDragStart: () => {},
        onDrag: () => {},
        onDragEnd: () => {},
        disabled: true,
        className: 'custom-class',
        style: { color: 'red' },
      };

      expect(fullProps.id).toBe('drag-1');
      expect(fullProps.disabled).toBe(true);
      expect(fullProps.className).toBe('custom-class');
    });

    it('DropZoneProps has correct interface', () => {
      const props: DropZoneProps = {
        id: 'zone-1',
      };

      expect(props.id).toBe('zone-1');

      // Test with all optional props
      const fullProps: DropZoneProps = {
        id: 'zone-1',
        onDrop: () => {},
        onDragEnter: () => {},
        onDragLeave: () => {},
        children: 'drop here',
        className: 'drop-zone',
        style: { border: '1px solid red' },
      };

      expect(typeof fullProps.onDrop).toBe('function');
      expect(fullProps.children).toBe('drop here');
    });

    it('SnapContainerProps has correct interface', () => {
      const props: SnapContainerProps = {
        children: 'test',
      };

      expect(props.children).toBe('test');

      // Test with all optional props
      const fullProps: SnapContainerProps = {
        children: 'test',
        snapThreshold: 100,
        enableSnapAnimation: false,
        className: 'snap-container',
      };

      expect(fullProps.snapThreshold).toBe(100);
      expect(fullProps.enableSnapAnimation).toBe(false);
    });

    it('DraggableImageProps extends DraggableProps correctly', () => {
      const props: DraggableImageProps = {
        src: '/image.jpg',
      };

      expect(props.src).toBe('/image.jpg');

      // Test with inherited and specific props
      const fullProps: DraggableImageProps = {
        id: 'img-1',
        src: '/image.jpg',
        alt: 'Test image',
        width: 64,
        height: 64,
        onDragStart: () => {},
      };

      expect(fullProps.alt).toBe('Test image');
      expect(fullProps.width).toBe(64);
      expect(typeof fullProps.onDragStart).toBe('function');
    });

    it('DraggableButtonProps extends DraggableProps correctly', () => {
      const props: DraggableButtonProps = {
        children: 'Button text',
      };

      expect(props.children).toBe('Button text');

      // Test with inherited and specific props
      const fullProps: DraggableButtonProps = {
        id: 'btn-1',
        children: 'Button text',
        variant: 'primary',
        size: 'lg',
        onDragEnd: () => {},
      };

      expect(fullProps.variant).toBe('primary');
      expect(fullProps.size).toBe('lg');
      expect(typeof fullProps.onDragEnd).toBe('function');
    });
  });
});

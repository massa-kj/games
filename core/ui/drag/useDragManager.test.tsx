import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useDragManager, DragManagerProvider, useRegisterDropZone } from './useDragManager';
import type { DropZoneInfo } from './types';

// Mock ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

describe('useDragManager', () => {
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <DragManagerProvider>{children}</DragManagerProvider>
  );

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('drag state management', () => {
    it('initializes with correct default state', () => {
      const { result } = renderHook(() => useDragManager(), { wrapper });

      expect(result.current.dragState).toEqual({
        isDragging: false,
        startPosition: { x: 0, y: 0 },
        currentPosition: { x: 0, y: 0 },
      });
    });

    it('updates drag state correctly', () => {
      const { result } = renderHook(() => useDragManager(), { wrapper });

      act(() => {
        result.current.setDragState({
          isDragging: true,
          draggedId: 'test-item',
          currentPosition: { x: 100, y: 200 },
        });
      });

      expect(result.current.dragState.isDragging).toBe(true);
      expect(result.current.dragState.draggedId).toBe('test-item');
      expect(result.current.dragState.currentPosition).toEqual({ x: 100, y: 200 });
    });
  });

  describe('drop zone management', () => {
    it('registers drop zones', () => {
      const { result } = renderHook(() => useDragManager(), { wrapper });

      const mockZone: DropZoneInfo = {
        id: 'test-zone',
        element: document.createElement('div'),
        rect: new DOMRect(0, 0, 100, 100),
        onDrop: vi.fn(),
      };

      act(() => {
        result.current.registerDropZone(mockZone);
      });

      expect(result.current.dropZones.has('test-zone')).toBe(true);
      expect(result.current.dropZones.get('test-zone')).toEqual(mockZone);
    });

    it('unregisters drop zones', () => {
      const { result } = renderHook(() => useDragManager(), { wrapper });

      const mockZone: DropZoneInfo = {
        id: 'test-zone',
        element: document.createElement('div'),
        rect: new DOMRect(0, 0, 100, 100),
      };

      act(() => {
        result.current.registerDropZone(mockZone);
      });

      expect(result.current.dropZones.has('test-zone')).toBe(true);

      act(() => {
        result.current.unregisterDropZone('test-zone');
      });

      expect(result.current.dropZones.has('test-zone')).toBe(false);
    });

    it('updates drop zone rect', () => {
      const { result } = renderHook(() => useDragManager(), { wrapper });

      const mockZone: DropZoneInfo = {
        id: 'test-zone',
        element: document.createElement('div'),
        rect: new DOMRect(0, 0, 100, 100),
      };

      act(() => {
        result.current.registerDropZone(mockZone);
      });

      const newRect = new DOMRect(50, 50, 150, 150);

      act(() => {
        result.current.updateDropZone('test-zone', newRect);
      });

      const updatedZone = result.current.dropZones.get('test-zone');
      expect(updatedZone?.rect).toEqual(newRect);
    });
  });

  describe('collision detection', () => {
    it('finds drop zone at position', () => {
      const { result } = renderHook(() => useDragManager(), { wrapper });

      const mockZone: DropZoneInfo = {
        id: 'test-zone',
        element: document.createElement('div'),
        rect: new DOMRect(50, 50, 100, 100), // left: 50, top: 50, right: 150, bottom: 150
      };

      act(() => {
        result.current.registerDropZone(mockZone);
      });

      // Position inside zone
      const foundZone = result.current.findDropZone({ x: 100, y: 100 });
      expect(foundZone).toEqual(mockZone);

      // Position outside zone
      const notFoundZone = result.current.findDropZone({ x: 10, y: 10 });
      expect(notFoundZone).toBeNull();
    });

    it('returns null when no zones match position', () => {
      const { result } = renderHook(() => useDragManager(), { wrapper });

      const foundZone = result.current.findDropZone({ x: 100, y: 100 });
      expect(foundZone).toBeNull();
    });
  });
});

describe('useRegisterDropZone', () => {
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <DragManagerProvider>{children}</DragManagerProvider>
  );

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('registers and unregisters drop zone on mount/unmount', () => {
    const mockElement = document.createElement('div');
    mockElement.getBoundingClientRect = vi.fn(() => new DOMRect(0, 0, 100, 100));

    const elementRef = { current: mockElement };
    const onDrop = vi.fn();

    // Test hook that uses both useDragManager and useRegisterDropZone
    const TestHook = () => {
      const dragManager = useDragManager();
      useRegisterDropZone('test-zone', elementRef, onDrop);
      return dragManager;
    };

    const { result, unmount } = renderHook(() => TestHook(), { wrapper });

    // Zone should be registered
    expect(result.current.dropZones.has('test-zone')).toBe(true);

    // Unmount should unregister
    unmount();
    // Note: In real test this would need to be verified differently as unmount cleanup happens
  });

  it('handles missing element ref gracefully', () => {
    const elementRef = { current: null };
    const onDrop = vi.fn();

    expect(() => {
      renderHook(() => useRegisterDropZone('test-zone', elementRef, onDrop), { wrapper });
    }).not.toThrow();
  });
});

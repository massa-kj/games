import React, { createContext, useContext, useCallback, useState, useRef } from 'react';
import type { DragState, DropZoneInfo, DragManagerContextValue, Position } from './types';

const DragManagerContext = createContext<DragManagerContextValue | null>(null);

/**
 * Provider component for drag manager context
 * Manages global drag state and drop zone registration
 */
export function DragManagerProvider({ children }: { children: React.ReactNode }) {
  const [dragState, setDragStateInternal] = useState<DragState>({
    isDragging: false,
    startPosition: { x: 0, y: 0 },
    currentPosition: { x: 0, y: 0 },
  });

  const dropZonesRef = useRef<Map<string, DropZoneInfo>>(new Map());

  const setDragState = useCallback((newState: Partial<DragState>) => {
    setDragStateInternal(prev => ({ ...prev, ...newState }));
  }, []);

  const registerDropZone = useCallback((zone: DropZoneInfo) => {
    dropZonesRef.current.set(zone.id, zone);
  }, []);

  const unregisterDropZone = useCallback((id: string) => {
    dropZonesRef.current.delete(id);
  }, []);

  const updateDropZone = useCallback((id: string, rect: DOMRect) => {
    const zone = dropZonesRef.current.get(id);
    if (zone) {
      dropZonesRef.current.set(id, { ...zone, rect });
    }
  }, []);

  const findDropZone = useCallback((position: Position): DropZoneInfo | null => {
    for (const zone of dropZonesRef.current.values()) {
      const rect = zone.rect;
      if (
        position.x >= rect.left &&
        position.x <= rect.right &&
        position.y >= rect.top &&
        position.y <= rect.bottom
      ) {
        return zone;
      }
    }
    return null;
  }, []);

  const contextValue: DragManagerContextValue = {
    dragState,
    dropZones: dropZonesRef.current,
    registerDropZone,
    unregisterDropZone,
    updateDropZone,
    findDropZone,
    setDragState,
  };

  return (
    <DragManagerContext.Provider value={contextValue}>
      {children}
    </DragManagerContext.Provider>
  );
}

/**
 * Hook to access drag manager functionality
 * Provides drag state management and drop zone utilities
 *
 * @returns Drag manager context with state and methods
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { dragState, findDropZone } = useDragManager();
 *
 *   const handleDrop = (position: Position) => {
 *     const zone = findDropZone(position);
 *     if (zone) {
 *       zone.onDrop?.(zone.id, 'my-item');
 *     }
 *   };
 *
 *   return <div>Drag state: {dragState.isDragging}</div>;
 * }
 * ```
 */
export function useDragManager(): DragManagerContextValue {
  const context = useContext(DragManagerContext);
  if (!context) {
    throw new Error('useDragManager must be used within a DragManagerProvider');
  }
  return context;
}

/**
 * Hook to register a drop zone with the drag manager
 * Automatically handles registration and cleanup
 *
 * @param id Unique identifier for the drop zone
 * @param elementRef Ref to the drop zone DOM element
 * @param onDrop Callback fired when item is dropped
 * @param onDragEnter Callback fired when drag enters zone
 * @param onDragLeave Callback fired when drag leaves zone
 *
 * @example
 * ```tsx
 * function DropZoneComponent() {
 *   const ref = useRef<HTMLDivElement>(null);
 *
 *   useRegisterDropZone('my-zone', ref, (zoneId, itemId) => {
 *     console.log(`Item ${itemId} dropped in zone ${zoneId}`);
 *   });
 *
 *   return <div ref={ref}>Drop here</div>;
 * }
 * ```
 */
export function useRegisterDropZone(
  id: string,
  elementRef: React.RefObject<HTMLElement>,
  onDrop?: (zoneId: string, draggableId?: string) => void,
  onDragEnter?: (zoneId: string, draggableId?: string) => void,
  onDragLeave?: (zoneId: string, draggableId?: string) => void
) {
  const { registerDropZone, unregisterDropZone, updateDropZone } = useDragManager();

  React.useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const rect = element.getBoundingClientRect();
    const zone: DropZoneInfo = {
      id,
      element,
      rect,
      onDrop,
      onDragEnter,
      onDragLeave,
    };

    registerDropZone(zone);

    // Update rect on resize
    const resizeObserver = new ResizeObserver(() => {
      updateDropZone(id, element.getBoundingClientRect());
    });
    resizeObserver.observe(element);

    return () => {
      unregisterDropZone(id);
      resizeObserver.disconnect();
    };
  }, [id, elementRef, onDrop, onDragEnter, onDragLeave, registerDropZone, unregisterDropZone, updateDropZone]);
}

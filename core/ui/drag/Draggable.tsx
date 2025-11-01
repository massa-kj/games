import React, { useRef, useState, useEffect, useCallback } from 'react';
import { useDragManager } from './useDragManager';
import type { DraggableProps, Position } from './types';

/**
 * Draggable component that makes any element draggable
 * Supports pointer, touch, and mouse events for cross-device compatibility
 *
 * @param id Unique identifier for the draggable element
 * @param children Content to be made draggable
 * @param initial Initial position of the element
 * @param onDragStart Callback fired when drag starts
 * @param onDrag Callback fired during drag movement
 * @param onDragEnd Callback fired when drag ends
 * @param disabled Whether dragging is disabled
 * @param returnToOrigin Whether to return to original position if not dropped on a valid drop zone
 * @param validDropZones List of valid drop zone IDs that this draggable can be dropped on
 * @param className Additional CSS classes
 * @param style Custom styling
 *
 * @example
 * ```tsx
 * // Basic draggable (can be dropped on any drop zone)
 * <Draggable
 *   id="color-red"
 *   onDragEnd={(pos, id) => console.log(`Dropped ${id} at`, pos)}
 * >
 *   <div className="w-16 h-16 bg-red-500 rounded-lg">Red</div>
 * </Draggable>
 *
 * // Draggable with restricted drop zones
 * <Draggable
 *   id="game-piece"
 *   returnToOrigin={true}
 *   validDropZones={['save-slot-1', 'save-slot-2', 'save-slot-3']}
 *   initial={{ x: 100, y: 100 }}
 * >
 *   <div className="w-12 h-12 bg-blue-500 rounded">Game Piece</div>
 * </Draggable>
 * ```
 */
export function Draggable({
  id,
  children,
  initial = { x: 0, y: 0 },
  onDragStart,
  onDrag,
  onDragEnd,
  disabled = false,
  returnToOrigin = false,
  validDropZones,
  className = '',
  style,
  ...props
}: DraggableProps) {
  const elementRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState<Position>(initial);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState<Position>({ x: 0, y: 0 });
  const [originalPosition, setOriginalPosition] = useState<Position>(initial);

  const { setDragState, findDropZone } = useDragManager();

  // Reset position when initial changes
  useEffect(() => {
    setPosition(initial);
    setOriginalPosition(initial);
  }, [initial]);

  const getPointerPosition = useCallback((e: PointerEvent): Position => {
    return { x: e.clientX, y: e.clientY };
  }, []);

  const getRelativePosition = useCallback((globalPos: Position): Position => {
    const element = elementRef.current;
    if (!element) return { x: 0, y: 0 };

    // For non-absolute positioned elements, we need to calculate position differently
    const containerRect = element.offsetParent?.getBoundingClientRect() || { left: 0, top: 0 };

    return {
      x: globalPos.x - containerRect.left - dragOffset.x,
      y: globalPos.y - containerRect.top - dragOffset.y,
    };
  }, [dragOffset]);

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    if (disabled) return;

    const element = elementRef.current;
    if (!element) return;

    // Calculate offset from pointer to element's top-left corner
    const rect = element.getBoundingClientRect();
    const offset = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    };
    setDragOffset(offset);

    // Record original position at drag start
    if (returnToOrigin) {
      setOriginalPosition(position);
    }

    const startPos = getPointerPosition(e.nativeEvent);
    const relativePos = getRelativePosition(startPos);

    setIsDragging(true);
    setDragState({
      isDragging: true,
      draggedId: id,
      startPosition: startPos,
      currentPosition: startPos,
    });

    onDragStart?.(relativePos, id);

    // Capture pointer to ensure we receive all events
    element.setPointerCapture(e.pointerId);
  }, [disabled, id, position, returnToOrigin, getPointerPosition, getRelativePosition, setDragState, onDragStart]);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!isDragging) return;

    const currentPos = getPointerPosition(e.nativeEvent);
    const relativePos = getRelativePosition(currentPos);

    setPosition(relativePos);
    setDragState({
      currentPosition: currentPos,
    });

    onDrag?.(relativePos, id);
  }, [isDragging, id, getPointerPosition, getRelativePosition, setDragState, onDrag]);

  const handlePointerUp = useCallback((e: React.PointerEvent) => {
    if (!isDragging) return;

    const element = elementRef.current;
    if (!element) return;

    const endPos = getPointerPosition(e.nativeEvent);
    const relativePos = getRelativePosition(endPos);

    // Check for drop zone collision
    const dropZone = findDropZone(endPos);
    let dropSuccess = false;

    if (dropZone) {
      // Check if this drop zone is valid for this draggable
      const isValidDropZone = !validDropZones || validDropZones.includes(dropZone.id);

      if (isValidDropZone) {
        dropZone.onDrop?.(dropZone.id, id);
        dropSuccess = true;
      }
    }

    // Return to original position if returnToOrigin is enabled and drop failed
    if (returnToOrigin && !dropSuccess) {
      setPosition(originalPosition);
    }

    setIsDragging(false);
    setDragState({
      isDragging: false,
      draggedId: undefined,
    });

    onDragEnd?.(dropSuccess ? relativePos : originalPosition, id);

    // Release pointer capture
    element.releasePointerCapture(e.pointerId);
  }, [isDragging, id, returnToOrigin, originalPosition, validDropZones, getPointerPosition, getRelativePosition, findDropZone, setDragState, onDragEnd]);

  // Prevent default drag behavior and context menu
  const handleDragStart = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
  }, []);

  const combinedClassName = [
    'core-draggable',
    // 'absolute',
    'touch-none',
    'select-none',
    'cursor-grab',
    isDragging ? 'cursor-grabbing' : '',
    isDragging ? 'z-50' : 'z-10',
    disabled ? 'opacity-50 cursor-not-allowed' : '',
    className,
  ].filter(Boolean).join(' ');

  const combinedStyle: React.CSSProperties = {
    transform: `translate(${position.x}px, ${position.y}px)`,
    transition: isDragging ? 'none' : 'transform 0.2s ease-out',
    position: isDragging ? 'relative' as const : undefined,
    ...style,
  };

  return (
    <div
      ref={elementRef}
      className={combinedClassName}
      style={combinedStyle}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onDragStart={handleDragStart}
      onContextMenu={handleContextMenu}
      {...props}
    >
      {children}
    </div>
  );
}

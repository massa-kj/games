import { useRef, useEffect, useState } from 'react';
import { useRegisterDropZone, useDragManager } from './useDragManager.js';
import type { DropZoneProps } from './types.js';

/**
 * DropZone component that defines areas where draggable items can be dropped
 * Automatically registers with the drag manager and handles drop events
 *
 * @param id Unique identifier for the drop zone
 * @param onDrop Callback fired when item is dropped
 * @param onDragEnter Callback fired when draggable enters zone
 * @param onDragLeave Callback fired when draggable leaves zone
 * @param children Content inside the drop zone
 * @param className Additional CSS classes
 * @param style Custom styling
 *
 * @example
 * ```tsx
 * <DropZone
 *   id="mixing-bowl"
 *   onDrop={(zoneId, itemId) => {
 *     console.log(`Item ${itemId} dropped in ${zoneId}`);
 *     // Handle the drop logic here
 *   }}
 *   className="w-32 h-32 border-2 border-dashed"
 * >
 *   <div>Drop colors here</div>
 * </DropZone>
 * ```
 */
export function DropZone({
  id,
  onDrop,
  onDragEnter,
  onDragLeave,
  children,
  className = '',
  style,
  ...props
}: DropZoneProps) {
  const elementRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const [isDraggedOver, setIsDraggedOver] = useState(false);

  const { dragState } = useDragManager();

  // Register this drop zone with the drag manager
  useRegisterDropZone(
    id,
    elementRef,
    onDrop,
    (zoneId, draggableId) => {
      setIsDraggedOver(true);
      onDragEnter?.(zoneId, draggableId);
    },
    (zoneId, draggableId) => {
      setIsDraggedOver(false);
      onDragLeave?.(zoneId, draggableId);
    }
  );

  // Check if draggable is over this zone
  useEffect(() => {
    if (!dragState.isDragging) {
      setIsDraggedOver(false);
      return;
    }

    const element = elementRef.current;
    if (!element) return;

    const rect = element.getBoundingClientRect();
    const pos = dragState.currentPosition;

    const isOver = (
      pos.x >= rect.left &&
      pos.x <= rect.right &&
      pos.y >= rect.top &&
      pos.y <= rect.bottom
    );

    if (isOver && !isDraggedOver) {
      setIsDraggedOver(true);
      onDragEnter?.(id, dragState.draggedId);
    } else if (!isOver && isDraggedOver) {
      setIsDraggedOver(false);
      onDragLeave?.(id, dragState.draggedId);
    }
  }, [dragState, isDraggedOver, id, onDragEnter, onDragLeave]);

  const combinedClassName = [
    'core-drop-zone',
    'relative',
    isDraggedOver ? 'drop-zone-active' : '',
    isHovered ? 'drop-zone-hover' : '',
    dragState.isDragging ? 'drop-zone-dragging' : '',
    className,
  ].filter(Boolean).join(' ');

  return (
    <div
      ref={elementRef}
      className={combinedClassName}
      style={style}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      {...props}
    >
      {children}
    </div>
  );
}

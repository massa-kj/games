import { useEffect, useCallback } from 'react';
import { useDragManager } from './useDragManager';
import type { SnapContainerProps, Position, DropZoneInfo } from './types';

/**
 * SnapContainer component that provides automatic snapping and drop coordination
 * Wraps draggables and drop zones to enable snap-to-zone functionality
 *
 * @param children Content that includes draggables and drop zones
 * @param snapThreshold Distance threshold for snapping (default: 50px)
 * @param enableSnapAnimation Enable smooth snap animation (default: true)
 * @param className Additional CSS classes
 *
 * @example
 * ```tsx
 * <SnapContainer snapThreshold={60}>
 *   <Draggable id="item1">
 *     <div>Draggable Item</div>
 *   </Draggable>
 *
 *   <DropZone id="zone1" onDrop={handleDrop}>
 *     <div>Drop Zone</div>
 *   </DropZone>
 * </SnapContainer>
 * ```
 */
export function SnapContainer({
  children,
  snapThreshold = 50,
  enableSnapAnimation = true,
  className = '',
}: SnapContainerProps) {
  const { dragState, dropZones } = useDragManager();

  const findNearestSnapZone = useCallback((position: Position): DropZoneInfo | null => {
    let nearestZone: DropZoneInfo | null = null;
    let minDistance = snapThreshold;

    // Find the drop zone with center closest to the position
    for (const zone of Array.from(dropZones.values())) {
      const rect = zone.rect;
      const zoneCenterX = rect.left + rect.width / 2;
      const zoneCenterY = rect.top + rect.height / 2;

      const distance = Math.sqrt(
        Math.pow(position.x - zoneCenterX, 2) +
        Math.pow(position.y - zoneCenterY, 2)
      );

      if (distance < minDistance) {
        minDistance = distance;
        nearestZone = zone;
      }
    }

    return nearestZone;
  }, [snapThreshold, dropZones]);

  // Handle snap visual feedback during drag
  useEffect(() => {
    if (!dragState.isDragging || !enableSnapAnimation) return;

    const snapZone = findNearestSnapZone(dragState.currentPosition);

    // Add visual feedback for snap zones
    document.querySelectorAll('.core-drop-zone').forEach(el => {
      el.classList.remove('snap-target');
    });

    if (snapZone) {
      snapZone.element.classList.add('snap-target');
    }

    return () => {
      // Cleanup on unmount
      document.querySelectorAll('.core-drop-zone').forEach(el => {
        el.classList.remove('snap-target');
      });
    };
  }, [dragState, findNearestSnapZone, enableSnapAnimation]);

  const combinedClassName = [
    'core-snap-container',
    'relative',
    'w-full',
    'h-full',
    className,
  ].filter(Boolean).join(' ');

  return (
    <div className={combinedClassName}>
      {children}
    </div>
  );
}

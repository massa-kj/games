/**
 * TypeScript type definitions for drag and drop system
 * Provides reusable drag functionality for all games
 */

export interface Position {
  x: number;
  y: number;
}

export interface DragState {
  isDragging: boolean;
  draggedId?: string;
  startPosition: Position;
  currentPosition: Position;
}

export interface DropZoneInfo {
  id: string;
  element: HTMLElement;
  rect: DOMRect;
  onDrop?: (zoneId: string, draggableId?: string) => void;
  onDragEnter?: (zoneId: string, draggableId?: string) => void;
  onDragLeave?: (zoneId: string, draggableId?: string) => void;
}

export interface DragManagerContextValue {
  dragState: DragState;
  dropZones: Map<string, DropZoneInfo>;
  registerDropZone: (zone: DropZoneInfo) => void;
  unregisterDropZone: (id: string) => void;
  updateDropZone: (id: string, rect: DOMRect) => void;
  findDropZone: (position: Position) => DropZoneInfo | null;
  setDragState: (state: Partial<DragState>) => void;
}

export interface DraggableProps {
  /** Unique identifier for the draggable element */
  id?: string;
  /** Content to be made draggable */
  children: React.ReactNode;
  /** Initial position of the draggable element */
  initial?: Position;
  /** Callback fired when drag starts */
  onDragStart?: (position: Position, id?: string) => void;
  /** Callback fired during drag movement */
  onDrag?: (position: Position, id?: string) => void;
  /** Callback fired when drag ends */
  onDragEnd?: (position: Position, id?: string) => void;
  /** Whether dragging is disabled */
  disabled?: boolean;
  /** Additional CSS class names */
  className?: string;
  /** Custom styling */
  style?: React.CSSProperties;
}

export interface DropZoneProps {
  /** Unique identifier for the drop zone */
  id: string;
  /** Callback fired when item is dropped */
  onDrop?: (zoneId: string, draggableId?: string) => void;
  /** Callback fired when draggable enters zone */
  onDragEnter?: (zoneId: string, draggableId?: string) => void;
  /** Callback fired when draggable leaves zone */
  onDragLeave?: (zoneId: string, draggableId?: string) => void;
  /** Content inside the drop zone */
  children?: React.ReactNode;
  /** Additional CSS class names */
  className?: string;
  /** Custom styling */
  style?: React.CSSProperties;
}

export interface SnapContainerProps {
  /** Content that includes draggables and drop zones */
  children: React.ReactNode;
  /** Distance threshold for snapping */
  snapThreshold?: number;
  /** Enable snap animation */
  enableSnapAnimation?: boolean;
  /** Additional CSS class names */
  className?: string;
}

export interface DraggableImageProps extends Omit<DraggableProps, 'children'> {
  /** Image source URL */
  src: string;
  /** Alt text for the image */
  alt?: string;
  /** Image width */
  width?: number;
  /** Image height */
  height?: number;
}

export interface DraggableButtonProps extends Omit<DraggableProps, 'children'> {
  /** Button text content */
  children: React.ReactNode;
  /** Button variant */
  variant?: 'primary' | 'secondary' | 'accent' | 'success' | 'warning' | 'error';
  /** Button size */
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

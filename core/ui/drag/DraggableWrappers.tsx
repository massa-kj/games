import { Draggable } from './Draggable.js';
import { Button } from '../Button.js';
import type { DraggableImageProps, DraggableButtonProps } from './types.js';

/**
 * DraggableImage component - A draggable image wrapper
 * Combines Draggable functionality with image display
 *
 * @param src Image source URL
 * @param alt Alt text for the image
 * @param width Image width (default: 64px)
 * @param height Image height (default: 64px)
 * @param ...draggableProps All Draggable component props
 *
 * @example
 * ```tsx
 * <DraggableImage
 *   id="red-color"
 *   src="/colors/red.png"
 *   alt="Red color"
 *   onDragEnd={(pos, id) => handleColorDrop(pos, id)}
 * />
 * ```
 */
export function DraggableImage({
  src,
  alt = '',
  width = 64,
  height = 64,
  className = '',
  ...draggableProps
}: DraggableImageProps) {
  const combinedClassName = [
    'core-draggable-image',
    className,
  ].filter(Boolean).join(' ');

  return (
    <Draggable className={combinedClassName} {...draggableProps}>
      <img
        src={src}
        alt={alt}
        width={width}
        height={height}
        className="select-none pointer-events-none rounded-lg shadow-md"
        draggable={false}
      />
    </Draggable>
  );
}

/**
 * DraggableButton component - A draggable button wrapper
 * Combines Draggable functionality with Button styling
 *
 * @param children Button content
 * @param variant Button variant (default: 'primary')
 * @param size Button size (default: 'md')
 * @param ...draggableProps All Draggable component props
 *
 * @example
 * ```tsx
 * <DraggableButton
 *   id="tool-brush"
 *   variant="accent"
 *   size="lg"
 *   onDragEnd={(pos, id) => handleToolDrop(pos, id)}
 * >
 *   🖌️ Brush
 * </DraggableButton>
 * ```
 */
export function DraggableButton({
  children,
  variant = 'primary',
  size = 'md',
  className = '',
  ...draggableProps
}: DraggableButtonProps) {
  const combinedClassName = [
    'core-draggable-button',
    className,
  ].filter(Boolean).join(' ');

  return (
    <Draggable className={combinedClassName} {...draggableProps}>
      <Button
        variant={variant}
        size={size}
        className="pointer-events-none"
        disabled
      >
        {children}
      </Button>
    </Draggable>
  );
}

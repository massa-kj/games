import { DropZone } from '@core/ui';
import { DraggableColorCard } from './DraggableColorCard';
import type { ColorPaletteProps } from './types';

export function ColorPalette({ colors, translations, validDropZones }: ColorPaletteProps) {
  return (
    <div>
      <div className="grid grid-cols-4 gap-3">
        {colors.map((color, index) => (
          <DropZone
            key={color.name}
            id={`primary-slot-${index + 1}`}
          >
            <DraggableColorCard
              color={color}
              translations={translations}
              initialPosition={{ x: 0, y: 0 }}
              size="sm"
              returnToOrigin
              validDropZones={validDropZones}
            />
          </DropZone>
        ))}
      </div>
    </div>
  );
}

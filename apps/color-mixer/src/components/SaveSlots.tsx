import { DropZone } from '@core/ui';
import { DraggableColorCard } from './DraggableColorCard';
import type { SaveSlotsProps } from './types';

export function SaveSlots({ savedColors, t, onDrop, validDropZones }: SaveSlotsProps) {
  return (
    <div>
      <div className="grid grid-cols-3 gap-4 justify-items-center">
        {savedColors.map((color, index) => (
          <div key={index} className="text-center">
            <DropZone
              id={`save-slot-${index + 1}`}
              onDrop={onDrop}
              className="w-20 h-20 sm:w-24 sm:h-24 border-2 border-dashed border-gray-300 rounded-xl flex items-center justify-center transition-colors hover:border-blue-400"
            >
              {color ? (
                <DraggableColorCard
                  color={color}
                  t={t}
                  initialPosition={{ x: 0, y: 0 }}
                  size="sm"
                  idPrefix={`saved-${index}`}
                  returnToOrigin
                  validDropZones={validDropZones}
                />
              ) : (
                <div className="text-gray-400 text-xs text-center">
                  {t('saved')}
                </div>
              )}
            </DropZone>
          </div>
        ))}
      </div>
    </div>
  );
}

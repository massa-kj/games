import { Card, Draggable, DropZone, Button } from '@core/ui';
import { rgbToString, getTextColor, getColorName } from '@/utils/colorUtils';
import { DraggableColorCard } from './DraggableColorCard';
import type { ColorMixerProps } from './types';

export function ColorMixer({
  selectedColors,
  mixedColor,
  isAnimating,
  translations,
  onDrop,
  onMixButtonClick,
}: ColorMixerProps) {
  return (
    <div className="space-y-6">
      {/* Mix Button */}
      <div className="text-center">
        <Button
          onClick={onMixButtonClick}
          disabled={!selectedColors[0] || !selectedColors[1] || isAnimating}
          className="px-6 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white rounded-lg font-semibold transition-colors"
        >
          {isAnimating ? 'Mixing...' : translations.mixColors}
        </Button>
      </div>

      {/* Mixer Slots and Generated Color */}
      <div className="grid grid-cols-3 gap-4 items-center justify-items-center">
        {/* Slot 1 */}
        <div className="text-center">
          <div className="text-sm text-gray-500 mb-2">Slot 1</div>
          <DropZone
            id="mixer-slot-1"
            onDrop={onDrop}
            className="w-20 h-20 sm:w-24 sm:h-24 border-2 border-dashed border-gray-300 rounded-xl flex items-center justify-center transition-colors hover:border-purple-400"
          >
            {selectedColors[0] ? (
              <DraggableColorCard
                color={selectedColors[0]}
                translations={translations}
                initialPosition={{ x: 0, y: 0 }}
                size="sm"
                idPrefix="mixer-1"
                returnToOrigin
                validDropZones={[]}
              />
            ) : (
              <div className="text-gray-400 text-xs text-center">Drop color</div>
            )}
          </DropZone>
        </div>

        {/* Generated Color */}
        <div className="text-center">
          <div className="text-sm text-gray-500 mb-2">Mixed Color</div>
          <DropZone id="generated-slot">
            {mixedColor ? (
              <Draggable
                id={`color-mixed-${Date.now()}`}
                className="inline-block"
                initial={{ x: 0, y: 0 }}
                returnToOrigin
                validDropZones={['save-slot-1', 'save-slot-2', 'save-slot-3']}
              >
                <Card
                  className={`w-20 h-20 sm:w-24 sm:h-24 transition-all duration-500 cursor-grab active:cursor-grabbing ${
                    isAnimating ? 'animate-pulse-gentle' : 'animate-bounce-in'
                  }`}
                  padding="sm"
                >
                  <div
                    className="w-full h-full rounded-xl flex items-center justify-center font-bold text-sm shadow-inner"
                    style={{
                      backgroundColor: rgbToString(mixedColor),
                      color: getTextColor(mixedColor),
                    }}
                  >
                    {/* @ts-ignore - translations.colorNames has the color name */}
                    {translations.colorNames[getColorName(mixedColor) as keyof typeof translations.colorNames] ||
                     translations.colorNames.unknown}
                  </div>
                </Card>
              </Draggable>
            ) : (
              <div className="w-20 h-20 sm:w-24 sm:h-24 border-2 border-dashed border-gray-300 rounded-xl flex items-center justify-center text-gray-400 text-xs">
                {isAnimating ? 'Mixing...' : 'Result'}
              </div>
            )}
          </DropZone>
        </div>

        {/* Slot 2 */}
        <div className="text-center">
          <div className="text-sm text-gray-500 mb-2">Slot 2</div>
          <DropZone
            id="mixer-slot-2"
            onDrop={onDrop}
            className="w-20 h-20 sm:w-24 sm:h-24 border-2 border-dashed border-gray-300 rounded-xl flex items-center justify-center transition-colors hover:border-purple-400"
          >
            {selectedColors[1] ? (
              <DraggableColorCard
                color={selectedColors[1]}
                translations={translations}
                initialPosition={{ x: 0, y: 0 }}
                size="sm"
                idPrefix="mixer-2"
                returnToOrigin
                validDropZones={[]}
              />
            ) : (
              <div className="text-gray-400 text-xs text-center">Drop color</div>
            )}
          </DropZone>
        </div>
      </div>
    </div>
  );
}

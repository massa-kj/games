import { useState } from 'react';
import { Card, Button, Draggable, DropZone } from '@core/ui';
import type { RGB, ColorDefinition, GameTranslations, SavedColor } from '@/types';
import { rgbToString, getTextColor, getColorName, mixColors as mixTwoColors } from '@/utils/colorUtils';
import { PRIMARY_COLORS } from '@/utils/colorUtils';

interface IntegratedColorMixerProps {
  savedColors: SavedColor[];
  onSaveColor: (color: RGB, slotIndex?: number) => void;
  translations: GameTranslations;
  onPlayMixSound: () => Promise<void>;
  onPlaySuccessSound: () => Promise<void>;
}

interface DraggableColorCardProps {
  color: ColorDefinition;
  translations: GameTranslations;
  initialPosition: { x: number; y: number };
  size?: 'sm' | 'md' | 'lg';
  idPrefix?: string;
  returnToOrigin?: boolean;
  validDropZones?: string[];
}

function DraggableColorCard({ color, translations, initialPosition, size = 'md', idPrefix, returnToOrigin, validDropZones }: DraggableColorCardProps) {
  const sizeClasses = {
    sm: 'w-16 h-16 sm:w-20 sm:h-20',
    md: 'w-20 h-20 sm:w-24 sm:h-24',
    lg: 'w-24 h-24 sm:w-28 sm:h-28'
  };

  return (
    <Draggable
      id={`${idPrefix || 'color'}-${color.name}`}
      className="inline-block"
      initial={initialPosition}
      returnToOrigin={returnToOrigin}
      validDropZones={validDropZones}
    >
      <Card
        className={`${sizeClasses[size]} flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-200 cursor-grab active:cursor-grabbing`}
        padding="sm"
      >
        <div
          className="w-full h-full rounded-xl flex items-center justify-center font-bold text-sm shadow-inner"
          style={{
            backgroundColor: rgbToString(color.rgb),
            color: getTextColor(color.rgb),
          }}
        >
          {/* @ts-ignore - translations.colorNames has the color name */}
          {translations.colorNames[getColorName(color.rgb) as keyof typeof translations.colorNames] ||
           translations.colorNames.unknown}
        </div>
      </Card>
    </Draggable>
  );
}

export function IntegratedColorMixer({
  savedColors,
  onSaveColor,
  translations,
  onPlayMixSound,
  onPlaySuccessSound,
}: IntegratedColorMixerProps) {
  const [selectedColors, setSelectedColors] = useState<(ColorDefinition | null)[]>([null, null]);
  const [mixedColor, setMixedColor] = useState<RGB | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);

  const primaryColors: ColorDefinition[] = PRIMARY_COLORS;

  // Convert SavedColor to ColorDefinition format
  const savedColorDefinitions: (ColorDefinition | null)[] = [
    savedColors[0] ? {
      name: getColorName(savedColors[0].rgb),
      rgb: savedColors[0].rgb,
      isPrimary: false
    } : null,
    savedColors[1] ? {
      name: getColorName(savedColors[1].rgb),
      rgb: savedColors[1].rgb,
      isPrimary: false
    } : null,
    savedColors[2] ? {
      name: getColorName(savedColors[2].rgb),
      rgb: savedColors[2].rgb,
      isPrimary: false
    } : null,
  ];

  const findColorByDragId = (dragId: string): ColorDefinition | null => {
    // Check if it's a generated mixed color
    if (dragId.startsWith('color-mixed-')) {
      if (!mixedColor) return null;
      return {
        name: getColorName(mixedColor),
        rgb: mixedColor,
        isPrimary: false
      };
    }

    // Check if it's a saved color (format: saved-{index}-{colorName})
    if (dragId.startsWith('saved-')) {
      const parts = dragId.split('-');
      if (parts.length >= 3) {
        const index = parseInt(parts[1]);
        if (index >= 0 && index < savedColorDefinitions.length && savedColorDefinitions[index]) {
          return savedColorDefinitions[index];
        }
      }
    }

    // Extract color identifier from dragId for primary colors
    const colorKey = dragId.replace('color-', '');

    // Check from primary colors
    const primaryColor = PRIMARY_COLORS.find(c => c.name === colorKey);
    if (primaryColor) return primaryColor;

    return null;
  };

  const handleColorDrop = async (zoneId: string, dragId?: string) => {
    if (!dragId || isAnimating) return;

    const color = findColorByDragId(dragId);
    if (!color) return;

    // Handle drops to save slots
    if (zoneId.startsWith('save-slot-')) {
      const slotNumber = parseInt(zoneId.replace('save-slot-', ''));
      const slotIndex = slotNumber - 1; // Convert to 0-based index
      onSaveColor(color.rgb, slotIndex);
      await onPlaySuccessSound();
      return;
    }

    if (zoneId === 'mixer-slot-1') {
      // Update slot 1, preserve slot 2
      const newSelectedColors: (ColorDefinition | null)[] = [...selectedColors];
      newSelectedColors[0] = color;
      setSelectedColors(newSelectedColors);
      setMixedColor(null);

      // If both slots are filled, mix automatically
      // if (newSelectedColors[0] && newSelectedColors[1]) {
      //   await mixColors([newSelectedColors[0], newSelectedColors[1]]);
      // }
    } else if (zoneId === 'mixer-slot-2') {
      // Update slot 2, preserve slot 1
      const newSelectedColors: (ColorDefinition | null)[] = [...selectedColors];
      newSelectedColors[1] = color;
      setSelectedColors(newSelectedColors);
      setMixedColor(null);

      // If both slots are filled, mix automatically
      // if (newSelectedColors[0] && newSelectedColors[1]) {
      //   await mixColors([newSelectedColors[0], newSelectedColors[1]]);
      // }
    }
  };

  const mixColors = async (colors: ColorDefinition[]) => {
    if (colors.length !== 2) return;

    setIsAnimating(true);
    setMixedColor(null);

    // Play mixing sound
    await onPlayMixSound();

    // Simulate mixing animation delay
    setTimeout(() => {
      const mixed = mixTwoColors(colors[0].rgb, colors[1].rgb);
      setMixedColor(mixed);
      setIsAnimating(false);
    }, 800);
  };

  const handleMixButtonClick = async () => {
    if (selectedColors[0] && selectedColors[1]) {
      await mixColors([selectedColors[0], selectedColors[1]]);
    }
  };



  return (
    <div className="space-y-6">
      {/* Primary Colors */}
      <div>
        <div className="grid grid-cols-4 gap-3">
          {primaryColors.map((color, index) => (
            <DropZone
              id={`primary-slot-${index + 1}`}
              // onDrop={handleColorDrop}
              // className="w-20 h-20 sm:w-24 sm:h-24 border-2 border-dashed border-gray-300 rounded-xl flex items-center justify-center transition-colors hover:border-blue-400"
            >
              <DraggableColorCard
                key={color.name}
                color={color}
                translations={translations}
                initialPosition={{ x: 0, y: 0 }}
                size="sm"
                returnToOrigin
                validDropZones={['mixer-slot-1', 'mixer-slot-2']}
              />
            </DropZone>
          ))}
        </div>
      </div>

      {/* Save Slots */}
      <div>
        <div className="grid grid-cols-3 gap-4 justify-items-center">
          {/* Save Slot 1 */}
          <div className="text-center">
            <DropZone
              id="save-slot-1"
              onDrop={handleColorDrop}
              className="w-20 h-20 sm:w-24 sm:h-24 border-2 border-dashed border-gray-300 rounded-xl flex items-center justify-center transition-colors hover:border-blue-400"
            >
              {savedColorDefinitions[0] ? (
                <DraggableColorCard
                  color={savedColorDefinitions[0]}
                  translations={translations}
                  initialPosition={{ x: 0, y: 0 }}
                  size="sm"
                  idPrefix="saved-0"
                  returnToOrigin
                  validDropZones={['mixer-slot-1', 'mixer-slot-2']}
                />
              ) : (
                <div className="text-gray-400 text-xs text-center">
                  {translations.saved}
                </div>
              )}
            </DropZone>
          </div>

          {/* Save Slot 2 */}
          <div className="text-center">
            <DropZone
              id="save-slot-2"
              onDrop={handleColorDrop}
              className="w-20 h-20 sm:w-24 sm:h-24 border-2 border-dashed border-gray-300 rounded-xl flex items-center justify-center transition-colors hover:border-blue-400"
            >
              {savedColorDefinitions[1] ? (
                <DraggableColorCard
                  color={savedColorDefinitions[1]}
                  translations={translations}
                  initialPosition={{ x: 0, y: 0 }}
                  size="sm"
                  idPrefix="saved-1"
                  returnToOrigin
                  validDropZones={['mixer-slot-1', 'mixer-slot-2']}
                />
              ) : (
                <div className="text-gray-400 text-xs text-center">
                  {translations.saved}
                </div>
              )}
            </DropZone>
          </div>

          {/* Save Slot 3 */}
          <div className="text-center">
            <DropZone
              id="save-slot-3"
              onDrop={handleColorDrop}
              className="w-20 h-20 sm:w-24 sm:h-24 border-2 border-dashed border-gray-300 rounded-xl flex items-center justify-center transition-colors hover:border-blue-400"
            >
              {savedColorDefinitions[2] ? (
                <DraggableColorCard
                  color={savedColorDefinitions[2]}
                  translations={translations}
                  initialPosition={{ x: 0, y: 0 }}
                  size="sm"
                  idPrefix="saved-2"
                  returnToOrigin
                  validDropZones={['mixer-slot-1', 'mixer-slot-2']}
                />
              ) : (
                <div className="text-gray-400 text-xs text-center">
                  {translations.saved}
                </div>
              )}
            </DropZone>
          </div>
        </div>
      </div>

      {/* Mix Button */}
      <div className="text-center">
        <Button
          onClick={handleMixButtonClick}
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
            onDrop={handleColorDrop}
            className="w-20 h-20 sm:w-24 sm:h-24 border-2 border-dashed border-gray-300 rounded-xl flex items-center justify-center transition-colors hover:border-purple-400"
          >
            {selectedColors[0] ? (
              <DraggableColorCard
                color={selectedColors[0]}
                translations={translations}
                initialPosition={{ x: 0, y: 0 }}
                size="sm"
                idPrefix='mixer-1'
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
          <DropZone
            id="generated-slot"
            // onDrop={handleColorDrop}
            // className="w-20 h-20 sm:w-24 sm:h-24 border-2 border-dashed border-gray-300 rounded-xl flex items-center justify-center transition-colors hover:border-purple-400"
          >
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
            onDrop={handleColorDrop}
            className="w-20 h-20 sm:w-24 sm:h-24 border-2 border-dashed border-gray-300 rounded-xl flex items-center justify-center transition-colors hover:border-purple-400"
          >
            {selectedColors[1] ? (
              <DraggableColorCard
                color={selectedColors[1]}
                translations={translations}
                initialPosition={{ x: 0, y: 0 }}
                size="sm"
                idPrefix='mixer-2'
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

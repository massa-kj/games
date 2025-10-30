import { useState } from 'react';
import { Card, Button } from '@core/ui';
import type { RGB, ColorDefinition, GameTranslations } from '@/types';
import { rgbToString, getTextColor, getColorName } from '@/utils/colorUtils';

interface ColorMixerProps {
  selectedColors: ColorDefinition[];
  mixedColor: RGB | null;
  isAnimating: boolean;
  onMix: () => void;
  onSaveColor: () => void;
  onClearSelection: () => void;
  translations: GameTranslations;
}

export default function ColorMixer({
  selectedColors,
  mixedColor,
  isAnimating,
  onMix,
  onSaveColor,
  onClearSelection,
  translations,
}: ColorMixerProps) {
  const [showSaveButton, setShowSaveButton] = useState(false);

  const handleMix = () => {
    onMix();
    setShowSaveButton(true);
  };

  const handleSave = () => {
    onSaveColor();
    setShowSaveButton(false);
  };

  const handleClear = () => {
    onClearSelection();
    setShowSaveButton(false);
  };

  const canMix = selectedColors.length === 2;
  const hasMixedColor = mixedColor !== null;

  return (
    <div className="space-y-6">
      {/* Selected colors display */}
      <div className="text-center">
        <h3 className="text-lg font-bold text-gray-700 mb-4">
          {canMix ? translations.mixColors : translations.tapTwoColors}
        </h3>

        <div className="flex justify-center items-center gap-4 mb-6">
          {/* Color 1 */}
          <div className="flex flex-col items-center">
            {selectedColors[0] ? (
              <Card className="w-20 h-20 transition-all duration-300" padding="sm">
                <div
                  className="w-full h-full rounded-lg shadow-inner"
                  style={{ backgroundColor: rgbToString(selectedColors[0].rgb) }}
                />
              </Card>
            ) : (
              <div className="w-20 h-20 border-2 border-dashed border-gray-300 rounded-xl flex items-center justify-center text-gray-400 text-xs">
                ?
              </div>
            )}
            <span className="text-sm text-gray-500 mt-2">1</span>
          </div>

          {/* Plus sign or mixing animation */}
          <div className="flex items-center justify-center w-12 h-12">
            {isAnimating ? (
              <div className="animate-spin text-2xl">🌀</div>
            ) : (
              <span className="text-2xl text-gray-400">+</span>
            )}
          </div>

          {/* Color 2 */}
          <div className="flex flex-col items-center">
            {selectedColors[1] ? (
              <Card className="w-20 h-20 transition-all duration-300" padding="sm">
                <div
                  className="w-full h-full rounded-lg shadow-inner"
                  style={{ backgroundColor: rgbToString(selectedColors[1].rgb) }}
                />
              </Card>
            ) : (
              <div className="w-20 h-20 border-2 border-dashed border-gray-300 rounded-xl flex items-center justify-center text-gray-400 text-xs">
                ?
              </div>
            )}
            <span className="text-sm text-gray-500 mt-2">2</span>
          </div>
        </div>

        {/* Mix button */}
        {canMix && !isAnimating && (
          <Button
            onClick={handleMix}
            variant="primary"
            size="lg"
            className="mb-4"
          >
            {translations.mixColors}
          </Button>
        )}

        {/* Clear button */}
        {selectedColors.length > 0 && (
          <Button
            onClick={handleClear}
            variant="secondary"
            size="sm"
            className="ml-2"
          >
            Clear
          </Button>
        )}
      </div>

      {/* Result color display */}
      {hasMixedColor && (
        <div className="text-center">
          <h3 className="text-lg font-bold text-gray-700 mb-4">
            {translations.newColor}
          </h3>

          <Card
            className={`
              mx-auto w-32 h-32 transition-all duration-500
              ${isAnimating ? 'animate-pulse-gentle' : 'animate-bounce-in'}
            `}
            padding="sm"
          >
            <div
              className="w-full h-full rounded-xl flex items-center justify-center font-bold text-lg shadow-inner"
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

          {/* Save button */}
          {showSaveButton && !isAnimating && (
            <div className="mt-4">
              <Button
                onClick={handleSave}
                variant="success"
                size="lg"
              >
                {translations.saveColor}
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

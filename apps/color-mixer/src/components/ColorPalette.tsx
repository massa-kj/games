import { Card } from '@core/ui';
import type { ColorDefinition, SavedColor, GameTranslations } from '@/types';
import { rgbToString, getTextColor } from '@/utils/colorUtils';

interface ColorPaletteProps {
  primaryColors: ColorDefinition[];
  savedColors: SavedColor[];
  selectedColors: ColorDefinition[];
  onColorSelect: (color: ColorDefinition) => void;
  onClearSaved: () => void;
  translations: GameTranslations;
}

interface ColorCardProps {
  color: ColorDefinition;
  isSelected: boolean;
  onClick: () => void;
  translations: GameTranslations;
}

function ColorCard({ color, isSelected, onClick, translations }: ColorCardProps) {
  const colorStyle = rgbToString(color.rgb);
  const textColor = getTextColor(color.rgb);

  return (
    <Card
      className={`
        relative w-24 h-24 sm:w-28 sm:h-28
        transition-all duration-200 cursor-pointer select-none
        ${isSelected ? 'ring-4 ring-blue-400 ring-offset-2 scale-105' : 'hover:scale-110'}
      `}
      onClick={onClick}
      padding="sm"
    >
      <div
        className="w-full h-full rounded-xl flex items-center justify-center font-bold text-sm shadow-inner"
        style={{ backgroundColor: colorStyle, color: textColor }}
      >
        {/* @ts-ignore - translations.colorNames is typed properly */}
        {translations.colorNames[color.name as keyof typeof translations.colorNames] || color.name}
      </div>
    </Card>
  );
}

export default function ColorPalette({
  primaryColors,
  savedColors,
  selectedColors,
  onColorSelect,
  onClearSaved,
  translations,
}: ColorPaletteProps) {
  // Convert saved colors to ColorDefinition format
  const savedColorDefinitions: ColorDefinition[] = savedColors.map((saved, index) => ({
    name: `saved-${index}`,
    rgb: saved.rgb,
    isPrimary: false,
  }));

  return (
    <div className="space-y-6">
      {/* Primary colors */}
      <div>
        <h3 className="text-lg font-bold text-gray-700 mb-3 text-center">
          {translations.colorNames.red}, {translations.colorNames.blue}, {translations.colorNames.green}, {translations.colorNames.white}
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 justify-items-center">
          {primaryColors.map((color) => (
            <ColorCard
              key={color.name}
              color={color}
              isSelected={selectedColors.some(selected => selected.name === color.name)}
              onClick={() => onColorSelect(color)}
              translations={translations}
            />
          ))}
        </div>
      </div>

      {/* Saved slots */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-bold text-gray-700">
            {translations.saved}
          </h3>
          {savedColors.length > 0 && (
            <button
              onClick={onClearSaved}
              className="text-sm text-red-500 hover:text-red-700 font-medium transition-colors"
            >
              {translations.clearSaved}
            </button>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4 justify-items-center">
          {/* Slot A */}
          <div className="text-center">
            <div className="text-sm text-gray-500 mb-2">{translations.slotA}</div>
            {savedColorDefinitions[0] ? (
              <ColorCard
                color={savedColorDefinitions[0]}
                isSelected={selectedColors.some(selected => selected.name === savedColorDefinitions[0].name)}
                onClick={() => onColorSelect(savedColorDefinitions[0])}
                translations={translations}
              />
            ) : (
              <div className="w-24 h-24 sm:w-28 sm:h-28 border-2 border-dashed border-gray-300 rounded-xl flex items-center justify-center text-gray-400 text-xs">
                {translations.saved}
              </div>
            )}
          </div>

          {/* Slot B */}
          <div className="text-center">
            <div className="text-sm text-gray-500 mb-2">{translations.slotB}</div>
            {savedColorDefinitions[1] ? (
              <ColorCard
                color={savedColorDefinitions[1]}
                isSelected={selectedColors.some(selected => selected.name === savedColorDefinitions[1].name)}
                onClick={() => onColorSelect(savedColorDefinitions[1])}
                translations={translations}
              />
            ) : (
              <div className="w-24 h-24 sm:w-28 sm:h-28 border-2 border-dashed border-gray-300 rounded-xl flex items-center justify-center text-gray-400 text-xs">
                {translations.saved}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

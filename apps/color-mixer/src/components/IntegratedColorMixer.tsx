import { useState } from 'react';
import type { RGB, ColorDefinition, GameTranslations, SavedColor } from '@/types';
import { getColorName, mixColors as mixTwoColors } from '@/utils/colorUtils';
import { PRIMARY_COLORS } from '@/utils/colorUtils';
import { ColorPalette } from './ColorPalette';
import { SaveSlots } from './SaveSlots';
import { ColorMixer } from './ColorMixer';

interface IntegratedColorMixerProps {
  savedColors: SavedColor[];
  onSaveColor: (color: RGB, slotIndex?: number) => void;
  translations: GameTranslations;
  onPlayMixSound: () => Promise<void>;
  onPlaySuccessSound: () => Promise<void>;
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

    // Handle drops to mixer slots
    if (zoneId.startsWith('mixer-slot-')) {
      const slotNumber = parseInt(zoneId.replace('mixer-slot-', ''));
      const slotIndex = slotNumber - 1; // Convert to 0-based index
      const newSelectedColors: (ColorDefinition | null)[] = [...selectedColors];
      newSelectedColors[slotIndex] = color;
      setSelectedColors(newSelectedColors);
      setMixedColor(null);
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
      <ColorPalette
        colors={primaryColors}
        translations={translations}
        validDropZones={['mixer-slot-1', 'mixer-slot-2']}
      />

      {/* Save Slots */}
      <SaveSlots
        savedColors={savedColorDefinitions}
        translations={translations}
        onDrop={handleColorDrop}
        validDropZones={['mixer-slot-1', 'mixer-slot-2']}
      />

      {/* Color Mixer */}
      <ColorMixer
        selectedColors={selectedColors}
        mixedColor={mixedColor}
        isAnimating={isAnimating}
        translations={translations}
        onDrop={handleColorDrop}
        onMixButtonClick={handleMixButtonClick}
      />
    </div>
  );
}

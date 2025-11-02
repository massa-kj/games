import { useState } from 'react';
import type { RGB, ColorDefinition, GameTranslations, SavedColor } from '@/types';
import { getColorName, mixColors as mixTwoColors } from '@/utils/colorUtils';
import { PRIMARY_COLORS } from '@/utils/colorUtils';
import { ColorMixer } from './ColorMixer';
import { ColorSelectionModal } from './ColorSelectionModal';
import { SaveResultModal } from './SaveResultModal';

interface IntegratedColorMixerProps {
  savedColors: SavedColor[];
  onSaveColor: (color: RGB, slotIndex?: number) => void;
  onMixColors?: () => Promise<void>;
  translations: GameTranslations;
  onPlayMixSound: () => Promise<void>;
  onPlaySuccessSound: () => Promise<void>;
}

export function IntegratedColorMixer({
  savedColors,
  onSaveColor,
  onMixColors,
  translations,
  onPlayMixSound,
  onPlaySuccessSound,
}: IntegratedColorMixerProps) {
  const [selectedColors, setSelectedColors] = useState<(ColorDefinition | null)[]>([null, null]);
  const [mixedColor, setMixedColor] = useState<RGB | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);

  // Modal states
  const [colorSelectionModal, setColorSelectionModal] = useState<{
    isOpen: boolean;
    slotIndex: number | null;
  }>({ isOpen: false, slotIndex: null });
  const [saveResultModal, setSaveResultModal] = useState(false);

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

  const handleSlotClick = (slotIndex: number) => {
    setColorSelectionModal({ isOpen: true, slotIndex });
  };

  const handleColorSelect = (color: ColorDefinition) => {
    if (colorSelectionModal.slotIndex !== null) {
      const newSelectedColors: (ColorDefinition | null)[] = [...selectedColors];
      newSelectedColors[colorSelectionModal.slotIndex] = color;
      setSelectedColors(newSelectedColors);
      setMixedColor(null); // Reset mixed color when changing inputs
    }
    setColorSelectionModal({ isOpen: false, slotIndex: null });
  };

  const handleGeneratedColorClick = () => {
    if (mixedColor) {
      setSaveResultModal(true);
    }
  };

  const handleColorDrop = async (zoneId: string, dragId?: string) => {
    if (!dragId || !mixedColor) return;

    // Handle drops to save slots in the save modal
    if (zoneId.startsWith('save-slot-')) {
      const slotNumber = parseInt(zoneId.replace('save-slot-', ''));
      const slotIndex = slotNumber - 1; // Convert to 0-based index
      onSaveColor(mixedColor, slotIndex);
      await onPlaySuccessSound();
      setSaveResultModal(false);
    }
  };

  const mixColors = async (colors: ColorDefinition[]) => {
    if (colors.length !== 2) return;

    setIsAnimating(true);
    setMixedColor(null);

    // Play mixing sound
    await onPlayMixSound();

    // Update mixing statistics
    if (onMixColors) {
      await onMixColors();
    }

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
    <>
      {/* Main Content */}
      <ColorMixer
        selectedColors={selectedColors}
        mixedColor={mixedColor}
        isAnimating={isAnimating}
        translations={translations}
        onSlotClick={handleSlotClick}
        onMixButtonClick={handleMixButtonClick}
        onGeneratedColorClick={handleGeneratedColorClick}
      />

      {/* Color Selection Modal */}
      <ColorSelectionModal
        isOpen={colorSelectionModal.isOpen}
        onClose={() => setColorSelectionModal({ isOpen: false, slotIndex: null })}
        primaryColors={primaryColors}
        savedColors={savedColorDefinitions}
        translations={translations}
        onColorSelect={handleColorSelect}
        title={
          colorSelectionModal.slotIndex === 0
            ? translations.chooseElementA
            : colorSelectionModal.slotIndex === 1
            ? translations.chooseElementB
            : translations.chooseYourElement
        }
      />

      {/* Save Result Modal */}
      {mixedColor && (
        <SaveResultModal
          isOpen={saveResultModal}
          onClose={() => setSaveResultModal(false)}
          mixedColor={mixedColor}
          savedColors={savedColors}
          translations={translations}
          onDrop={handleColorDrop}
        />
      )}
    </>
  );
}

import { useState } from 'react';
import type { RGB, ColorDefinition, SavedColor } from '@/types';
import { ColorMixingMethod } from '@/types';
import { getColorName, mixColors as mixTwoColors } from '@/utils/colorUtils';
import { PRIMARY_COLORS } from '@/utils/colorUtils';
import { ColorMixer } from './ColorMixer';
import { ColorSelectionModal } from './ColorSelectionModal';
import { SaveResultModal } from './SaveResultModal';
import type { useL10n } from '@/locales';

interface IntegratedColorMixerProps {
  savedColors: SavedColor[];
  onSaveColor: (color: RGB, slotIndex?: number) => void;
  onMixColors?: () => Promise<void>;
  t: ReturnType<typeof useL10n>['t'];
  onPlayMixSound: () => Promise<void>;
  onPlaySuccessSound: () => Promise<void>;
}

export function IntegratedColorMixer({
  savedColors,
  onSaveColor,
  onMixColors,
  t,
  onPlayMixSound,
  onPlaySuccessSound,
}: IntegratedColorMixerProps) {
  const [selectedColors, setSelectedColors] = useState<(ColorDefinition | null)[]>([null, null]);
  const [mixedColor, setMixedColor] = useState<RGB | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [mixingMethod, setMixingMethod] = useState<ColorMixingMethod>(ColorMixingMethod.HSL_INTERPOLATION);

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
      const mixed = mixTwoColors(colors[0].rgb, colors[1].rgb, mixingMethod);
      console.log('Mixed Color:', mixed);
      setMixedColor(mixed);
      setIsAnimating(false);
    }, 800);
  };

  const handleMixingMethodChange = (method: ColorMixingMethod) => {
    setMixingMethod(method);
    // Reset mixed color when changing method to show the difference
    setMixedColor(null);
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
        t={t}
        mixingMethod={mixingMethod}
        onSlotClick={handleSlotClick}
        onMixButtonClick={handleMixButtonClick}
        onGeneratedColorClick={handleGeneratedColorClick}
        onMixingMethodChange={handleMixingMethodChange}
      />

      {/* Color Selection Modal */}
      <ColorSelectionModal
        isOpen={colorSelectionModal.isOpen}
        onClose={() => setColorSelectionModal({ isOpen: false, slotIndex: null })}
        primaryColors={primaryColors}
        savedColors={savedColorDefinitions}
        t={t}
        onColorSelect={handleColorSelect}
        title={
          colorSelectionModal.slotIndex === 0
            ? t('chooseElementA')
            : colorSelectionModal.slotIndex === 1
            ? t('chooseElementB')
            : t('chooseYourElement')
        }
      />

      {/* Save Result Modal */}
      {mixedColor && (
        <SaveResultModal
          isOpen={saveResultModal}
          onClose={() => setSaveResultModal(false)}
          mixedColor={mixedColor}
          savedColors={savedColors}
          t={t}
          onDrop={handleColorDrop}
        />
      )}
    </>
  );
}

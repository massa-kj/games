import type { RGB, ColorDefinition, ColorMixingMethod } from '@/types';
import type { useL10n } from '@/locales';

/**
 * Props for draggable color card component
 */
export interface DraggableColorCardProps {
  color: ColorDefinition;
  t: ReturnType<typeof useL10n>['t'];
  initialPosition: { x: number; y: number };
  size?: 'sm' | 'md' | 'lg';
  idPrefix?: string;
  returnToOrigin?: boolean;
  validDropZones?: string[];
}

/**
 * Props for color palette component
 */
export interface ColorPaletteProps {
  colors: ColorDefinition[];
  t: ReturnType<typeof useL10n>['t'];
  validDropZones?: string[];
}

/**
 * Props for save slots component
 */
export interface SaveSlotsProps {
  savedColors: (ColorDefinition | null)[];
  t: ReturnType<typeof useL10n>['t'];
  onDrop: (zoneId: string, dragId?: string) => void;
  validDropZones?: string[];
}

/**
 * Props for color mixer component
 */
export interface ColorMixerProps {
  selectedColors: (ColorDefinition | null)[];
  mixedColor: RGB | null;
  isAnimating: boolean;
  t: ReturnType<typeof useL10n>['t'];
  mixingMethod: ColorMixingMethod;
  onSlotClick: (slotIndex: number) => void;
  onMixButtonClick: () => void;
  onGeneratedColorClick: () => void;
  onMixingMethodChange: (method: ColorMixingMethod) => void;
}

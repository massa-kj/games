import type { RGB, ColorDefinition, GameTranslations } from '@/types';

/**
 * Props for draggable color card component
 */
export interface DraggableColorCardProps {
  color: ColorDefinition;
  translations: GameTranslations;
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
  translations: GameTranslations;
  validDropZones?: string[];
}

/**
 * Props for save slots component
 */
export interface SaveSlotsProps {
  savedColors: (ColorDefinition | null)[];
  translations: GameTranslations;
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
  translations: GameTranslations;
  onDrop: (zoneId: string, dragId?: string) => void;
  onMixButtonClick: () => void;
}

/**
 * Color Mixer - Type Definitions
 * Author:
 * Created: 2025
 */

export interface GameState {
  isPlaying: boolean;
  isPaused: boolean;
  score: number;
  level: number;
}

export interface GameSettings {
  soundEnabled: boolean;
  difficulty: 'easy' | 'medium' | 'hard';
}

export interface GameTranslations {
  title: string;
  description: string;
  startGame: string;
  playAgain: string;
  score: string;
  gameOver: string;
  congratulations: string;
  loading: string;
  error: string;
  // Color Mixer specific translations
  mixColors: string;
  saveColor: string;
  clearSaved: string;
  saved: string;
  newColor: string;
  tapTwoColors: string;
  colorSaved: string;
  colorNames: {
    red: string;
    blue: string;
    green: string;
    white: string;
    purple: string;
    yellow: string;
    cyan: string;
    orange: string;
    pink: string;
    lightGreen: string;
    lightBlue: string;
    gray: string;
    darkPurple: string;
    brown: string;
    lightGray: string;
    unknown: string;
  };
}

// Color Mixer specific types
export interface RGB {
  r: number;
  g: number;
  b: number;
}

export interface ColorDefinition {
  name: string;
  rgb: RGB;
  isPrimary: boolean;
}

export interface SavedColor {
  id: string;
  rgb: RGB;
  createdAt: Date;
}

export interface ColorMixerState {
  selectedColors: ColorDefinition[];
  savedColors: SavedColor[];
  isAnimating: boolean;
  mixedColor: RGB | null;
}

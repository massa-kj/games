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
  alchemyStation: string;
  elementA: string;
  elementB: string;
  clickToChoose: string;
  mixingMagic: string;
  alchemicalCreation: string;
  clickToSave: string;
  waitingForMagicalElements: string;
  clickColorToSave: string;
  laboratoryReady: string;
  transmuting: string;
  chooseYourElement: string;
  primaryElements: string;
  savedCreations: string;
  selectElementInstruction: string;
  chooseElementA: string;
  chooseElementB: string;
  saveYourCreation: string;
  preserveYourAlchemy: string;
  dragCreationInstruction: string;
  yourCreation: string;
  preservationChambers: string;
  chooseChamberInstruction: string;
  chamber: string;
  replace: string;
  empty: string;
  dragInstructions: string;
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

export interface SavedColor {
  id: string;
  rgb: RGB;
  createdAt: number; // timestamp
}

/**
 * Color-mixer specific game data schema
 */
export interface ColorMixerGameData {
  /** Array of saved colors (max 3 slots) */
  savedColors: SavedColor[];
  /** Game statistics */
  stats?: {
    totalMixes: number;
    uniqueColorsCreated: number;
    lastPlayedAt: number;
  };
}

export interface ColorDefinition {
  name: string;
  rgb: RGB;
  isPrimary: boolean;
}

export interface ColorMixerState {
  selectedColors: ColorDefinition[];
  savedColors: SavedColor[];
  isAnimating: boolean;
  mixedColor: RGB | null;
}

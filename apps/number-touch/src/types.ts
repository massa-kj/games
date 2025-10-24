export interface NumberButton {
  id: number;
  value: number;
  isCompleted: boolean;
  gridPosition: { row: number; col: number };
}

export interface GameSettings {
  showTargetHint: boolean;
}

export interface NumberTouchGameState {
  numbers: NumberButton[];
  currentTarget: number;
  isGameActive: boolean;
  gameStarted: boolean;
  gameCompleted: boolean;
  startTime: number | null;
  endTime: number | null;
  difficulty: Difficulty;
  mistakes: number;
  lastClickedNumber: number | null;
  isMistake: boolean;
  settings: GameSettings;
}

export type Difficulty = 'easy' | 'hard';

export interface DifficultyConfig {
  maxNumber: number;
  gridRows: number;
  gridCols: number;
}

export const DIFFICULTY_CONFIGS: Record<Difficulty, DifficultyConfig> = {
  easy: { maxNumber: 10, gridRows: 3, gridCols: 4 },
  hard: { maxNumber: 20, gridRows: 4, gridCols: 5 }
};

export interface StarRating {
  stars: number;
  time: number;
}

export const STAR_THRESHOLDS: Record<Difficulty, StarRating[]> = {
  easy: [
    { stars: 5, time: 8.0 },
    { stars: 4, time: 10.0 },
    { stars: 3, time: 15.0 },
    { stars: 2, time: 20.0 },
    { stars: 1, time: 30.0 },
  ],
  hard: [
    { stars: 5, time: 15.0 },
    { stars: 4, time: 20.0 },
    { stars: 3, time: 30.0 },
    { stars: 2, time: 40.0 },
    { stars: 1, time: 60.0 },
  ]
};

export type GameAction =
  | { type: 'START_GAME'; difficulty: Difficulty }
  | { type: 'CLICK_NUMBER'; number: number }
  | { type: 'COMPLETE_GAME' }
  | { type: 'RESTART_GAME' }
  | { type: 'SET_DIFFICULTY'; difficulty: Difficulty }
  | { type: 'CLEAR_MISTAKE' }
  | { type: 'TOGGLE_TARGET_HINT' };

export function calculateStars(time: number, difficulty: Difficulty): number {
  const thresholds = STAR_THRESHOLDS[difficulty];

  for (const threshold of thresholds) {
    if (time <= threshold.time) {
      return threshold.stars;
    }
  }

  return 0; // Time over
}

export function createGridPositions(maxNumber: number, rows: number, cols: number): { row: number; col: number }[] {
  const totalCells = rows * cols;

  // Create all grid positions
  const allPositions: { row: number; col: number }[] = [];
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      allPositions.push({ row, col });
    }
  }

  // Randomly shuffle
  const shuffled = [...allPositions].sort(() => Math.random() - 0.5);

  // Get the required number of positions
  return shuffled.slice(0, Math.min(maxNumber, totalCells));
}

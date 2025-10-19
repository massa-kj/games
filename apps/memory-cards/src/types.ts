export interface Animal {
  key: string;
  ja: string;
  en: string;
  image: string;
  sound: string;
}

export interface Card {
  id: string;
  key: string;
  animal: Animal;
  isFlipped: boolean;
  isMatched: boolean;
}

export interface MemoryGameState {
  cards: Card[];
  firstCard: Card | null;
  secondCard: Card | null;
  isLocked: boolean;
  cleared: boolean;
  matches: number;
  attempts: number;
  gameStarted: boolean;
  difficulty: Difficulty;
}

export type Difficulty = 'easy' | 'medium' | 'hard' | 'expert';

export interface DifficultyConfig {
  rows: number;
  cols: number;
  pairs: number;
}

export const DIFFICULTY_CONFIGS: Record<Difficulty, DifficultyConfig> = {
  easy: { rows: 2, cols: 2, pairs: 2 },
  medium: { rows: 2, cols: 3, pairs: 3 },
  hard: { rows: 2, cols: 4, pairs: 4 },
  expert: { rows: 3, cols: 4, pairs: 6 }
};

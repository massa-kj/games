/**
 * Melody Maker - Type Definitions
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
}

// Add your game-specific types here

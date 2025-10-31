/**
 * Tic Tac Toe - Type Definitions
 * Author:
 * Created: 2025
 */

export type Player = 'X' | 'O';
export type CellValue = Player | null;
export type Board = CellValue[];
export type GameStatus = 'playing' | 'won' | 'tie';

export interface GameState {
  board: Board;
  currentPlayer: Player;
  status: GameStatus;
  winner: Player | null;
  winningLine: number[] | null;
  scores: {
    X: number;
    O: number;
    ties: number;
  };
}

export interface WinCheckResult {
  winner: Player | null;
  winningLine: number[] | null;
  isDraw: boolean;
}

export interface GameSettings {
  soundEnabled: boolean;
  showAnimations: boolean;
  aiMode: boolean;
}

export interface GameTranslations {
  title: string;
  description: string;
  startGame: string;
  playAgain: string;
  newGame: string;
  resetScore: string;
  score: string;
  gameOver: string;
  congratulations: string;
  loading: string;
  error: string;
  playerX: string;
  playerO: string;
  currentPlayer: string;
  winner: string;
  itsATie: string;
  playerWins: string;
  yourTurn: string;
  gameInProgress: string;
  clickToPlay: string;
  wins: string;
  ties: string;
}

import { useState, useCallback } from 'react';
import type { GameState, Player, Board, GameStatus, WinCheckResult } from '@/types';

const WINNING_COMBINATIONS = [
  [0, 1, 2], // top row
  [3, 4, 5], // middle row
  [6, 7, 8], // bottom row
  [0, 3, 6], // left column
  [1, 4, 7], // middle column
  [2, 5, 8], // right column
  [0, 4, 8], // diagonal top-left to bottom-right
  [2, 4, 6], // diagonal top-right to bottom-left
];

/**
 * Check for win conditions and draw state
 */
function checkWinConditions(board: Board): WinCheckResult {
  // Check for winning combinations
  for (const combination of WINNING_COMBINATIONS) {
    const [a, b, c] = combination;
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return {
        winner: board[a] as Player,
        winningLine: combination,
        isDraw: false,
      };
    }
  }

  // Check for draw (all cells filled, no winner)
  const isDraw = board.every(cell => cell !== null);

  return {
    winner: null,
    winningLine: null,
    isDraw,
  };
}

/**
 * Custom hook for managing Tic Tac Toe game state
 */
export default function useGameState() {
  const [gameState, setGameState] = useState<GameState>({
    board: Array(9).fill(null),
    currentPlayer: 'X',
    status: 'playing',
    winner: null,
    winningLine: null,
    scores: {
      X: 0,
      O: 0,
      ties: 0,
    },
  });

  /**
   * Make a move on the board
   */
  const makeMove = useCallback((cellIndex: number) => {
    if (
      gameState.status !== 'playing' ||
      gameState.board[cellIndex] !== null ||
      cellIndex < 0 ||
      cellIndex > 8
    ) {
      return false; // Invalid move
    }

    setGameState(prevState => {
      const newBoard = [...prevState.board];
      newBoard[cellIndex] = prevState.currentPlayer;

      const { winner, winningLine, isDraw } = checkWinConditions(newBoard);

      let newStatus: GameStatus = 'playing';
      let newScores = { ...prevState.scores };

      if (winner) {
        newStatus = 'won';
        newScores[winner] += 1;
      } else if (isDraw) {
        newStatus = 'tie';
        newScores.ties += 1;
      }

      return {
        ...prevState,
        board: newBoard,
        currentPlayer: newStatus === 'playing' ? (prevState.currentPlayer === 'X' ? 'O' : 'X') : prevState.currentPlayer,
        status: newStatus,
        winner,
        winningLine,
        scores: newScores,
      };
    });

    return true; // Move was successful
  }, [gameState.status, gameState.board]);

  /**
   * Reset the current game (keep scores)
   */
  const resetGame = useCallback(() => {
    setGameState(prevState => ({
      ...prevState,
      board: Array(9).fill(null),
      currentPlayer: 'X',
      status: 'playing',
      winner: null,
      winningLine: null,
    }));
  }, []);

  /**
   * Reset all scores
   */
  const resetScores = useCallback(() => {
    setGameState(prevState => ({
      ...prevState,
      scores: {
        X: 0,
        O: 0,
        ties: 0,
      },
    }));
  }, []);

  /**
   * Reset everything (game + scores)
   */
  const resetAll = useCallback(() => {
    setGameState({
      board: Array(9).fill(null),
      currentPlayer: 'X',
      status: 'playing',
      winner: null,
      winningLine: null,
      scores: {
        X: 0,
        O: 0,
        ties: 0,
      },
    });
  }, []);

  return {
    gameState,
    makeMove,
    resetGame,
    resetScores,
    resetAll,
  };
}

import { useReducer, useCallback } from 'react';
import {
  NumberTouchGameState,
  GameAction,
  Difficulty,
  DIFFICULTY_CONFIGS,
  createGridPositions,
  NumberButton
} from '../types';

const initialState: NumberTouchGameState = {
  numbers: [],
  currentTarget: 1,
  isGameActive: false,
  gameStarted: false,
  gameCompleted: false,
  startTime: null,
  endTime: null,
  difficulty: 'easy',
  mistakes: 0,
  lastClickedNumber: null,
  isMistake: false,
  settings: {
    showTargetHint: true
  }
};

function createNumbers(difficulty: Difficulty): NumberButton[] {
  const config = DIFFICULTY_CONFIGS[difficulty];
  const gridPositions = createGridPositions(config.maxNumber, config.gridRows, config.gridCols);

  return Array.from({ length: config.maxNumber }, (_, index) => ({
    id: index + 1,
    value: index + 1,
    isCompleted: false,
    gridPosition: gridPositions[index]
  }));
}

function gameReducer(state: NumberTouchGameState, action: GameAction): NumberTouchGameState {
  switch (action.type) {
    case 'START_GAME':
      return {
        ...state,
        numbers: createNumbers(action.difficulty),
        currentTarget: 1,
        isGameActive: true,
        gameStarted: true,
        gameCompleted: false,
        startTime: Date.now(),
        endTime: null,
        difficulty: action.difficulty,
        mistakes: 0,
        lastClickedNumber: null,
        isMistake: false
      };

    case 'CLICK_NUMBER':
      if (!state.isGameActive || state.gameCompleted) {
        return state;
      }

      const clickedNumber = action.number;
      const isCorrect = clickedNumber === state.currentTarget;

      if (isCorrect) {
        const updatedNumbers = state.numbers.map(num =>
          num.value === clickedNumber ? { ...num, isCompleted: true } : num
        );

        const nextTarget = state.currentTarget + 1;
        const config = DIFFICULTY_CONFIGS[state.difficulty];
        const isComplete = nextTarget > config.maxNumber;

        return {
          ...state,
          numbers: updatedNumbers,
          currentTarget: isComplete ? state.currentTarget : nextTarget,
          isGameActive: !isComplete,
          gameCompleted: isComplete,
          endTime: isComplete ? Date.now() : null,
          lastClickedNumber: clickedNumber,
          isMistake: false
        };
      } else {
        // Incorrect answer case
        return {
          ...state,
          mistakes: state.mistakes + 1,
          lastClickedNumber: clickedNumber,
          isMistake: true
        };
      }

    case 'COMPLETE_GAME':
      return {
        ...state,
        isGameActive: false,
        gameCompleted: true,
        endTime: Date.now()
      };

    case 'RESTART_GAME':
      return {
        ...initialState,
        difficulty: state.difficulty,
        settings: state.settings
      };

    case 'SET_DIFFICULTY':
      return {
        ...initialState,
        difficulty: action.difficulty,
        settings: state.settings
      };

    case 'CLEAR_MISTAKE':
      return {
        ...state,
        isMistake: false,
        lastClickedNumber: null
      };

    case 'TOGGLE_TARGET_HINT':
      return {
        ...state,
        settings: {
          ...state.settings,
          showTargetHint: !state.settings.showTargetHint
        }
      };

    default:
      return state;
  }
}

export function useGameLogic() {
  const [state, dispatch] = useReducer(gameReducer, initialState);

  const startGame = useCallback((difficulty: Difficulty) => {
    dispatch({ type: 'START_GAME', difficulty });
  }, []);

  const clickNumber = useCallback((number: number) => {
    dispatch({ type: 'CLICK_NUMBER', number });
  }, []);

  const restartGame = useCallback(() => {
    dispatch({ type: 'RESTART_GAME' });
  }, []);

  const setDifficulty = useCallback((difficulty: Difficulty) => {
    dispatch({ type: 'SET_DIFFICULTY', difficulty });
  }, []);

  const clearMistake = useCallback(() => {
    dispatch({ type: 'CLEAR_MISTAKE' });
  }, []);

  const toggleTargetHint = useCallback(() => {
    dispatch({ type: 'TOGGLE_TARGET_HINT' });
  }, []);

  const getElapsedTime = useCallback((): number => {
    if (!state.startTime) return 0;
    const endTime = state.endTime || Date.now();
    return (endTime - state.startTime) / 1000;
  }, [state.startTime, state.endTime]);

  const getFormattedTime = useCallback((): string => {
    const time = getElapsedTime();
    return time.toFixed(3);
  }, [getElapsedTime]);

  return {
    ...state,
    startGame,
    clickNumber,
    restartGame,
    setDifficulty,
    clearMistake,
    toggleTargetHint,
    getElapsedTime,
    getFormattedTime
  };
}

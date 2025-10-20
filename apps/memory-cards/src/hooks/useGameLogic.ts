import { useReducer, useCallback, useEffect } from 'react';
import { shuffle } from '../../../../core/utils/array.js';
import { delay } from '../../../../core/utils/time.js';
import type {
  MemoryGameState,
  GameAction,
  Card,
  Animal,
  Difficulty
} from '../types.js';
import { DIFFICULTY_CONFIGS } from '../types.js';
import animalsData from '../data/animals.json';

const animals = animalsData as Animal[];

const initialState: MemoryGameState = {
  cards: [],
  firstCard: null,
  secondCard: null,
  isLocked: false,
  cleared: false,
  justCleared: false,
  matches: 0,
  attempts: 0,
  gameStarted: false,
  difficulty: 'easy'
};

function gameReducer(state: MemoryGameState, action: GameAction): MemoryGameState {
  switch (action.type) {
    case 'START_GAME':
      return {
        ...state,
        cards: action.cards,
        difficulty: action.difficulty,
        gameStarted: true,
        cleared: false,
        justCleared: false,
        matches: 0,
        attempts: 0,
        firstCard: null,
        secondCard: null,
        isLocked: false
      };

    case 'FLIP_CARD':
      const card = state.cards.find(c => c.id === action.cardId);
      if (!card || card.isFlipped || card.isMatched || state.isLocked) {
        return state;
      }

      const updatedCards = state.cards.map(c =>
        c.id === action.cardId ? { ...c, isFlipped: true } : c
      );

      if (!state.firstCard) {
        return {
          ...state,
          cards: updatedCards,
          firstCard: { ...card, isFlipped: true }
        };
      } else {
        return {
          ...state,
          cards: updatedCards,
          secondCard: { ...card, isFlipped: true },
          isLocked: true,
          attempts: state.attempts + 1
        };
      }

    case 'CHECK_MATCH':
      if (!state.firstCard || !state.secondCard) return state;

      const isMatch = state.firstCard.key === state.secondCard.key;

      if (isMatch) {
        const matchedCards = state.cards.map(c =>
          c.id === state.firstCard!.id || c.id === state.secondCard!.id
            ? { ...c, isMatched: true }
            : c
        );

        const newMatches = state.matches + 1;
        const totalPairs = DIFFICULTY_CONFIGS[state.difficulty].pairs;
        const isCleared = newMatches === totalPairs;

        return {
          ...state,
          cards: matchedCards,
          matches: newMatches,
          cleared: isCleared,
          justCleared: isCleared,
          firstCard: null,
          secondCard: null,
          isLocked: false
        };
      } else {
        return state;
      }

    case 'RESET_CARDS':
      const resetCards = state.cards.map(c =>
        c.id === state.firstCard?.id || c.id === state.secondCard?.id
          ? { ...c, isFlipped: false }
          : c
      );

      return {
        ...state,
        cards: resetCards,
        firstCard: null,
        secondCard: null,
        isLocked: false
      };

    case 'RESTART_GAME':
      return {
        ...initialState,
        difficulty: state.difficulty
      };

    case 'SET_DIFFICULTY':
      return {
        ...state,
        difficulty: action.difficulty
      };

    case 'CLEAR_JUST_CLEARED':
      return {
        ...state,
        justCleared: false
      };

    default:
      return state;
  }
}

function generateCards(difficulty: Difficulty): Card[] {
  const config = DIFFICULTY_CONFIGS[difficulty];
  const selectedAnimals = shuffle([...animals]).slice(0, config.pairs);

  const cardPairs: Card[] = [];
  selectedAnimals.forEach((animal) => {
    // Create two cards for each animal (a pair)
    cardPairs.push(
      {
        id: `${animal.key}-1`,
        key: animal.key,
        animal,
        isFlipped: false,
        isMatched: false
      },
      {
        id: `${animal.key}-2`,
        key: animal.key,
        animal,
        isFlipped: false,
        isMatched: false
      }
    );
  });

  return shuffle(cardPairs);
}

export function useGameLogic() {
  const [state, dispatch] = useReducer(gameReducer, initialState);

  const startGame = useCallback((difficulty: Difficulty) => {
    const cards = generateCards(difficulty);
    dispatch({ type: 'START_GAME', difficulty, cards });
  }, []);

  const flipCard = useCallback((cardId: string) => {
    dispatch({ type: 'FLIP_CARD', cardId });
  }, []);

  const restartGame = useCallback(() => {
    dispatch({ type: 'RESTART_GAME' });
  }, []);

  const setDifficulty = useCallback((difficulty: Difficulty) => {
    dispatch({ type: 'SET_DIFFICULTY', difficulty });
  }, []);

  const clearJustCleared = useCallback(() => {
    dispatch({ type: 'CLEAR_JUST_CLEARED' });
  }, []);

  // Handle match checking and card reset logic
  useEffect(() => {
    if (state.firstCard && state.secondCard && state.isLocked) {
      const checkMatch = async () => {
        await delay(1000); // Give player time to see both cards

        const isMatch = state.firstCard!.key === state.secondCard!.key;

        if (isMatch) {
          dispatch({ type: 'CHECK_MATCH' });
        } else {
          dispatch({ type: 'RESET_CARDS' });
        }
      };

      checkMatch();
    }
  }, [state.firstCard, state.secondCard, state.isLocked]);

  return {
    state,
    startGame,
    flipCard,
    restartGame,
    setDifficulty,
    clearJustCleared
  };
}

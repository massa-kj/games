import { useSettings } from '../../../../core/hooks/useSettings.js';
import type { Card as CardType } from '../types.js';

interface CardProps {
  card: CardType;
  onFlip: (cardId: string) => void;
  disabled?: boolean;
}

export function Card({ card, onFlip, disabled = false }: CardProps) {
  const { settings } = useSettings();
  const currentLang = settings.lang;

  const handleClick = () => {
    if (!disabled && !card.isFlipped && !card.isMatched) {
      onFlip(card.id);
    }
  };

  const animalName = card.animal[currentLang] || card.animal.ja;

  return (
    <div
      className={`
        relative w-full aspect-square cursor-pointer
        transition-transform duration-300 hover:scale-105
        ${disabled || card.isMatched ? 'cursor-not-allowed' : ''}
        ${card.isMatched ? 'opacity-75' : ''}
      `}
      onClick={handleClick}
    >
      <div
        className={`
          relative w-full h-full
          transition-transform duration-500 transform-style-preserve-3d
          ${card.isFlipped || card.isMatched ? 'rotate-y-180' : ''}
        `}
      >
        {/* Card Back (showing when not flipped) */}
        <div
          className="
            absolute inset-0 w-full h-full
            bg-gradient-to-br from-blue-400 to-blue-600
            rounded-2xl shadow-lg border-2 border-white
            flex items-center justify-center
            backface-hidden
          "
        >
          <div className="text-4xl">❓</div>
        </div>

        {/* Card Front (showing when flipped) */}
        <div
          className="
            absolute inset-0 w-full h-full
            bg-gradient-to-br from-yellow-100 to-yellow-200
            rounded-2xl shadow-lg border-2 border-yellow-300
            flex flex-col items-center justify-center
            backface-hidden rotate-y-180
          "
        >
          <div className="text-6xl mb-2" role="img" aria-label={animalName}>
            {getAnimalEmoji(card.animal.key)}
          </div>
          <div className="text-sm font-bold text-center text-gray-700">
            {animalName}
          </div>
        </div>

        {/* Matched indicator */}
        {card.isMatched && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
            <div className="text-6xl animate-bounce">✨</div>
          </div>
        )}
      </div>
    </div>
  );
}

// Helper function to get emoji for each animal
function getAnimalEmoji(animalKey: string): string {
  const emojiMap: Record<string, string> = {
    dog: '🐕',
    cat: '🐱',
    elephant: '🐘',
    lion: '🦁',
    rabbit: '🐰',
    bear: '🐻',
    monkey: '🐵',
    penguin: '🐧'
  };
  return emojiMap[animalKey] || '🐾';
}

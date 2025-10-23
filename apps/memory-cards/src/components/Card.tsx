import { useSettings } from '@core/hooks/useSettings';
import { FlipCard } from '@core/ui';
import type { Card as CardType } from '@/types';

interface CardProps {
  card: CardType;
  onFlip: (cardId: string) => void;
  disabled?: boolean;
}

export function Card({ card, onFlip, disabled = false }: CardProps) {
  const { settings } = useSettings();
  const currentLang = settings.lang;

  const handleClick = () => {
    if (!card.isFlipped && !card.isMatched) {
      onFlip(card.id);
    }
  };

  const animalName = card.animal[currentLang] || card.animal.en;

  const backContent = (
    <div className="text-4xl">❓</div>
  );

  const frontContent = (
    <>
      <div className="text-6xl mb-2" role="img" aria-label={animalName}>
        {getAnimalEmoji(card.animal.key)}
      </div>
      <div className="text-sm font-bold text-center text-gray-700">
        {animalName}
      </div>
    </>
  );

  const overlayContent = card.isMatched ? (
    <div className="text-6xl animate-bounce">✨</div>
  ) : undefined;

  return (
    <FlipCard
      isFlipped={card.isFlipped || card.isMatched}
      backContent={backContent}
      frontContent={frontContent}
      overlayContent={overlayContent}
      onClick={handleClick}
      disabled={disabled || card.isMatched}
      className={`memory-card ${card.isMatched ? 'opacity-75' : ''}`}
    />
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

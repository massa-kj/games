import { useTranslation } from 'react-i18next';
import { GameManifest } from '@core/types';

interface GameTileProps {
  game: GameManifest;
}

function GameTile({ game }: GameTileProps) {
  const { i18n, t } = useTranslation();
  const currentLanguage = i18n.language as keyof typeof game.title;

  const handlePlay = () => {
    // Navigating to the app
    window.location.href = `/games${game.entry}`;
  };

  return (
    <div
      className="bg-surface rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow cursor-pointer border border-accent-light"
      onClick={handlePlay}
    >
      {/* Game Icon */}
      <div className="flex justify-center mb-4">
        <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center text-2xl">
          🎮
        </div>
      </div>

      {/* Game Title */}
      <h3 className="text-lg font-bold text-text text-center mb-2">
        {game.title[currentLanguage] || game.title.ja}
      </h3>

      {/* Game Description */}
      <p className="text-text-light text-sm text-center mb-4">
        {game.description?.[currentLanguage] || game.description?.ja || ''}
      </p>

      {/* Game Age Rating */}
      {game.minAge && (
        <div className="flex justify-center">
          <span className="bg-accent text-accent-text text-xs px-3 py-1 rounded-full">
            {t('site.common.ageFrom', { age: game.minAge })}
          </span>
        </div>
      )}
    </div>
  );
}

export default GameTile;

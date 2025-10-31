import { useTranslation } from 'react-i18next';
import { GameManifest } from '@core/types';
import { resolveAssetPath, getAssetPaths } from '@core/utils';

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
        <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center overflow-hidden">
          {game.icon ? (
            <img
              src={resolveAssetPath(game.icon)}
              alt={`${game.title[currentLanguage] || game.title.ja} icon`}
              className="w-12 h-12 object-contain"
              onError={(e) => {
                // Fallback to default icon, then emoji if that fails too
                const target = e.target as HTMLImageElement;
                const { iconDefault } = getAssetPaths();
                if (target.src === iconDefault) {
                  // Already tried default, fallback to emoji
                  target.style.display = 'none';
                  const parent = target.parentElement;
                  if (parent) {
                    parent.innerHTML = '<span class="text-2xl">🎮</span>';
                  }
                } else {
                  // Try default icon first
                  target.src = iconDefault;
                }
              }}
            />
          ) : (
            <span className="text-2xl">🎮</span>
          )}
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

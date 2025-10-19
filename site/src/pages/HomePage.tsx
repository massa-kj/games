import { useTranslation } from 'react-i18next';
import { useGameRegistry } from '@core/hooks';
import GameTile from '../components/GameTile';

function HomePage() {
  const { t } = useTranslation();
  const { games, loading, error } = useGameRegistry();

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="text-2xl text-text animate-pulse">
          {t('site.common.loading')}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-xl text-error mb-4">
          {t('site.common.error')}
        </div>
        <div className="text-text-light">
          {error}
        </div>
      </div>
    );
  }

  if (games.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-xl text-text-light">
          {t('site.common.noGamesFound')}
        </div>
      </div>
    );
  }

  // Group games by category
  const gamesByCategory = games.reduce((acc, game) => {
    if (!acc[game.category]) {
      acc[game.category] = [];
    }
    acc[game.category].push(game);
    return acc;
  }, {} as Record<string, typeof games>);

  return (
    <div className="max-w-6xl mx-auto">
      {Object.entries(gamesByCategory).map(([category, categoryGames]) => (
        <section key={category} className="mb-12">
          <h2 className="text-2xl font-bold text-text mb-6 capitalize">
            {t(`games.categories.${category}`, category)}
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {categoryGames.map((game) => (
              <GameTile key={game.id} game={game} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

export default HomePage;

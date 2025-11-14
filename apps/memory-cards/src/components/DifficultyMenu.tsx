import { MenuBoard } from '@core/ui';
import { Button } from '@core/ui';
import { useL10n } from '@/locales';
import type { Difficulty } from '@/types';

interface DifficultyMenuProps {
  onStartGame: (difficulty: Difficulty) => void;
}

/**
 * Difficulty selection menu using MenuBoard component.
 *
 * Maintains the original simple design while using the new MenuBoard
 * component for consistent styling across the app.
 */
export function DifficultyMenu({ onStartGame }: DifficultyMenuProps) {
  const { t } = useL10n();

  return (
    <div className="text-center">
      <MenuBoard
        title={t('description')}
        size="md"
        variant="inline"
        theme="craft"
        ariaLabel={t('description')}
      >
        <div className="text-center">
          <div className="text-6xl mb-4">🎮</div>
          <p className="text-lg text-gray-700 mb-6">
            {t('selectDifficulty')}
          </p>

          {/* Difficulty Selection */}
          <div className="space-y-3">
            {(['easy', 'medium', 'hard', 'expert'] as const).map((key) => (
              <Button
                key={key}
                onClick={() => onStartGame(key as Difficulty)}
                className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 px-6 text-lg"
              >
                {t(`difficulty.${key}`)}
              </Button>
            ))}
          </div>
        </div>
      </MenuBoard>
    </div>
  );
}

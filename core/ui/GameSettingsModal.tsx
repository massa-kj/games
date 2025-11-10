import { Modal } from './Modal';
import { Tabs, type TabItem } from './Tabs';
import { Button } from './Button';
import { Toggle } from './Toggle';
import { useTranslation } from 'react-i18next';
import { useSettings } from '../hooks/useSettings.js';
import type { Lang } from '../types.js';

/**
 * Configuration object for a single game setting control.
 */
export interface GameSettingControl {
  /** Unique identifier for the setting */
  id: string;
  /** Type of input control to render */
  type: 'checkbox' | 'select' | 'radio' | 'button-group' | 'toggle';
  /** Display label for the setting */
  label: string;
  /** Optional description text */
  description?: string;
  /** Current value of the setting */
  value: any;
  /** Callback when the value changes */
  onChange: (value: any) => void;
  /** Options for select, radio, and button-group types */
  options?: { value: any; label: string; description?: string }[];
  /** Whether the control is disabled */
  disabled?: boolean;
}

export interface GameSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;

  // All game settings (including difficulty if needed)
  gameSettings?: GameSettingControl[];

  // Control whether to show tabs (if false, shows unified view like current)
  showTabs?: boolean;

  // Whether to show common settings tab
  showCommonSettings?: boolean;

  // Action buttons
  onResetSettings?: () => void;

  // Text overrides for internationalization
  texts?: {
    reset?: string;
    close?: string;
    commonTab?: string;
    gameTab?: string;
  };
}

/**
 * Modal dialog for configuring game settings with tabbed or unified layout.
 *
 * Features:
 * - Tabbed interface with common settings (language, sound) and game-specific settings
 * - Unified view option for simpler layouts
 * - Multiple control types: checkbox, select, radio, button-group, toggle
 * - Automatic common settings integration via useSettings hook
 * - Full internationalization support
 * - Backward compatibility with existing implementations
 *
 * @param isOpen Whether the modal is open
 * @param onClose Callback when modal is closed
 * @param title Modal title
 * @param gameSettings Array of game-specific setting controls
 * @param showTabs Whether to display tabs (default: true)
 * @param showCommonSettings Whether to show common settings tab (default: true)
 * @param onResetSettings Optional callback to reset all settings
 * @param texts Text overrides for internationalization
 *
 * @example
 * ```tsx
 * // Tabbed settings modal with common and game settings
 * <GameSettingsModal
 *   isOpen={showSettings}
 *   onClose={() => setShowSettings(false)}
 *   title="Game Settings"
 *   gameSettings={[
 *     {
 *       id: 'difficulty',
 *       type: 'button-group',
 *       label: 'Difficulty',
 *       value: difficulty,
 *       onChange: setDifficulty,
 *       options: [
 *         { value: 'easy', label: 'Easy' },
 *         { value: 'hard', label: 'Hard' }
 *       ]
 *     },
 *     {
 *       id: 'hints',
 *       type: 'toggle',
 *       label: 'Show Hints',
 *       value: showHints,
 *       onChange: setShowHints
 *     }
 *   ]}
 * />
 *
 * // Unified view without tabs
 * <GameSettingsModal
 *   isOpen={showSettings}
 *   onClose={() => setShowSettings(false)}
 *   title="Settings"
 *   gameSettings={gameSettings}
 *   showTabs={false}
 * />
 * ```
 */
export function GameSettingsModal({
  isOpen,
  onClose,
  title,
  gameSettings = [],
  showTabs = true,
  showCommonSettings = true,
  onResetSettings,
  texts = {}
}: GameSettingsModalProps) {
  const { t } = useTranslation();
  const { settings, setLanguage, toggleSound } = useSettings();

  // Determine which content to show
  const hasGameSettings = gameSettings.length > 0;
  const hasCommonSettings = showCommonSettings;
  const shouldShowTabs = showTabs && hasGameSettings && hasCommonSettings;

  const commonSettings: GameSettingControl[] = [
    {
      id: 'language',
      type: 'button-group',
      label: t('core.settings.language'),
      value: settings.lang,
      onChange: (value: string) => setLanguage(value as Lang),
      options: [
        { value: 'en', label: 'English' },
        { value: 'ja', label: '日本語' },
      ],
    },
    {
      id: 'sound',
      type: 'toggle',
      label: t('core.settings.sound'),
      value: settings.sound,
      onChange: () => toggleSound(),
    },
  ];

  const renderSettingControl = (setting: GameSettingControl) => {
    switch (setting.type) {
      case 'checkbox':
        return (
          <input
            type="checkbox"
            checked={setting.value}
            onChange={(e) => setting.onChange(e.target.checked)}
            disabled={setting.disabled}
            className="w-4 h-4 rounded accent-blue-500"
          />
        );

      case 'select':
        return (
          <select
            value={setting.value}
            onChange={(e) => setting.onChange(e.target.value)}
            disabled={setting.disabled}
            className="px-3 py-1 border border-gray-300 rounded-md text-sm"
          >
            {setting.options?.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );

      case 'radio':
        return (
          <div className="flex gap-2">
            {setting.options?.map((option) => (
              <label key={option.value} className="flex items-center gap-1">
                <input
                  type="radio"
                  name={setting.id}
                  value={option.value}
                  checked={setting.value === option.value}
                  onChange={() => setting.onChange(option.value)}
                  disabled={setting.disabled}
                  className="w-4 h-4"
                />
                <span className="text-sm">{option.label}</span>
              </label>
            ))}
          </div>
        );

      case 'button-group':
        return (
          <div className="flex gap-3">
            {setting.options?.map((option) => (
              <Button
                key={option.value}
                variant={setting.value === option.value ? 'primary' : 'secondary'}
                onClick={() => setting.onChange(option.value)}
                disabled={setting.disabled}
                title={option.description}
                size="sm"
              >
                {option.label}
              </Button>
            ))}
          </div>
        );

      case 'toggle':
        return (
          <Toggle
            checked={setting.value}
            onChange={(checked) => setting.onChange(checked)}
            disabled={setting.disabled}
          />
        );

      default:
        return null;
    }
  };

  const renderSettings = (settings: GameSettingControl[]) => {
    if (settings.length === 0) return null;

    return (
      <div className="space-y-4">
        {settings.map((setting) => (
          <div key={setting.id} className="flex items-center justify-between">
            <div className="flex-1">
              <label className="text-sm font-medium text-gray-700">
                {setting.label}
              </label>
              {setting.description && (
                <div className="text-xs text-gray-500 mt-1">
                  {setting.description}
                </div>
              )}
            </div>
            <div className="ml-4">
              {renderSettingControl(setting)}
            </div>
          </div>
        ))}
      </div>
    );
  };

  const tabs: TabItem[] = [];

  if (hasCommonSettings) {
    tabs.push({
      id: 'common',
      label: texts.commonTab || t('core.settings.commonTab'),
      content: renderSettings(commonSettings),
    });
  }

  if (hasGameSettings) {
    tabs.push({
      id: 'game',
      label: texts.gameTab || t('core.settings.gameTab'),
      content: renderSettings(gameSettings),
    });
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size="lg"
      showCloseButton={false}
    >
      <div className="space-y-6">
        {/* Settings Content */}
        <div className="mb-6">
          {shouldShowTabs ? (
            // Tabbed view using the new Tabs component
            <Tabs
              tabs={tabs}
              defaultActiveTab="game"
              contentClassName="pt-4"
            />
          ) : (
            // Unified view (current behavior when tabs disabled)
            <>
              {hasCommonSettings && renderSettings(commonSettings)}
              {hasGameSettings && renderSettings(gameSettings)}
            </>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex gap-3 pt-4 border-t border-gray-200">
          {onResetSettings && (
            <button
              onClick={onResetSettings}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              {texts.reset || t('core.settings.reset')}
            </button>
          )}
          <div className="flex-1" />
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
          >
            {texts.close || t('core.settings.close')}
          </button>
        </div>
      </div>
    </Modal>
  );
}

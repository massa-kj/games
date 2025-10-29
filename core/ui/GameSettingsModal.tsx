import { Modal } from './Modal';
import { useTranslation } from 'react-i18next';

/**
 * Configuration object for a single game setting control.
 */
export interface GameSettingControl {
  /** Unique identifier for the setting */
  id: string;
  /** Type of input control to render */
  type: 'checkbox' | 'select' | 'radio' | 'button-group';
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

  // Action buttons
  onResetSettings?: () => void;

  // Text overrides for internationalization
  texts?: {
    reset?: string;
    close?: string;
  };
}

/**
 * Modal dialog for configuring game settings with various input types.
 *
 * Supports multiple control types including checkboxes, selects, radio buttons,
 * and button groups. Integrates with react-i18next for internationalization.
 *
 * @param isOpen Whether the modal is open
 * @param onClose Callback when modal is closed
 * @param title Modal title
 * @param gameSettings Array of setting controls to render
 * @param onResetSettings Optional callback to reset all settings
 * @param texts Text overrides for internationalization
 *
 * @example
 * ```tsx
 * <GameSettingsModal
 *   isOpen={showSettings}
 *   onClose={() => setShowSettings(false)}
 *   title="Game Settings"
 *   gameSettings={[
 *     {
 *       id: 'sound',
 *       type: 'checkbox',
 *       label: 'Sound Effects',
 *       value: soundEnabled,
 *       onChange: setSoundEnabled
 *     }
 *   ]}
 * />
 * ```
 */
export function GameSettingsModal({
  isOpen,
  onClose,
  title,
  gameSettings = [],
  onResetSettings,
  texts = {}
}: GameSettingsModalProps) {
  const { t } = useTranslation();

  const renderGameSettings = () => {
    if (gameSettings.length === 0) return null;

    return (
      <div className="mb-6">
        <div className="space-y-4">
          {gameSettings.map((setting) => (
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
      </div>
    );
  };

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
          <div className="flex gap-2 flex-wrap">
            {setting.options?.map((option) => (
              <button
                key={option.value}
                onClick={() => setting.onChange(option.value)}
                disabled={setting.disabled}
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${setting.value === option.value
                  ? 'bg-blue-500 text-white shadow-lg'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  } ${setting.disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                title={option.description}
              >
                {option.label}
              </button>
            ))}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size="lg"
      showCloseButton={false}
    >
      <div className="space-y-6">
        {renderGameSettings()}

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

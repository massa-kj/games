import React from 'react';
import { Modal } from './Modal';

export interface GameDifficultyOption {
  key: string;
  label: string;
  description?: string;
}

export interface GameSettingControl {
  id: string;
  type: 'checkbox' | 'select' | 'radio';
  label: string;
  description?: string;
  value: any;
  onChange: (value: any) => void;
  options?: { value: any; label: string }[];
  disabled?: boolean;
}

export interface GameSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;

  // Difficulty settings
  difficulties?: GameDifficultyOption[];
  currentDifficulty?: string;
  onDifficultyChange?: (difficulty: string) => void;

  // Custom game settings
  gameSettings?: GameSettingControl[];

  // Action buttons
  onResetSettings?: () => void;

  // Text overrides for internationalization
  texts?: {
    difficultyLabel?: string;
    resetSettings?: string;
    close?: string;
  };
}

export function GameSettingsModal({
  isOpen,
  onClose,
  title,
  difficulties = [],
  currentDifficulty,
  onDifficultyChange,
  gameSettings = [],
  onResetSettings,
  texts = {}
}: GameSettingsModalProps) {
  const defaultTexts = {
    difficultyLabel: 'Difficulty',
    resetSettings: 'Reset Settings',
    close: 'Close',
    ...texts
  };

  const renderDifficultySection = () => {
    if (difficulties.length === 0) return null;

    return (
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-800 mb-3">
          {defaultTexts.difficultyLabel}
        </h3>
        <div className="flex gap-2 flex-wrap">
          {difficulties.map((difficulty) => (
            <button
              key={difficulty.key}
              onClick={() => onDifficultyChange?.(difficulty.key)}
              className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${currentDifficulty === difficulty.key
                ? 'bg-blue-500 text-white shadow-lg'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              title={difficulty.description}
            >
              {difficulty.label}
            </button>
          ))}
        </div>
      </div>
    );
  };

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

      default:
        return null;
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={title} size="lg">
      <div className="space-y-6">
        {renderDifficultySection()}
        {renderGameSettings()}

        {/* Action buttons */}
        <div className="flex gap-3 pt-4 border-t border-gray-200">
          {onResetSettings && (
            <button
              onClick={onResetSettings}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              {defaultTexts.resetSettings}
            </button>
          )}
          <div className="flex-1" />
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
          >
            {defaultTexts.close}
          </button>
        </div>
      </div>
    </Modal>
  );
}

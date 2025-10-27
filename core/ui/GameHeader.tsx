import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { HomeButton, type HomeButtonProps } from './HomeButton.js';
import { GameSettingsModal, type GameSettingsModalProps, type GameSettingControl } from './GameSettingsModal.js';
import { Button } from './Button.js';

// Re-export GameSettingControl for convenience
export type { GameSettingControl } from './GameSettingsModal.js';

export interface GameHeaderAction {
  id: string;
  type: 'button' | 'settings' | 'custom';
  label: string;
  icon?: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'accent' | 'success' | 'warning' | 'error';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  disabled?: boolean;
  className?: string;
  // For custom type
  render?: () => React.ReactNode;
}

export interface GameHeaderProps {
  /**
   * Game title to display in the header
   */
  title?: string;

  /**
   * Whether to show the home button
   */
  showHomeButton?: boolean;

  /**
   * Props for the home button
   */
  homeButtonProps?: Omit<HomeButtonProps, 'onClick'>;

  /**
   * Custom home button click handler
   */
  onHomeClick?: () => void;

  /**
   * Whether to show the settings button
   */
  showSettingsButton?: boolean;

  /**
   * Game settings for the settings modal
   */
  gameSettings?: GameSettingControl[];

  /**
   * Props for the settings modal (excluding isOpen, onClose)
   */
  settingsModalProps?: Omit<GameSettingsModalProps, 'isOpen' | 'onClose' | 'gameSettings'>;

  /**
   * Additional actions/buttons to display in the header
   */
  actions?: GameHeaderAction[];

  /**
   * Header layout variant
   */
  variant?: 'default' | 'compact' | 'minimal';

  /**
   * Custom CSS classes
   */
  className?: string;

  /**
   * Custom content to render on the left side (replaces title)
   */
  leftContent?: React.ReactNode;

  /**
   * Custom content to render on the right side (in addition to buttons)
   */
  rightContent?: React.ReactNode;
}

const SettingsIcon = () => (
  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

export function GameHeader({
  title,
  showHomeButton = true,
  homeButtonProps,
  onHomeClick,
  showSettingsButton = true,
  gameSettings = [],
  settingsModalProps,
  actions = [],
  variant = 'default',
  className = '',
  leftContent,
  rightContent,
}: GameHeaderProps) {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const { t } = useTranslation();

  const handleHomeClick = () => {
    if (onHomeClick) {
      onHomeClick();
    } else {
      // Default behavior - navigate to root
      window.location.href = '/games/';
    }
  };

  const handleSettingsClick = () => {
    setIsSettingsOpen(true);
  };

  const handleSettingsClose = () => {
    setIsSettingsOpen(false);
  };

  const renderAction = (action: GameHeaderAction) => {
    if (action.type === 'custom' && action.render) {
      return (
        <div key={action.id}>
          {action.render()}
        </div>
      );
    }

    return (
      <Button
        key={action.id}
        variant={action.variant || 'secondary'}
        size={action.size || 'md'}
        onClick={action.onClick}
        disabled={action.disabled}
        className={action.className}
        title={action.label}
      >
        {action.icon}
        {action.label && <span className="ml-2">{action.label}</span>}
      </Button>
    );
  };

  const getHeaderClasses = () => {
    const base = 'game-header flex items-center justify-between p-2 bg-white border-b border-gray-200';
    const variants = {
      default: 'min-h-[60px]',
      compact: 'min-h-[48px] p-3',
      minimal: 'min-h-[40px] p-2 border-none',
    };

    return `${base} ${variants[variant]} ${className}`;
  };

  return (
    <>
      <header className={getHeaderClasses()}>
        {/* Left side */}
        <div className="flex items-center flex-1">
          {leftContent || (
            <>
              {showHomeButton && (
                <HomeButton
                  {...homeButtonProps}
                  onClick={handleHomeClick}
                  className={`mr-4 ${homeButtonProps?.className || ''}`}
                />
              )}
              {title && (
                <h1 className="text-lg font-semibold text-gray-800 truncate">
                  {title}
                </h1>
              )}
            </>
          )}
        </div>

        {/* Right side */}
        <div className="flex items-center gap-2">
          {rightContent}

          {/* Additional actions */}
          {actions.map((action) => renderAction(action))}

          {/* Settings button */}
          {showSettingsButton && gameSettings.length > 0 && (
            <Button
              variant="secondary"
              size="md"
              onClick={handleSettingsClick}
              title="Settings"
              className="flex items-center justify-center"
            >
              <SettingsIcon />
            </Button>
          )}
        </div>
      </header>

      {/* Settings Modal */}
      {showSettingsButton && (
        <GameSettingsModal
          {...settingsModalProps}
          isOpen={isSettingsOpen}
          onClose={handleSettingsClose}
          gameSettings={gameSettings}
          title={settingsModalProps?.title || t('core.settings.title')}
        />
      )}
    </>
  );
}

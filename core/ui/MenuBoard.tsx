import React, { ReactNode } from 'react';
import { Tabs } from './Tabs.js';
import { Motion } from './motion/index.js';

/**
 * Configuration for a menu tab.
 */
export interface MenuTab {
  /** Unique identifier for the tab */
  id: string;
  /** Display label for the tab */
  label: string;
  /** Optional icon to display alongside the label */
  icon?: ReactNode;
  /** Content to render when the tab is active */
  content: ReactNode;
  /** Whether the tab is disabled */
  disabled?: boolean;
}

/**
 * Motion component wrapper type for custom animations.
 */
export interface MenuBoardMotion {
  wrapper?: React.ComponentType<{ children: ReactNode }>;
}

export interface MenuBoardProps {
  /** Large title displayed at the top of the menu. Example: "Game Menu" */
  title?: string;

  /** Array of tabs. If not provided, tabs will be hidden */
  tabs?: MenuTab[];

  /** Single content to display when not using tabs */
  children?: ReactNode;

  /** Menu width size. Mobile defaults to full width */
  size?: 'sm' | 'md' | 'lg' | 'full';

  /** Whether to show a close button */
  closable?: boolean;

  /** Callback when close button is clicked */
  onClose?: () => void;

  /** Additional CSS classes for styling customization */
  className?: string;

  /** Custom animation wrapper (e.g., Framer Motion components) */
  motion?: MenuBoardMotion;

  /** ID of the initially active tab */
  defaultActiveTab?: string;

  /** Controlled active tab ID */
  activeTab?: string;

  /** Callback when active tab changes */
  onTabChange?: (tabId: string) => void;

  /** Whether to show the menu board with entrance animation */
  isVisible?: boolean;

  /** Tab variant style */
  tabVariant?: 'default' | 'compact' | 'pills';

  /** ARIA label for accessibility */
  ariaLabel?: string;

  /** Display mode: 'modal' (overlay) or 'inline' (embedded) */
  variant?: 'modal' | 'inline';

  /** Theme variant for different visual styles */
  theme?: 'default' | 'wood' | 'card' | 'craft' | 'modern';
}

/**
 * A flexible MenuBoard component for organizing content with optional tabs.
 *
 * Designed for mobile-first responsive design with support for accessibility,
 * animations, and customizable styling. Suitable for game menus, settings panels,
 * and other organized content displays.
 *
 * Features:
 * - Tab-based or single content display
 * - Responsive sizing with mobile-first approach
 * - Accessibility support with ARIA labels and keyboard navigation
 * - Customizable animations via motion props
 * - Pastel color scheme suitable for children
 * - Close button functionality
 *
 * @param title Large title displayed at the top
 * @param tabs Array of tab configurations with labels, icons, and content
 * @param children Single content when not using tabs
 * @param size Width variant: 'sm' | 'md' | 'lg' | 'full'
 * @param closable Whether to show close button
 * @param onClose Callback for close button click
 * @param className Additional CSS classes
 * @param motion Custom animation wrapper configuration
 * @param defaultActiveTab Initially active tab ID (uncontrolled)
 * @param activeTab Currently active tab ID (controlled)
 * @param onTabChange Callback when tab changes
 * @param isOpen Whether menu is visible (for animations)
 * @param tabVariant Visual style for tabs
 * @param ariaLabel Accessibility label
 *
 * @example
 * ```tsx
 * // Simple menu with content
 * <MenuBoard
 *   title="Game Settings"
 *   closable
 *   onClose={() => setShowMenu(false)}
 * >
 *   <div>Settings content here</div>
 * </MenuBoard>
 *
 * // Menu with tabs
 * const tabs = [
 *   {
 *     id: 'general',
 *     label: 'General',
 *     icon: <SettingsIcon />,
 *     content: <GeneralSettings />
 *   },
 *   {
 *     id: 'audio',
 *     label: 'Audio',
 *     icon: <SpeakerIcon />,
 *     content: <AudioSettings />
 *   }
 * ];
 *
 * <MenuBoard
 *   title="Game Menu"
 *   tabs={tabs}
 *   size="lg"
 *   isOpen={showMenu}
 * />
 * ```
 */
export function MenuBoard({
  title,
  tabs,
  children,
  size = 'md',
  closable = false,
  onClose,
  className = '',
  motion,
  defaultActiveTab,
  activeTab,
  onTabChange,
  isVisible = true,
  tabVariant = 'default',
  ariaLabel,
  variant = 'modal',
  theme = 'default',
}: MenuBoardProps) {
  // Handle keyboard navigation for close button
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Escape' && closable && onClose) {
      onClose();
    }
  };

  // Get responsive size classes
  const getSizeClasses = () => {
    const baseClasses = variant === 'inline'
      ? 'w-full max-h-full overflow-auto'
      : 'w-full max-h-[90vh] overflow-auto';

    const sizeVariants = {
      sm: variant === 'inline' ? 'max-w-sm' : 'md:w-80 lg:w-96',
      md: variant === 'inline' ? 'max-w-md' : 'md:w-96 lg:w-[32rem]',
      lg: variant === 'inline' ? 'max-w-2xl' : 'md:w-[32rem] lg:w-[40rem]',
      full: 'w-full',
    };

    return `${baseClasses} ${sizeVariants[size]}`;
  };

  // Get theme classes
  const getThemeClasses = () => {
    const themeVariants = {
      default: 'menu-board',
      wood: 'menu-board menu-board-wood',
      card: 'menu-board menu-board-card',
      craft: 'menu-board menu-board-craft',
      modern: 'menu-board menu-board-modern',
    };

    return themeVariants[theme];
  };

  // Prepare content
  const content = (
    <div
      className={`${getThemeClasses()} ${getSizeClasses()} ${className}`}
      onKeyDown={handleKeyDown}
      role="dialog"
      aria-label={ariaLabel || title || 'Menu'}
      tabIndex={-1}
    >
      {/* Header */}
      <div className="menu-board-header">
        {title && (
          <h2 className="menu-board-title">
            {title}
          </h2>
        )}

        {closable && onClose && (
          <button
            onClick={onClose}
            className="menu-board-close"
            aria-label="Close menu"
            type="button"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        )}
      </div>

      {/* Content */}
      <div className="menu-board-content">
        {tabs ? (
          <Tabs
            tabs={tabs.map(tab => ({
              id: tab.id,
              label: tab.label,
              content: tab.content,
              disabled: tab.disabled,
              className: tab.icon ? 'tab-with-icon' : '',
            }))}
            defaultActiveTab={defaultActiveTab}
            activeTab={activeTab}
            onTabChange={onTabChange}
            variant={tabVariant}
            className="menu-board-tabs"
            contentClassName="menu-board-tab-content"
          />
        ) : (
          children
        )}
      </div>
    </div>
  );

  // Apply motion wrapper if provided
  if (motion?.wrapper) {
    const MotionWrapper = motion.wrapper;
    return <MotionWrapper>{content}</MotionWrapper>;
  }

  // Return inline content without wrapper
  if (variant === 'inline') {
    return content;
  }

  // Default modal wrapper with entrance animation
  return (
    <Motion
      type="scale"
      show={isVisible}
      className="menu-board-wrapper"
    >
      {content}
    </Motion>
  );
}

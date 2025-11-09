import React, { useState, ReactNode } from 'react';

/**
 * Configuration for a single tab.
 */
export interface TabItem {
  /** Unique identifier for the tab */
  id: string;
  /** Display label for the tab */
  label: string;
  /** Content to render when the tab is active */
  content: ReactNode;
  /** Whether the tab is disabled */
  disabled?: boolean;
  /** Additional CSS classes for the tab button */
  className?: string;
}

export interface TabsProps {
  /** Array of tab configurations */
  tabs: TabItem[];
  /** ID of the initially active tab */
  defaultActiveTab?: string;
  /** Controlled active tab ID */
  activeTab?: string;
  /** Callback when active tab changes */
  onTabChange?: (tabId: string) => void;
  /** Layout variant */
  variant?: 'default' | 'compact' | 'pills';
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Additional CSS classes for the container */
  className?: string;
  /** Additional CSS classes for the tab list */
  tabListClassName?: string;
  /** Additional CSS classes for the content area */
  contentClassName?: string;
}

/**
 * A flexible tabs component for organizing content into separate panels.
 *
 * Supports controlled and uncontrolled usage, customizable styling,
 * and accessibility features including keyboard navigation and ARIA attributes.
 *
 * @param tabs Array of tab configurations with labels and content
 * @param defaultActiveTab ID of the initially active tab (uncontrolled)
 * @param activeTab ID of the currently active tab (controlled)
 * @param onTabChange Callback when the active tab changes
 * @param variant Visual style variant for the tabs
 * @param size Size variant for the tabs
 * @param className Additional CSS classes for the container
 * @param tabListClassName Additional CSS classes for the tab list
 * @param contentClassName Additional CSS classes for the content area
 *
 * @example
 * ```tsx
 * const tabs = [
 *   {
 *     id: 'general',
 *     label: 'General',
 *     content: <GeneralSettings />
 *   },
 *   {
 *     id: 'game',
 *     label: 'Game',
 *     content: <GameSettings />
 *   }
 * ];
 *
 * <Tabs tabs={tabs} defaultActiveTab="general" />
 * ```
 */
export function Tabs({
  tabs,
  defaultActiveTab,
  activeTab: controlledActiveTab,
  onTabChange,
  variant = 'default',
  size = 'md',
  className = '',
  tabListClassName = '',
  contentClassName = '',
}: TabsProps) {
  const [internalActiveTab, setInternalActiveTab] = useState(() =>
    defaultActiveTab || tabs[0]?.id || ''
  );

  const isControlled = controlledActiveTab !== undefined;
  const activeTab = isControlled ? controlledActiveTab : internalActiveTab;

  const handleTabChange = (tabId: string) => {
    if (!isControlled) {
      setInternalActiveTab(tabId);
    }
    onTabChange?.(tabId);
  };

  const handleKeyDown = (event: React.KeyboardEvent, tabId: string) => {
    const currentIndex = tabs.findIndex(tab => tab.id === activeTab);
    let newIndex = currentIndex;

    switch (event.key) {
      case 'ArrowLeft':
        newIndex = currentIndex > 0 ? currentIndex - 1 : tabs.length - 1;
        break;
      case 'ArrowRight':
        newIndex = currentIndex < tabs.length - 1 ? currentIndex + 1 : 0;
        break;
      case 'Home':
        newIndex = 0;
        break;
      case 'End':
        newIndex = tabs.length - 1;
        break;
      case 'Enter':
      case ' ':
        event.preventDefault();
        handleTabChange(tabId);
        return;
      default:
        return;
    }

    event.preventDefault();
    const newTab = tabs[newIndex];
    if (newTab && !newTab.disabled) {
      handleTabChange(newTab.id);
    }
  };

  const getTabButtonClasses = (tab: TabItem) => {
    const isActive = activeTab === tab.id;

    // Base classes
    const baseClasses = 'relative font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2';

    // Size classes
    const sizeClasses = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-4 py-2 text-sm',
      lg: 'px-6 py-3 text-base',
    };

    // Variant classes
    const variantClasses = {
      default: isActive
        ? 'border-b-2 border-blue-500 text-blue-600'
        : 'text-gray-500 hover:text-gray-700',
      compact: isActive
        ? 'border-b-2 border-blue-500 text-blue-600'
        : 'text-gray-500 hover:text-gray-700',
      pills: isActive
        ? 'bg-blue-100 text-blue-700 rounded-lg'
        : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg',
    };

    const disabledClasses = tab.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer';

    return `${baseClasses} ${sizeClasses[size]} ${variantClasses[variant]} ${disabledClasses} ${tab.className || ''}`;
  };

  const getTabListClasses = () => {
    const baseClasses = 'flex';

    const variantClasses = {
      default: 'border-b border-gray-200',
      compact: 'border-b border-gray-200 space-x-2',
      pills: 'space-x-1 p-1 bg-gray-100 rounded-lg',
    };

    return `${baseClasses} ${variantClasses[variant]} ${tabListClassName}`;
  };

  const activeTabContent = tabs.find(tab => tab.id === activeTab)?.content;

  return (
    <div className={`tabs ${className}`}>
      {/* Tab list */}
      <div
        role="tablist"
        className={getTabListClasses()}
        aria-label="Tab navigation"
      >
        {tabs.map((tab) => (
          <button
            key={tab.id}
            role="tab"
            tabIndex={activeTab === tab.id ? 0 : -1}
            aria-selected={activeTab === tab.id}
            aria-controls={`tabpanel-${tab.id}`}
            id={`tab-${tab.id}`}
            disabled={tab.disabled}
            className={getTabButtonClasses(tab)}
            onClick={() => !tab.disabled && handleTabChange(tab.id)}
            onKeyDown={(e) => !tab.disabled && handleKeyDown(e, tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div
        role="tabpanel"
        id={`tabpanel-${activeTab}`}
        aria-labelledby={`tab-${activeTab}`}
        className={`tab-content ${contentClassName}`}
      >
        {activeTabContent}
      </div>
    </div>
  );
}

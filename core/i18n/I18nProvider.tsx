import React from 'react';
import { I18nextProvider } from 'react-i18next';
import i18n from './i18n';
import type { I18nProviderProps } from './types';

/**
 * Provider component that wraps the application with i18n context.
 *
 * This component provides the react-i18next context to all child components,
 * enabling them to use translation hooks and functions. It should be placed
 * at the root of your application or game component tree.
 *
 * The provider automatically handles:
 * - Language detection from localStorage
 * - Fallback language configuration
 * - React integration for translation hooks
 *
 * @param props - Component props
 * @param props.children - React children to provide i18n context to
 *
 * @example
 * ```tsx
 * // In your App root or game entry point
 * import { I18nProvider } from '@core/i18n';
 *
 * function App() {
 *   return (
 *     <I18nProvider>
 *       <GameComponent />
 *     </I18nProvider>
 *   );
 * }
 * ```
 */
export const I18nProvider: React.FC<I18nProviderProps> = ({ children }) => {
  return (
    <I18nextProvider i18n={i18n}>
      {children}
    </I18nextProvider>
  );
};

export default I18nProvider;

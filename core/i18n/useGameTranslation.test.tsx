import { renderHook, act } from '@testing-library/react';
import { I18nextProvider } from 'react-i18next';
import { useGameTranslation } from './useGameTranslation';
import i18n from './i18n';

// Mock translation resources for testing
const mockTranslations = {
  en: {
    title: 'Test Game',
    ui: {
      buttons: {
        start: 'Start',
        cancel: 'Cancel',
      },
      labels: {
        score: 'Score',
      },
    },
    nested: {
      deep: {
        value: 'Deep Value',
      },
    },
  },
  ja: {
    title: 'テストゲーム',
    ui: {
      buttons: {
        start: '開始',
        cancel: 'キャンセル',
      },
      labels: {
        score: 'スコア',
      },
    },
    nested: {
      deep: {
        value: '深い値',
      },
    },
  },
};

// Wrapper component for testing with i18n context
const createWrapper = () => {
  // eslint-disable-next-line react/display-name
  return ({ children }: { children: React.ReactNode }) => (
    <I18nextProvider i18n={i18n}>{children}</I18nextProvider>
  );
};

describe('useGameTranslation', () => {
  beforeEach(() => {
    // Reset i18n state before each test
    i18n.changeLanguage('en');
    localStorage.clear();
  });

  it('should return correct translation for simple keys', () => {
    const { result } = renderHook(
      () => useGameTranslation(mockTranslations),
      { wrapper: createWrapper() }
    );

    expect(result.current.t('title')).toBe('Test Game');
    expect(result.current.lang).toBe('en');
  });

  it('should return correct translation for nested keys using dot notation', () => {
    const { result } = renderHook(
      () => useGameTranslation(mockTranslations),
      { wrapper: createWrapper() }
    );

    expect(result.current.t('ui.buttons.start')).toBe('Start');
    expect(result.current.t('ui.buttons.cancel')).toBe('Cancel');
    expect(result.current.t('ui.labels.score')).toBe('Score');
    expect(result.current.t('nested.deep.value')).toBe('Deep Value');
  });

  it('should switch languages correctly', async () => {
    const { result } = renderHook(
      () => useGameTranslation(mockTranslations),
      { wrapper: createWrapper() }
    );

    // Initial state (English)
    expect(result.current.t('title')).toBe('Test Game');
    expect(result.current.lang).toBe('en');

    // Change to Japanese
    await act(async () => {
      result.current.changeLang('ja');
    });

    expect(result.current.t('title')).toBe('テストゲーム');
    expect(result.current.t('ui.buttons.start')).toBe('開始');
    expect(result.current.lang).toBe('ja');
  });

  it('should persist language choice in localStorage', async () => {
    const { result } = renderHook(
      () => useGameTranslation(mockTranslations),
      { wrapper: createWrapper() }
    );

    await act(async () => {
      result.current.changeLang('ja');
    });

    expect(localStorage.getItem('lang')).toBe('ja');
  });

  it('should fallback to Japanese when current language is not available', () => {
    const incompleteTranslations = {
      en: mockTranslations.en,
      ja: mockTranslations.ja,
    };

    // Set i18n to a language not in our translations
    i18n.changeLanguage('fr');

    const { result } = renderHook(
      () => useGameTranslation(incompleteTranslations),
      { wrapper: createWrapper() }
    );

    // Should fallback to Japanese
    expect(result.current.t('title')).toBe('テストゲーム');
  });

  it('should return the key itself when translation is not found', () => {
    const { result } = renderHook(
      () => useGameTranslation(mockTranslations),
      { wrapper: createWrapper() }
    );

    expect(result.current.t('nonexistent.key' as any)).toBe('nonexistent.key');
  });

  it('should handle custom fallback language', () => {
    const { result } = renderHook(
      () => useGameTranslation(mockTranslations, 'en'),
      { wrapper: createWrapper() }
    );

    // Set to a language not in translations
    i18n.changeLanguage('fr');

    // Should fallback to English (custom fallback)
    expect(result.current.t('title')).toBe('Test Game');
  });

  it('should handle empty or malformed nested paths gracefully', () => {
    const { result } = renderHook(
      () => useGameTranslation(mockTranslations),
      { wrapper: createWrapper() }
    );

    expect(result.current.t('ui.nonexistent.key' as any)).toBe('ui.nonexistent.key');
    expect(result.current.t('ui.buttons.nonexistent' as any)).toBe('ui.buttons.nonexistent');
  });
});

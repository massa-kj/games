import type { Lang } from '../types';

export interface SpeechOptions {
  rate?: number;
  pitch?: number;
  volume?: number;
}

export function speak(
  text: string,
  lang: Lang,
  options: SpeechOptions = {}
): void {
  // Check if speech synthesis is available
  if (!('speechSynthesis' in window)) {
    console.warn('Speech synthesis not supported');
    return;
  }

  try {
    // Cancel any ongoing speech
    speechSynthesis.cancel();

    const utterance = new SpeechSynthesisUtterance(text);

    // Set language
    utterance.lang = lang === 'ja' ? 'ja-JP' : 'en-US';

    // Set options
    utterance.rate = options.rate ?? 1;
    utterance.pitch = options.pitch ?? 1;
    utterance.volume = options.volume ?? 1;

    // Error handling
    utterance.onerror = (event) => {
      console.warn('Speech synthesis error:', event.error);
    };

    speechSynthesis.speak(utterance);
  } catch (error) {
    console.warn('Failed to speak:', error);
  }
}

export function stopSpeech(): void {
  if ('speechSynthesis' in window) {
    speechSynthesis.cancel();
  }
}

export function isSpeechSupported(): boolean {
  return 'speechSynthesis' in window;
}

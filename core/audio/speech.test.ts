import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { speak, stopSpeech, isSpeechSupported } from './speech';

// Mock SpeechSynthesisUtterance
class MockSpeechSynthesisUtterance {
  public text = '';
  public lang = '';
  public rate = 1;
  public pitch = 1;
  public volume = 1;
  public onerror: ((event: any) => void) | null = null;

  constructor(text: string) {
    this.text = text;
  }
}

// Mock speechSynthesis
const createMockSpeechSynthesis = () => ({
  cancel: vi.fn(),
  speak: vi.fn(),
  pause: vi.fn(),
  resume: vi.fn(),
  getVoices: vi.fn(() => []),
  pending: false,
  speaking: false,
  paused: false,
});

describe('speech', () => {
  let mockSpeechSynthesis: ReturnType<typeof createMockSpeechSynthesis>;
  let mockUtterances: MockSpeechSynthesisUtterance[];

  beforeEach(() => {
    // Reset mock speech synthesis
    mockSpeechSynthesis = createMockSpeechSynthesis();
    Object.defineProperty(global, 'speechSynthesis', {
      value: mockSpeechSynthesis,
      configurable: true
    });

    // Track created utterances
    mockUtterances = [];

    // Mock SpeechSynthesisUtterance constructor
    global.SpeechSynthesisUtterance = vi.fn().mockImplementation((text: string) => {
      const utterance = new MockSpeechSynthesisUtterance(text);
      mockUtterances.push(utterance);
      return utterance;
    });

    // Mock console methods
    vi.spyOn(console, 'warn').mockImplementation(() => { });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('isSpeechSupported', () => {
    it('should return true when speechSynthesis is available', () => {
      expect(isSpeechSupported()).toBe(true);
    });

    it('should return false when speechSynthesis is not available', () => {
      // Remove speechSynthesis from window
      delete (global as any).speechSynthesis;

      expect(isSpeechSupported()).toBe(false);
    });
  });

  describe('speak', () => {
    it('should create utterance with correct text and default options', () => {
      const text = 'Hello, world!';

      speak(text, 'en');

      expect(global.SpeechSynthesisUtterance).toHaveBeenCalledWith(text);
      expect(mockUtterances).toHaveLength(1);

      const utterance = mockUtterances[0];
      expect(utterance.text).toBe(text);
      expect(utterance.lang).toBe('en-US');
      expect(utterance.rate).toBe(1);
      expect(utterance.pitch).toBe(1);
      expect(utterance.volume).toBe(1);
    });

    it('should set Japanese language correctly', () => {
      speak('こんにちは', 'ja');

      const utterance = mockUtterances[0];
      expect(utterance.lang).toBe('ja-JP');
    });

    it('should set English language correctly', () => {
      speak('Hello', 'en');

      const utterance = mockUtterances[0];
      expect(utterance.lang).toBe('en-US');
    });

    it('should apply custom speech options', () => {
      const options = {
        rate: 0.8,
        pitch: 1.2,
        volume: 0.7
      };

      speak('Test text', 'en', options);

      const utterance = mockUtterances[0];
      expect(utterance.rate).toBe(0.8);
      expect(utterance.pitch).toBe(1.2);
      expect(utterance.volume).toBe(0.7);
    });

    it('should apply partial options with defaults', () => {
      speak('Test', 'en', { rate: 1.5 });

      const utterance = mockUtterances[0];
      expect(utterance.rate).toBe(1.5);
      expect(utterance.pitch).toBe(1); // Default
      expect(utterance.volume).toBe(1); // Default
    });

    it('should cancel any ongoing speech before speaking', () => {
      speak('First text', 'en');
      speak('Second text', 'en');

      expect(mockSpeechSynthesis.cancel).toHaveBeenCalledTimes(2);
    });

    it('should call speechSynthesis.speak with the utterance', () => {
      speak('Test text', 'en');

      expect(mockSpeechSynthesis.speak).toHaveBeenCalledWith(mockUtterances[0]);
    });

    it('should set up error handler', () => {
      speak('Test text', 'en');

      const utterance = mockUtterances[0];
      expect(typeof utterance.onerror).toBe('function');
    });

    it('should handle error in onerror callback', () => {
      speak('Test text', 'en');

      const utterance = mockUtterances[0];
      const mockEvent = { error: 'synthesis-failed' };

      utterance.onerror?.(mockEvent);

      expect(console.warn).toHaveBeenCalledWith(
        'Speech synthesis error:',
        'synthesis-failed'
      );
    });

    it('should return early and warn when speechSynthesis is not available', () => {
      // Remove speechSynthesis from window
      delete (global as any).speechSynthesis;

      speak('Test text', 'en');

      expect(console.warn).toHaveBeenCalledWith('Speech synthesis not supported');
      expect(global.SpeechSynthesisUtterance).not.toHaveBeenCalled();
    });

    it('should handle exceptions during speech creation', () => {
      global.SpeechSynthesisUtterance = vi.fn().mockImplementation(() => {
        throw new Error('Speech synthesis error');
      });

      speak('Test text', 'en');

      expect(console.warn).toHaveBeenCalledWith(
        'Failed to speak:',
        expect.any(Error)
      );
    });

    it('should handle exceptions during speechSynthesis.speak', () => {
      mockSpeechSynthesis.speak.mockImplementation(() => {
        throw new Error('Speak error');
      });

      speak('Test text', 'en');

      expect(console.warn).toHaveBeenCalledWith(
        'Failed to speak:',
        expect.any(Error)
      );
    });

    it('should handle empty text', () => {
      speak('', 'en');

      expect(global.SpeechSynthesisUtterance).toHaveBeenCalledWith('');
      expect(mockUtterances[0].text).toBe('');
    });

    it('should handle very long text', () => {
      const longText = 'a'.repeat(10000);

      speak(longText, 'en');

      expect(mockUtterances[0].text).toBe(longText);
    });

    it('should handle special characters in text', () => {
      const specialText = 'Hello! 123 @#$%^&*()_+-=[]{}|;:,.<>?';

      speak(specialText, 'en');

      expect(mockUtterances[0].text).toBe(specialText);
    });

    it('should handle Japanese text with special characters', () => {
      const japaneseText = 'こんにちは！１２３「」〜・';

      speak(japaneseText, 'ja');

      expect(mockUtterances[0].text).toBe(japaneseText);
      expect(mockUtterances[0].lang).toBe('ja-JP');
    });
  });

  describe('stopSpeech', () => {
    it('should call speechSynthesis.cancel when available', () => {
      stopSpeech();

      expect(mockSpeechSynthesis.cancel).toHaveBeenCalled();
    });

    it('should handle when speechSynthesis is not available', () => {
      delete (global as any).speechSynthesis;

      expect(() => stopSpeech()).not.toThrow();
    });

    it('should handle when speechSynthesis.cancel throws error', () => {
      mockSpeechSynthesis.cancel.mockImplementation(() => {
        throw new Error('Cancel failed');
      });

      // Current implementation doesn't handle errors, so it will throw
      expect(() => stopSpeech()).toThrow('Cancel failed');
    });
  });

  describe('integration tests', () => {
    it('should handle complete workflow: speak, stop, speak again', () => {
      // First speech
      speak('First message', 'en', { rate: 0.9 });

      expect(mockSpeechSynthesis.cancel).toHaveBeenCalledTimes(1);
      expect(mockSpeechSynthesis.speak).toHaveBeenCalledTimes(1);
      expect(mockUtterances).toHaveLength(1);
      expect(mockUtterances[0].text).toBe('First message');
      expect(mockUtterances[0].rate).toBe(0.9);

      // Stop speech
      stopSpeech();
      expect(mockSpeechSynthesis.cancel).toHaveBeenCalledTimes(2);

      // Second speech
      speak('Second message', 'ja', { pitch: 1.1 });

      expect(mockSpeechSynthesis.cancel).toHaveBeenCalledTimes(3);
      expect(mockSpeechSynthesis.speak).toHaveBeenCalledTimes(2);
      expect(mockUtterances).toHaveLength(2);
      expect(mockUtterances[1].text).toBe('Second message');
      expect(mockUtterances[1].lang).toBe('ja-JP');
      expect(mockUtterances[1].pitch).toBe(1.1);
    });

    it('should handle rapid consecutive speak calls', () => {
      const texts = ['First', 'Second', 'Third'];

      texts.forEach((text, index) => {
        speak(text, 'en');
      });

      // Should cancel before each speak call
      expect(mockSpeechSynthesis.cancel).toHaveBeenCalledTimes(3);
      expect(mockSpeechSynthesis.speak).toHaveBeenCalledTimes(3);
      expect(mockUtterances).toHaveLength(3);

      texts.forEach((text, index) => {
        expect(mockUtterances[index].text).toBe(text);
      });
    });

    it('should handle mixed languages in sequence', () => {
      const messages = [
        { text: 'Hello', lang: 'en' as const },
        { text: 'こんにちは', lang: 'ja' as const },
        { text: 'Goodbye', lang: 'en' as const }
      ];

      messages.forEach(({ text, lang }) => {
        speak(text, lang);
      });

      expect(mockUtterances).toHaveLength(3);
      expect(mockUtterances[0].lang).toBe('en-US');
      expect(mockUtterances[1].lang).toBe('ja-JP');
      expect(mockUtterances[2].lang).toBe('en-US');
    });
  });

  describe('edge cases', () => {
    it('should handle all option combinations', () => {
      const testCases = [
        { options: {}, expected: { rate: 1, pitch: 1, volume: 1 } },
        { options: { rate: 0.5 }, expected: { rate: 0.5, pitch: 1, volume: 1 } },
        { options: { pitch: 1.5 }, expected: { rate: 1, pitch: 1.5, volume: 1 } },
        { options: { volume: 0.8 }, expected: { rate: 1, pitch: 1, volume: 0.8 } },
        { options: { rate: 0.7, pitch: 1.2, volume: 0.9 }, expected: { rate: 0.7, pitch: 1.2, volume: 0.9 } }
      ];

      testCases.forEach(({ options, expected }, index) => {
        speak(`Test ${index}`, 'en', options);

        const utterance = mockUtterances[index];
        expect(utterance.rate).toBe(expected.rate);
        expect(utterance.pitch).toBe(expected.pitch);
        expect(utterance.volume).toBe(expected.volume);
      });
    });

    it('should handle extreme option values', () => {
      const extremeOptions = {
        rate: 10,
        pitch: 2,
        volume: 0
      };

      speak('Extreme test', 'en', extremeOptions);

      const utterance = mockUtterances[0];
      expect(utterance.rate).toBe(10);
      expect(utterance.pitch).toBe(2);
      expect(utterance.volume).toBe(0);
    });

    it('should handle negative option values', () => {
      const negativeOptions = {
        rate: -1,
        pitch: -0.5,
        volume: -1
      };

      speak('Negative test', 'en', negativeOptions);

      const utterance = mockUtterances[0];
      expect(utterance.rate).toBe(-1);
      expect(utterance.pitch).toBe(-0.5);
      expect(utterance.volume).toBe(-1);
    });

    it('should handle whitespace-only text', () => {
      speak('   \n\t  ', 'en');

      expect(mockUtterances[0].text).toBe('   \n\t  ');
    });

    it('should handle text with line breaks', () => {
      const multilineText = 'Line 1\nLine 2\nLine 3';

      speak(multilineText, 'en');

      expect(mockUtterances[0].text).toBe(multilineText);
    });
  });
});

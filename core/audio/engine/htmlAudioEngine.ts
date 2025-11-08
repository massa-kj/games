/**
 * HTML Audio element-based engine implementation
 */

import type { AudioEngine } from './index.js';
import type { SoundDefinition, PlayOptions } from '../types.js';

/**
 * HTML Audio engine implementation (fallback for environments without WebAudio)
 */
export class HTMLAudioEngine implements AudioEngine {
  readonly name = 'HTMLAudio';

  private audioElements: Map<string, HTMLAudioElement> = new Map();
  private soundDefinitions: Map<string, SoundDefinition> = new Map();
  private globalVolume = 1;
  private enabled = true;
  private nextId = 0;

  isSupported(): boolean {
    return typeof window !== 'undefined' && 'HTMLAudioElement' in window;
  }

  async initialize(): Promise<void> {
    // Load settings from localStorage
    const soundEnabled = localStorage.getItem('sound');
    if (soundEnabled !== null) {
      this.enabled = JSON.parse(soundEnabled);
    }
  }

  async createSound(definition: SoundDefinition, options?: PlayOptions): Promise<string> {
    const soundId = `html_${++this.nextId}`;
    this.soundDefinitions.set(soundId, definition);

    if (definition.src) {
      // Pre-load audio file
      const audio = new Audio(definition.src);
      audio.preload = 'auto';
      audio.volume = (definition.volume || options?.volume || 1) * this.globalVolume;
      audio.loop = definition.loop || options?.loop || false;
      this.audioElements.set(soundId, audio);
    } else if (definition.tone) {
      // HTML Audio doesn't support procedural generation
      // We'll create a simple beep using a data URL or throw an error
      console.warn('HTMLAudioEngine: Tone generation not supported, skipping sound');
    }

    return soundId;
  }

  async playSound(soundId: string, options?: PlayOptions): Promise<void> {
    if (!this.enabled) return;

    const audio = this.audioElements.get(soundId);
    const definition = this.soundDefinitions.get(soundId);

    if (!audio || !definition) {
      console.warn(`Sound not found: ${soundId}`);
      return;
    }

    try {
      // Reset to beginning
      audio.currentTime = 0;

      // Update volume if specified
      if (options?.volume !== undefined) {
        audio.volume = options.volume * this.globalVolume;
      }

      // Handle scheduling
      if (options?.when && options.when > 0) {
        const delay = Math.max(0, (options.when * 1000) - performance.now());
        setTimeout(() => audio.play().catch(console.warn), delay);
      } else {
        await audio.play();
      }
    } catch (error) {
      console.warn('Failed to play sound:', soundId, error);
    }
  }

  stopSound(soundId: string): void {
    const audio = this.audioElements.get(soundId);
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
    }
  }

  stopAll(): void {
    this.audioElements.forEach(audio => {
      audio.pause();
      audio.currentTime = 0;
    });
  }

  setVolume(volume: number): void {
    this.globalVolume = Math.max(0, Math.min(1, volume));

    // Update all existing audio elements
    this.audioElements.forEach(audio => {
      const soundId = Array.from(this.audioElements.entries())
        .find(([, el]) => el === audio)?.[0];
      const definition = soundId ? this.soundDefinitions.get(soundId) : null;
      audio.volume = (definition?.volume || 1) * this.globalVolume;
    });
  }

  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
    localStorage.setItem('sound', JSON.stringify(enabled));

    if (!enabled) {
      this.stopAll();
    }
  }

  isEnabled(): boolean {
    return this.enabled;
  }

  dispose(): void {
    this.stopAll();
    this.audioElements.clear();
    this.soundDefinitions.clear();
  }
}

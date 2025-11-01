import type { SoundOptions } from './types';

export interface SoundManager {
  play(src: string, options?: SoundOptions): Promise<void>;
  stopAll(): void;
  setGlobalVolume(volume: number): void;
  isEnabled(): boolean;
  setEnabled(enabled: boolean): void;
}

class WebAudioSoundManager implements SoundManager {
  private audioElements: Map<string, HTMLAudioElement> = new Map();
  private globalVolume = 1;
  private enabled = true;

  constructor() {
    // Load settings from localStorage
    const soundEnabled = localStorage.getItem('sound');
    if (soundEnabled !== null) {
      this.enabled = JSON.parse(soundEnabled);
    }
  }

  async play(src: string, options: SoundOptions = {}): Promise<void> {
    if (!this.enabled) return;

    try {
      let audio = this.audioElements.get(src);

      if (!audio) {
        audio = new Audio(src);
        audio.preload = 'auto';
        this.audioElements.set(src, audio);
      }

      // Reset audio to beginning
      audio.currentTime = 0;

      // Set volume
      const volume = (options.volume ?? 1) * this.globalVolume;
      audio.volume = Math.max(0, Math.min(1, volume));

      // Set loop
      audio.loop = options.loop ?? false;

      await audio.play();
    } catch (error) {
      console.warn('Failed to play sound:', src, error);
    }
  }

  stopAll(): void {
    this.audioElements.forEach((audio) => {
      audio.pause();
      audio.currentTime = 0;
    });
  }

  setGlobalVolume(volume: number): void {
    this.globalVolume = Math.max(0, Math.min(1, volume));
  }

  isEnabled(): boolean {
    return this.enabled;
  }

  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
    localStorage.setItem('sound', JSON.stringify(enabled));

    if (!enabled) {
      this.stopAll();
    }
  }
}

// Global sound manager instance
export const soundManager: SoundManager = new WebAudioSoundManager();

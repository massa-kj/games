/**
 * WebAudio-based engine implementation
 */

import type { AudioEngine } from './index.js';
import type { SoundDefinition, PlayOptions } from '../types.js';
import { webAudioEngine } from '../webAudioEngine.js';

/**
 * WebAudio engine implementation
 */
export class WebAudioEngine implements AudioEngine {
  readonly name = 'WebAudio';

  isSupported(): boolean {
    return typeof window !== 'undefined' &&
           'AudioContext' in window &&
           !!(window.AudioContext || (window as any).webkitAudioContext);
  }

  async initialize(): Promise<void> {
    // The underlying webAudioEngine initializes automatically
    return Promise.resolve();
  }

  async createSound(definition: SoundDefinition, options?: PlayOptions): Promise<string> {
    if (definition.tone) {
      // Use new tone generation method
      return webAudioEngine.createToneSound(definition.tone, options);
    } else if (definition.src) {
      // Use file-based sound
      return webAudioEngine.createSound(definition.src, {
        volume: definition.volume || options?.volume,
        loop: definition.loop || options?.loop
      });
    } else {
      throw new Error('SoundDefinition must have either tone or src property');
    }
  }

  async playSound(soundId: string, options?: PlayOptions): Promise<void> {
    webAudioEngine.playSound(soundId, options?.when);
    return Promise.resolve();
  }

  stopSound(soundId: string, when?: number): void {
    webAudioEngine.stopSound(soundId, when);
  }

  stopAll(): void {
    webAudioEngine.stopAllSounds();
  }

  setVolume(volume: number): void {
    webAudioEngine.setMasterVolume(volume);
  }

  setEnabled(enabled: boolean): void {
    webAudioEngine.setEnabled(enabled);
  }

  isEnabled(): boolean {
    return webAudioEngine.isEnabled();
  }

  dispose(): void {
    this.stopAll();
    // The underlying engine persists for now
  }
}

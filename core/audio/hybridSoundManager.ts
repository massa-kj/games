import type { SoundOptions } from '../types.js';
import { webAudioEngine } from './webAudioEngine.js';

export interface SoundManager {
  play(src: string, options?: SoundOptions): Promise<void>;
  stopAll(): void;
  setGlobalVolume(volume: number): void;
  isEnabled(): boolean;
  setEnabled(enabled: boolean): void;
}

export interface AdvancedSoundManager extends SoundManager {
  // Web Audio API specific methods
  playTemplate(template: string, params?: Record<string, any>): Promise<string>;
  playTone(frequency: number, duration?: number, options?: SoundOptions): Promise<string>;
  playBeep(options?: { frequency?: number; duration?: number }): Promise<string>;
  playNoise(type: 'white' | 'pink', duration?: number, options?: SoundOptions): Promise<string>;

  // Effect management
  createEffect(type: string, params?: Record<string, any>): string;
  applyEffect(soundId: string, effectId: string): void;

  // Advanced playback control
  scheduledPlay(src: string, when: number, options?: SoundOptions): Promise<string>;
  fadeIn(soundId: string, duration: number): void;
  fadeOut(soundId: string, duration: number): void;

  // Audio analysis
  getAnalyser(): AnalyserNode | null;

  // Template registration
  registerSoundTemplate(name: string, template: any): void;
}

class HybridSoundManager implements AdvancedSoundManager {
  private audioElements: Map<string, HTMLAudioElement> = new Map();
  private activeSounds: Map<string, string> = new Map(); // soundId -> webAudio soundId
  private globalVolume = 1;
  private enabled = true;
  private useWebAudio = true;
  private analyser: AnalyserNode | null = null;

  constructor() {
    // Load settings from localStorage
    const soundEnabled = localStorage.getItem('sound');
    if (soundEnabled !== null) {
      this.enabled = JSON.parse(soundEnabled);
    }

    // Check Web Audio API support
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      this.useWebAudio = !!AudioContext;
    } catch (error) {
      console.warn('Web Audio API not supported, falling back to HTML Audio');
      this.useWebAudio = false;
    }

    // Initialize analyser for Web Audio
    if (this.useWebAudio) {
      this.initializeAnalyser();
    }
  }

  private initializeAnalyser(): void {
    const context = webAudioEngine.getContext();
    if (context) {
      this.analyser = context.createAnalyser();
      this.analyser.fftSize = 256;
      // Note: In a real implementation, you'd connect this to your audio chain
    }
  }

  async play(src: string, options: SoundOptions = {}): Promise<void> {
    if (!this.enabled) return;

    if (this.useWebAudio && this.isAudioFile(src)) {
      try {
        const soundId = await webAudioEngine.createSound(src, {
          volume: (options.volume ?? 1) * this.globalVolume,
          loop: options.loop
        });
        webAudioEngine.playSound(soundId);
        this.activeSounds.set(soundId, soundId);
        return;
      } catch (error) {
        console.warn('Web Audio failed, falling back to HTML Audio:', error);
      }
    }

    // Fallback to HTML Audio
    return this.playWithHTMLAudio(src, options);
  }

  private isAudioFile(src: string): boolean {
    const audioExtensions = ['.mp3', '.wav', '.ogg', '.m4a', '.aac'];
    return audioExtensions.some(ext => src.toLowerCase().includes(ext));
  }

  private async playWithHTMLAudio(src: string, options: SoundOptions = {}): Promise<void> {
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

  async playTemplate(template: string, params: Record<string, any> = {}): Promise<string> {
    if (!this.enabled || !this.useWebAudio) {
      throw new Error('Web Audio API required for template playback');
    }

    const soundId = await webAudioEngine.createSound(template, {
      ...params,
      volume: (params.volume ?? 1) * this.globalVolume
    });

    webAudioEngine.playSound(soundId);
    this.activeSounds.set(soundId, soundId);

    return soundId;
  }

  async playTone(
    frequency: number,
    duration: number = 1,
    options: SoundOptions = {}
  ): Promise<string> {
    return this.playTemplate('tone', {
      frequency,
      duration,
      volume: options.volume,
      type: 'sine'
    });
  }

  async playBeep(options: { frequency?: number; duration?: number } = {}): Promise<string> {
    return this.playTemplate('beep', {
      frequency: options.frequency ?? 800,
      duration: options.duration ?? 0.1
    });
  }

  async playNoise(
    type: 'white' | 'pink',
    duration: number = 1,
    options: SoundOptions = {}
  ): Promise<string> {
    return this.playTemplate('noise', {
      type,
      duration,
      volume: options.volume
    });
  }

  createEffect(type: string, params: Record<string, any> = {}): string {
    if (!this.useWebAudio) {
      throw new Error('Web Audio API required for effects');
    }
    return webAudioEngine.createEffect(type, params);
  }

  applyEffect(soundId: string, effectId: string): void {
    // Implementation would connect the sound to the effect
    // This requires more complex audio graph management
    console.warn('Effect application not yet implemented');
  }

  async scheduledPlay(
    src: string,
    when: number,
    options: SoundOptions = {}
  ): Promise<string> {
    if (!this.enabled || !this.useWebAudio) {
      throw new Error('Web Audio API required for scheduled playback');
    }

    const soundId = await webAudioEngine.createSound(src, {
      volume: (options.volume ?? 1) * this.globalVolume
    });

    webAudioEngine.playSound(soundId, when);
    this.activeSounds.set(soundId, soundId);

    return soundId;
  }

  fadeIn(soundId: string, duration: number): void {
    // Implementation for fade in effect
    const context = webAudioEngine.getContext();
    if (context && this.activeSounds.has(soundId)) {
      // This would require access to the sound's gain node
      console.warn('Fade in not yet implemented');
    }
  }

  fadeOut(soundId: string, duration: number): void {
    // Implementation for fade out effect
    const context = webAudioEngine.getContext();
    if (context && this.activeSounds.has(soundId)) {
      // This would require access to the sound's gain node
      console.warn('Fade out not yet implemented');
    }
  }

  getAnalyser(): AnalyserNode | null {
    return this.analyser;
  }

  registerSoundTemplate(name: string, template: any): void {
    if (this.useWebAudio) {
      webAudioEngine.registerTemplate(name, template);
    }
  }

  stopAll(): void {
    // Stop Web Audio sounds
    if (this.useWebAudio) {
      webAudioEngine.stopAllSounds();
      this.activeSounds.clear();
    }

    // Stop HTML Audio elements
    this.audioElements.forEach((audio) => {
      audio.pause();
      audio.currentTime = 0;
    });
  }

  setGlobalVolume(volume: number): void {
    this.globalVolume = Math.max(0, Math.min(1, volume));

    if (this.useWebAudio) {
      webAudioEngine.setMasterVolume(volume);
    }
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

    if (this.useWebAudio) {
      webAudioEngine.setEnabled(enabled);
    }
  }
}

// Export both the basic manager (for backward compatibility) and the advanced manager
export const soundManager: SoundManager = new HybridSoundManager();
export const advancedSoundManager: AdvancedSoundManager = soundManager as AdvancedSoundManager;

export interface SoundOptions {
  volume?: number;
  loop?: boolean;
}

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
